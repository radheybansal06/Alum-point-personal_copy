import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MdCloudUpload as Upload } from 'react-icons/md';
import { FiFileText as FileText } from 'react-icons/fi';
import { HiCheckCircle as CheckCircle, HiExclamationTriangle as Warning } from 'react-icons/hi2';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResumeUpload = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [dependenciesAvailable, setDependenciesAvailable] = useState(null);

  const supportedFormats = [
    'PDF', 'DOCX', 'ODT', 'HTML', 'TXT', 
    'PNG', 'JPG', 'JPEG', 'TIFF', 'BMP'
  ];

  // Check dependencies on component mount
  useEffect(() => {
    checkDependencies();
  }, []);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData(null);
    }
  };

  const checkDependencies = async () => {
    try {
      console.log('[ResumeUpload] Checking dependencies...');
      // Add cache-busting parameter
      const response = await axios.get(`/api/alumni/check-dependencies?t=${Date.now()}`);
      console.log('[ResumeUpload] Dependencies response:', response.data);
      setDependenciesAvailable(response.data.dependenciesAvailable);
      return response.data.dependenciesAvailable;
    } catch (error) {
      console.error('[ResumeUpload] Error checking dependencies:', error);
      setDependenciesAvailable(false);
      return false;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a resume file');
      return;
    }

    // Check dependencies first
    const depsAvailable = await checkDependencies();
    if (!depsAvailable) {
      toast.error('Resume parser dependencies are not installed. Please contact admin.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('/api/alumni/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setParsedData(response.data.parsedData);
      toast.success('Resume uploaded and parsed successfully!');
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.alumni);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upload and parse resume';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <FileText className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
      </div>

      {/* Dependencies Status */}
      {dependenciesAvailable !== null && (
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
          dependenciesAvailable 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {dependenciesAvailable ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <Warning className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={`text-sm ${
              dependenciesAvailable ? 'text-green-700' : 'text-red-700'
            }`}>
              {dependenciesAvailable 
                ? 'Resume parser is ready' 
                : 'Resume parser dependencies not installed'}
            </span>
          </div>
          <button
            onClick={checkDependencies}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
          >
            Refresh
          </button>
        </div>
      )}

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          id="resume-upload"
          accept=".pdf,.docx,.odt,.html,.htm,.txt,.png,.jpg,.jpeg,.tiff,.bmp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor="resume-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {file ? file.name : 'Click to upload resume'}
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: {supportedFormats.join(', ')}
          </p>
          {file && (
            <p className="text-xs text-gray-400 mt-2">
              Size: {formatFileSize(file.size)}
            </p>
          )}
        </label>
      </div>

      {/* Upload Button */}
      {file && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading || dependenciesAvailable === false}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              uploading || dependenciesAvailable === false
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Processing Resume...' : 'Upload & Parse Resume'}
          </button>
          {dependenciesAvailable === false && (
            <p className="text-sm text-red-600 mt-2">
              Resume parser dependencies are not available. Please contact admin.
            </p>
          )}
          {dependenciesAvailable === null && (
            <p className="text-sm text-yellow-600 mt-2">
              Checking dependencies...
            </p>
          )}
        </div>
      )}

      {/* Parsed Data Preview */}
      {parsedData && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-medium text-green-800 mb-3">Resume Parsed Successfully!</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Professional Summary:</span> {parsedData.professional_summary ? 'Extracted' : 'Not found'}</p>
            <p><span className="font-medium">Work History:</span> {parsedData.work_history?.length || 0} positions</p>
            <p><span className="font-medium">Education:</span> {parsedData.education_history?.length || 0} entries</p>
            <p><span className="font-medium">Skills:</span> {Object.values(parsedData.detailed_skills || {}).flat().length} skills extracted</p>
            <p><span className="font-medium">Projects:</span> {parsedData.projects?.length || 0} projects</p>
            <p><span className="font-medium">Achievements:</span> {parsedData.achievements?.length || 0} achievements</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
