import json
import os
import sys
import logging
import time
import random
from dotenv import load_dotenv # type: ignore
import google.generativeai as genai # type: ignore
from typing import Dict, Any

# Import only the specific classes and custom exceptions from resume_parser
from resume_parser import ResumeParser, ParsingError

# --- Configuration & Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()
api_key = os.getenv("GEMINI_API_key")
if not api_key:
    raise ValueError("GEMINI_API_key not found in .env file. Please create a .env file and add your key.")

genai.configure(api_key=api_key) # type: ignore


class StructuredResumeParser:
    """
    Orchestrates the resume parsing pipeline to produce a JSON object that strictly
    matches the target Mongoose schema for direct MongoDB insertion.
    """
    def __init__(self, model_name: str = 'models/gemini-1.5-flash-latest'):
        self.raw_parser = ResumeParser()
        self.llm_model = genai.GenerativeModel(model_name) # type: ignore
        logger.info("StructuredResumeParser initialized with model: %s", model_name)

    def _get_llm_prompt(self, raw_text: str) -> str:
        """
        Constructs the detailed, engineered prompt for the LLM.
        This prompt's JSON schema is an EXACT MATCH for the new fields in the Mongoose alumniSchema.
        """
        return f"""
        You are an expert AI data extraction assistant. Your task is to analyze the raw resume text and convert it into a structured JSON object.
        The output JSON MUST strictly follow the schema provided below. This JSON will be used to directly update a MongoDB document.

        **JSON Schema to follow:**

        {{
          "professional_summary": "string",
          "contact_details": {{
            "phone": "string | null",
            "location": "string | null",
            "linkedin": "string | null",
            "github": "string | null"
          }},
          "work_history": [
            {{
              "title": "string",
              "company": "string",
              "start_date": "string (e.g., 'Month YYYY')",
              "end_date": "string (e.g., 'Month YYYY' or 'Present')",
              "description": "string (A brief summary of the role)"
            }}
          ],
          "education_history": [
            {{
              "institution": "string",
              "degree": "string",
              "gpa": "string | null",
              "end_year": "number"
            }}
          ],
          "detailed_skills": {{
            "languages": ["string"],
            "web_development": ["string"],
            "frameworks_and_libraries": ["string"],
            "tools_and_platforms": ["string"],
            "concepts": ["string"]
          }},
          "projects": [
            {{
              "name": "string",
              "description": "string"
            }}
          ],
          "achievements": ["string"]
        }}

        **Instructions:**
        - Adhere strictly to the field names and data structures in the schema.
        - If a value for a field is not found in the resume, use `null` for optional fields or an empty array `[]` for lists.
        - Do not create any fields that are not in the schema.
        - Your final output must only be the raw JSON object, without any surrounding text, comments, or markdown formatting like ```json.

        **Raw Resume Text to Parse:**
        ---
        {raw_text}
        ---
        """

    def _structure_with_llm_robust(self, raw_text: str) -> Dict[str, Any]:
        """
        Private method that sends text to the LLM and handles rate limits
        with exponential backoff and retries.
        """
        prompt = self._get_llm_prompt(raw_text)
        max_retries = 5
        base_wait_time = 2  # Start with a 2-second wait

        for attempt in range(max_retries):
            try:
                response = self.llm_model.generate_content(prompt) # type: ignore
                json_response_text = response.text.strip().replace("```json", "").replace("```", "")
                
                structured_data = json.loads(json_response_text)
                logger.info("Successfully received and parsed structured data from LLM.")
                return structured_data
            
            except Exception as e:
                error_str = str(e)
                if ("RATE_LIMIT_EXCEEDED" in error_str or "Quota exceeded" in error_str) and attempt < max_retries - 1:
                    wait_time = base_wait_time * (2 ** attempt) + random.uniform(0, 1)
                    logger.warning("Rate limit/Quota exceeded (attempt %d/%d). Retrying in %.2f seconds...", attempt + 1, max_retries, wait_time)
                    time.sleep(wait_time)
                else:
                    logger.error("An unrecoverable error occurred during LLM structuring after %d attempts: %s", attempt + 1, e)
                    raise ParsingError(f"Failed to structure data after {attempt + 1} attempts. Last error: {e}") from e
        
        raise ParsingError(f"Failed to get a successful LLM response after {max_retries} retries.")


    def parse_and_structure(self, file_input: str | bytes) -> Dict[str, Any]:
        """
        Public method to perform the full parsing and structuring pipeline.
        """
        logger.info("Starting end-to-end parsing and structuring process...")
        
        raw_text = self.raw_parser.parse(file_input)
        
        if not raw_text or not raw_text.strip():
            raise ParsingError("The extracted text from the file is empty. Cannot proceed with structuring.")

        logger.info("Raw text extracted. Sending to LLM for structuring with retries...")
        return self._structure_with_llm_robust(raw_text)

# --- Usage Example ---
if __name__ == '__main__':
    # This example demonstrates parsing the DOCX file you provided.
    resume_file_path = "Rajesh_Jha_ATS_Resume_UPDATED.docx"

    if not os.path.exists(resume_file_path):
        print(f"Error: The file '{resume_file_path}' was not found.", file=sys.stderr)
    else:
        parser = StructuredResumeParser()
        try:
            final_json_data = parser.parse_and_structure(resume_file_path)
            
            print("\n--- ✅ Final Structured JSON Output (Matches Mongoose Schema) ---", file=sys.stderr)
            print(json.dumps(final_json_data, indent=2), file=sys.stderr)

            output_filename = "parsed_resume_for_db.json"
            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(final_json_data, f, indent=2, ensure_ascii=False)
            print(f"\nSuccessfully saved structured data to '{output_filename}'", file=sys.stderr)

        except (ValueError, ParsingError, NotImplementedError, RuntimeError) as e:
            print(f"\n--- ❌ An error occurred ---", file=sys.stderr)
            print(e, file=sys.stderr)
