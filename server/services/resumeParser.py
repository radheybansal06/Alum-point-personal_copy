#!/usr/bin/env python3
"""
Resume Parser Service for AlumPoint
This service integrates the Python resume parser with the Node.js application.
"""

import sys
import json
import os
import logging
from typing import Dict, Any

# Add the current directory to Python path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from structured_parser import StructuredResumeParser, ParsingError
except ImportError as e:
    print(f"Error importing structured_parser: {e}", file=sys.stderr)
    sys.exit(1)

# Configure logging to stderr to avoid interfering with JSON output
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', stream=sys.stderr)
logger = logging.getLogger(__name__)

class ResumeParserService:
    """Service wrapper for the resume parser to be called from Node.js"""
    
    def __init__(self):
        try:
            self.parser = StructuredResumeParser()
            logger.info("ResumeParserService initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ResumeParserService: {e}")
            raise

    def parse_resume(self, file_path: str) -> Dict[str, Any]:
        """
        Parse a resume file and return structured data
        
        Args:
            file_path (str): Path to the resume file
            
        Returns:
            Dict[str, Any]: Structured resume data matching the Alumni schema
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Resume file not found: {file_path}")
            
            logger.info(f"Parsing resume: {file_path}")
            structured_data = self.parser.parse_and_structure(file_path)
            
            # Validate that we have the expected structure
            required_fields = [
                'professional_summary', 'contact_details', 'work_history',
                'education_history', 'detailed_skills', 'projects', 'achievements'
            ]
            
            for field in required_fields:
                if field not in structured_data:
                    logger.warning(f"Missing field '{field}' in parsed data, adding default")
                    if field == 'contact_details':
                        structured_data[field] = {'phone': None, 'location': None}
                    elif field == 'detailed_skills':
                        structured_data[field] = {
                            'languages': [], 'web_development': [], 
                            'frameworks_and_libraries': [], 'tools_and_platforms': [], 'concepts': []
                        }
                    else:
                        structured_data[field] = []
            
            logger.info("Resume parsed successfully")
            return structured_data
            
        except Exception as e:
            logger.error(f"Error parsing resume: {e}")
            raise

def main():
    """Main function to handle command line calls from Node.js"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python resumeParser.py <file_path>"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        service = ResumeParserService()
        result = service.parse_resume(file_path)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        error_result = {"error": str(e)}
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
