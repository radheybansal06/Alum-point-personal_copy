# Resume Parser Integration Setup

This guide will help you set up the Python resume parser integration with the AlumPoint application.

## Prerequisites

1. **Python 3.8+** installed on your system
2. **Google Gemini API Key** for AI-powered resume parsing
3. **Node.js** application running

## 1. Install Python Dependencies

Navigate to the `server/services` directory and install the required Python packages:

```bash
cd server/services
pip install -r requirements.txt
```

### Required Dependencies:
- `PyMuPDF` - PDF parsing
- `python-docx` - DOCX parsing
- `odfpy` - ODT parsing
- `beautifulsoup4` - HTML parsing
- `Pillow` - Image processing
- `pytesseract` - OCR for images
- `python-magic` - File type detection
- `google-generativeai` - AI/LLM integration
- `python-dotenv` - Environment variables

## 2. Install System Dependencies

### For OCR (Image Processing):
- **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
- **macOS**: `brew install tesseract`
- **Windows**: Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)

### For python-magic:
- **Ubuntu/Debian**: `sudo apt-get install libmagic1`
- **macOS**: `brew install libmagic`
- **Windows**: Download from [GitHub](https://github.com/ahupp/python-magic-bin)

## 3. Configure Environment Variables

Create a `.env` file in the `server/services` directory:

```env
GEMINI_API_key=your_gemini_api_key_here
```

### Getting Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env` file

## 4. Test the Integration

### Test Python Dependencies:
```bash
cd server/services
python3 -c "import google.generativeai, fitz, docx, bs4, PIL, pytesseract, magic; print('All dependencies installed successfully!')"
```

### Test Resume Parser:
```bash
cd server/services
python3 resumeParser.py path/to/your/resume.pdf
```

## 5. API Endpoints

The following endpoints are now available:

### Alumni Routes:
- `POST /api/alumni/upload-resume` - Upload and parse resume
- `GET /api/alumni/resume-data` - Get parsed resume data
- `GET /api/alumni/check-dependencies` - Check if parser dependencies are available
- `GET /api/alumni/profile` - Get alumni profile
- `PUT /api/alumni/profile` - Update alumni profile

## 6. Frontend Integration

The resume upload functionality is integrated into the Profile Panel for alumni users:

1. **Alumni Login** → **My Profile** → **Resume Upload Section**
2. **Upload Resume** → **Automatic Parsing** → **Profile Update**

## 7. Supported File Formats

- **PDF** (.pdf)
- **Word Documents** (.docx)
- **OpenDocument Text** (.odt)
- **HTML** (.html, .htm)
- **Plain Text** (.txt)
- **Images** (.png, .jpg, .jpeg, .tiff, .bmp)

## 8. Parsed Data Structure

The parser extracts the following information:

```json
{
  "professional_summary": "string",
  "contact_details": {
    "phone": "string | null",
    "location": "string | null"
  },
  "work_history": [
    {
      "title": "string",
      "company": "string",
      "start_date": "string",
      "end_date": "string",
      "description": "string"
    }
  ],
  "education_history": [
    {
      "institution": "string",
      "degree": "string",
      "gpa": "string | null",
      "end_year": "number"
    }
  ],
  "detailed_skills": {
    "languages": ["string"],
    "web_development": ["string"],
    "frameworks_and_libraries": ["string"],
    "tools_and_platforms": ["string"],
    "concepts": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string"
    }
  ],
  "achievements": ["string"]
}
```

## 9. Troubleshooting

### Common Issues:

1. **"Python not found"**
   - Ensure Python 3.8+ is installed and in PATH
   - Try using `python` instead of `python3`

2. **"Module not found"**
   - Run `pip install -r requirements.txt` again
   - Check if you're in the correct directory

3. **"Tesseract not found"**
   - Install Tesseract OCR for your system
   - Ensure it's in your system PATH

4. **"API key not found"**
   - Check your `.env` file in `server/services`
   - Ensure the key is valid and has proper permissions

5. **"Rate limit exceeded"**
   - The parser includes automatic retry logic
   - Check your Gemini API quota

### Debug Mode:
Set `EMAIL_DEBUG=true` in your main `.env` file to see detailed logs.

## 10. Production Considerations

1. **API Limits**: Monitor your Gemini API usage
2. **File Size**: Large files may take longer to process
3. **Error Handling**: The system includes comprehensive error handling
4. **Security**: Resume files are temporarily stored and cleaned up after processing

## 11. Workflow

1. **Admin** uploads minimal alumni data via CSV
2. **Alumni** receives login credentials via email
3. **Alumni** logs in and uploads resume
4. **System** automatically parses and populates profile
5. **Alumni** can manually edit any parsed data
6. **Rich data** enables advanced mentorship search and matching

The resume parser integration is now complete and ready for use! 🚀
