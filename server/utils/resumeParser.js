const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Resume Parser Utility for AlumPoint
 * Integrates with Python resume parser service
 */
class ResumeParser {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, '../services/resumeParser.py');
    this.dependenciesCheckPromise = null;
    this.dependenciesAvailable = null;
  }

  /**
   * Get the correct Python command for the system
   * @returns {Promise<string>} - Python command (python3 or python)
   */
  async getPythonCommand() {
    return new Promise((resolve) => {
      const pythonCommands = ['python3', 'python'];
      let currentCommandIndex = 0;

      const tryNextCommand = () => {
        if (currentCommandIndex >= pythonCommands.length) {
          resolve('python'); // fallback
          return;
        }

        const pythonCommand = pythonCommands[currentCommandIndex];
        const pythonProcess = spawn(pythonCommand, ['--version'], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        pythonProcess.on('close', (code) => {
          if (code === 0) {
            resolve(pythonCommand);
          } else {
            currentCommandIndex++;
            tryNextCommand();
          }
        });

        pythonProcess.on('error', () => {
          currentCommandIndex++;
          tryNextCommand();
        });
      };

      tryNextCommand();
    });
  }

  /**
   * Parse a resume file using the Python service
   * @param {string} filePath - Path to the resume file
   * @returns {Promise<Object>} - Structured resume data
   */
  async parseResume(filePath) {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Resume file not found: ${filePath}`);
    }

    // Check if Python script exists
    if (!fs.existsSync(this.pythonScriptPath)) {
      throw new Error(`Python resume parser script not found: ${this.pythonScriptPath}`);
    }

    console.log(`[ResumeParser] Parsing resume: ${filePath}`);

    // Get Python command
    const pythonCommand = await this.getPythonCommand();

    return new Promise((resolve, reject) => {
      // Spawn Python process
      const pythonProcess = spawn(pythonCommand, [this.pythonScriptPath, filePath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            
            // Check if the result contains an error
            if (result.error) {
              reject(new Error(`Resume parsing failed: ${result.error}`));
              return;
            }

            console.log('[ResumeParser] Resume parsed successfully');
            resolve(result);
          } catch (parseError) {
            console.error('[ResumeParser] Failed to parse JSON output:', stdout);
            reject(new Error(`Failed to parse Python output: ${parseError.message}`));
          }
        } else {
          console.error('[ResumeParser] Python process failed with code:', code);
          console.error('[ResumeParser] stderr:', stderr);
          reject(new Error(`Python resume parser failed with exit code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('[ResumeParser] Failed to start Python process:', error);
        reject(new Error(`Failed to start Python resume parser: ${error.message}`));
      });
    });
  }

  /**
   * Update alumni record with parsed resume data
   * @param {string} alumniId - MongoDB ObjectId of the alumni
   * @param {Object} resumeData - Parsed resume data
   * @returns {Promise<Object>} - Updated alumni record
   */
  async updateAlumniFromResume(alumniId, resumeData) {
    try {
      const Alumni = require('../models/Alumni');
      
      // Prepare update data with proper field mapping
      const updateData = {
        professional_summary: resumeData.professional_summary || '',
        contact_details: resumeData.contact_details || { 
          phone: null, 
          location: null,
          linkedin: null,
          github: null
        },
        work_history: resumeData.work_history || [],
        education_history: resumeData.education_history || [],
        detailed_skills: resumeData.detailed_skills || {
          languages: [],
          web_development: [],
          frameworks_and_libraries: [],
          tools_and_platforms: [],
          concepts: []
        },
        projects: resumeData.projects || [],
        achievements: resumeData.achievements || [],
        // Update LinkedIn and GitHub fields directly if found in contact_details
        linkedin: resumeData.contact_details?.linkedin || '',
        github: resumeData.contact_details?.github || ''
      };

      // Update the alumni record
      const updatedAlumni = await Alumni.findByIdAndUpdate(
        alumniId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedAlumni) {
        throw new Error('Alumni record not found');
      }

      console.log(`[ResumeParser] Updated alumni record: ${alumniId}`);
      return updatedAlumni;
    } catch (error) {
      console.error('[ResumeParser] Failed to update alumni record:', error);
      throw error;
    }
  }

  /**
   * Check if Python dependencies are installed
   * @returns {Promise<boolean>} - True if dependencies are available
   */
  async checkDependencies() {
    // Return cached result if available
    if (this.dependenciesAvailable !== null) {
      console.log(`[ResumeParser] Returning cached result: ${this.dependenciesAvailable}`);
      return this.dependenciesAvailable;
    }

    // If a check is already in progress, wait for it
    if (this.dependenciesCheckPromise) {
      console.log('[ResumeParser] Dependencies check already in progress, waiting...');
      return this.dependenciesCheckPromise;
    }

    // Start new check
    this.dependenciesCheckPromise = new Promise((resolve) => {
      console.log('[ResumeParser] Starting dependencies check...');
      
      // Try python3 first, then python (for Windows compatibility)
      const pythonCommands = ['python3', 'python'];
      let currentCommandIndex = 0;

      const tryNextCommand = () => {
        if (currentCommandIndex >= pythonCommands.length) {
          console.log('[ResumeParser] All Python commands failed, dependencies not available');
          this.dependenciesAvailable = false;
          resolve(false);
          return;
        }

        const pythonCommand = pythonCommands[currentCommandIndex];
        console.log(`[ResumeParser] Testing Python command: ${pythonCommand}`);
        
        const pythonProcess = spawn(pythonCommand, ['-c', 'import google.generativeai, fitz, docx, bs4, PIL, pytesseract, odf'], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
          console.log(`[ResumeParser] Python command ${pythonCommand} exited with code: ${code}`);
          if (stderr) {
            console.log(`[ResumeParser] stderr: ${stderr}`);
          }
          if (stdout) {
            console.log(`[ResumeParser] stdout: ${stdout}`);
          }
          
          if (code === 0) {
            console.log(`[ResumeParser] Dependencies check successful with ${pythonCommand} - RESOLVING TRUE`);
            this.dependenciesAvailable = true;
            resolve(true);
          } else {
            console.log(`[ResumeParser] Python command ${pythonCommand} failed, trying next...`);
            currentCommandIndex++;
            tryNextCommand();
          }
        });

        pythonProcess.on('error', (error) => {
          console.log(`[ResumeParser] Error with Python command ${pythonCommand}:`, error.message);
          currentCommandIndex++;
          tryNextCommand();
        });
      };

      tryNextCommand();
    });

    return this.dependenciesCheckPromise;
  }
}

module.exports = new ResumeParser();
