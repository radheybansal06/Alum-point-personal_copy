import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaRegUser as User } from 'react-icons/fa';
import { MdFileUpload as Upload } from 'react-icons/md';
import { FiSave as Save } from 'react-icons/fi';
import { LuPencilLine as Edit3 } from 'react-icons/lu';
import { HiPlus as Plus, HiMinus as Minus } from 'react-icons/hi';
import ResumeUpload from './ResumeUpload';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfilePanel = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/profile');
      setProfile(response.data.profile);
      setFormData(response.data.profile);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleArrayChange = (name, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    
    if (name.includes('.')) {
      // Handle nested arrays like detailed_skills.languages
      const [parentKey, childKey] = name.split('.');
      setFormData({
        ...formData,
        [parentKey]: {
          ...formData[parentKey],
          [childKey]: array
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: array
      });
    }
  };

  const handleNestedChange = (parentKey, childKey, value) => {
    setFormData({
      ...formData,
      [parentKey]: {
        ...formData[parentKey],
        [childKey]: value
      }
    });
  };

  const handleArrayItemChange = (name, index, field, value) => {
    const newArray = [...(formData[name] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData({
      ...formData,
      [name]: newArray
    });
  };

  const addArrayItem = (name, defaultItem = {}) => {
    setFormData({
      ...formData,
      [name]: [...(formData[name] || []), defaultItem]
    });
  };

  const removeArrayItem = (name, index) => {
    const newArray = [...(formData[name] || [])];
    newArray.splice(index, 1);
    setFormData({
      ...formData,
      [name]: newArray
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put('/api/profile', formData);
      updateUser(formData);
      setEditing(false);
      toast.success('Profile updated successfully!');
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await axios.post(`/api/profile/upload-${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`${type} uploaded successfully!`);
      loadProfile();
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your profile information</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {editing ? <Save className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            {/* Profile Picture (Students only) */}
            {user?.type === 'student' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {profile?.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload(e.target.files[0], 'picture');
                        }
                      }}
                      className="hidden"
                      id="profile-picture"
                    />
                    <label
                      htmlFor="profile-picture"
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Picture
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll/Registration Number
                </label>
                <input
                  type="text"
                  value={profile?.roll_no || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={profile?.department || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {user?.type === 'alumni' ? 'Graduation Year' : 'Expected Graduation Year'}
                </label>
                <input
                  type="number"
                  name={user?.type === 'alumni' ? 'grad_year' : 'grad_year_expected'}
                  value={formData[user?.type === 'alumni' ? 'grad_year' : 'grad_year_expected'] || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Alumni-specific fields */}
          {user?.type === 'alumni' && (
            <>
              {/* Professional Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <span className="mr-2">💼</span>
                      LinkedIn
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin || ''}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-blue-400">🔗</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <span className="mr-2">💻</span>
                      GitHub
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="github"
                        value={formData.github || ''}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="https://github.com/yourusername"
                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔗</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Summary
                  </label>
                  <textarea
                    name="professional_summary"
                    value={formData.professional_summary || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={4}
                    placeholder="Professional summary extracted from resume..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_details?.phone || ''}
                      onChange={(e) => handleNestedChange('contact_details', 'phone', e.target.value)}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.contact_details?.location || ''}
                      onChange={(e) => handleNestedChange('contact_details', 'location', e.target.value)}
                      disabled={!editing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Work History */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Work History</h2>
                  {editing && (
                    <button
                      onClick={() => addArrayItem('work_history', { title: '', company: '', start_date: '', end_date: '', description: '' })}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  )}
                </div>
                
                {(formData.work_history || []).map((work, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Work Experience {index + 1}</h3>
                      {editing && (
                        <button
                          onClick={() => removeArrayItem('work_history', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={work.title || ''}
                          onChange={(e) => handleArrayItemChange('work_history', index, 'title', e.target.value)}
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={work.company || ''}
                          onChange={(e) => handleArrayItemChange('work_history', index, 'company', e.target.value)}
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={work.start_date || ''}
                          onChange={(e) => handleArrayItemChange('work_history', index, 'start_date', e.target.value)}
                          disabled={!editing}
                          placeholder="e.g., Jan 2020"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="text"
                          value={work.end_date || ''}
                          onChange={(e) => handleArrayItemChange('work_history', index, 'end_date', e.target.value)}
                          disabled={!editing}
                          placeholder="e.g., Present or Dec 2022"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={work.description || ''}
                        onChange={(e) => handleArrayItemChange('work_history', index, 'description', e.target.value)}
                        disabled={!editing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Education History */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Education History</h2>
                  {editing && (
                    <button
                      onClick={() => addArrayItem('education_history', { institution: '', degree: '', gpa: '', end_year: '' })}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  )}
                </div>
                
                {(formData.education_history || []).map((education, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Education {index + 1}</h3>
                      {editing && (
                        <button
                          onClick={() => removeArrayItem('education_history', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          value={education.institution || ''}
                          onChange={(e) => handleArrayItemChange('education_history', index, 'institution', e.target.value)}
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                          type="text"
                          value={education.degree || ''}
                          onChange={(e) => handleArrayItemChange('education_history', index, 'degree', e.target.value)}
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                        <input
                          type="text"
                          value={education.gpa || ''}
                          onChange={(e) => handleArrayItemChange('education_history', index, 'gpa', e.target.value)}
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                        <input
                          type="number"
                          value={education.end_year || ''}
                          onChange={(e) => handleArrayItemChange('education_history', index, 'end_year', parseInt(e.target.value))}
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Skills */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Skills</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programming Languages
                    </label>
                    <input
                      type="text"
                      value={formData.detailed_skills?.languages ? formData.detailed_skills.languages.join(', ') : ''}
                      onChange={(e) => handleArrayChange('detailed_skills.languages', e.target.value)}
                      disabled={!editing}
                      placeholder="JavaScript, Python, Java..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Web Development
                    </label>
                    <input
                      type="text"
                      value={formData.detailed_skills?.web_development ? formData.detailed_skills.web_development.join(', ') : ''}
                      onChange={(e) => handleArrayChange('detailed_skills.web_development', e.target.value)}
                      disabled={!editing}
                      placeholder="HTML, CSS, React..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frameworks & Libraries
                    </label>
                    <input
                      type="text"
                      value={formData.detailed_skills?.frameworks_and_libraries ? formData.detailed_skills.frameworks_and_libraries.join(', ') : ''}
                      onChange={(e) => handleArrayChange('detailed_skills.frameworks_and_libraries', e.target.value)}
                      disabled={!editing}
                      placeholder="Express.js, Django, Spring..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tools & Platforms
                    </label>
                    <input
                      type="text"
                      value={formData.detailed_skills?.tools_and_platforms ? formData.detailed_skills.tools_and_platforms.join(', ') : ''}
                      onChange={(e) => handleArrayChange('detailed_skills.tools_and_platforms', e.target.value)}
                      disabled={!editing}
                      placeholder="Docker, AWS, Git..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concepts
                  </label>
                  <input
                    type="text"
                    value={formData.detailed_skills?.concepts ? formData.detailed_skills.concepts.join(', ') : ''}
                    onChange={(e) => handleArrayChange('detailed_skills.concepts', e.target.value)}
                    disabled={!editing}
                    placeholder="Microservices, Agile, Data Structures..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Projects */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                  {editing && (
                    <button
                      onClick={() => addArrayItem('projects', { name: '', description: '' })}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  )}
                </div>
                
                {(formData.projects || []).map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">Project {index + 1}</h3>
                      {editing && (
                        <button
                          onClick={() => removeArrayItem('projects', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={project.name || ''}
                        onChange={(e) => handleArrayItemChange('projects', index, 'name', e.target.value)}
                        disabled={!editing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={project.description || ''}
                        onChange={(e) => handleArrayItemChange('projects', index, 'description', e.target.value)}
                        disabled={!editing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
                  {editing && (
                    <button
                      onClick={() => addArrayItem('achievements', '')}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  )}
                </div>
                
                {(formData.achievements || []).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={achievement || ''}
                      onChange={(e) => {
                        const newAchievements = [...(formData.achievements || [])];
                        newAchievements[index] = e.target.value;
                        setFormData({ ...formData, achievements: newAchievements });
                      }}
                      disabled={!editing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    {editing && (
                      <button
                        onClick={() => removeArrayItem('achievements', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Resume Upload Section */}
              <ResumeUpload onUploadSuccess={(updatedAlumni) => {
                setProfile(updatedAlumni);
                setFormData(updatedAlumni);
                toast.success('Profile updated with resume data!');
              }} />
            </>
          )}

          {/* Skills (for all users) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
            <input
              type="text"
              value={formData.skills ? formData.skills.join(', ') : ''}
              onChange={(e) => handleArrayChange('skills', e.target.value)}
              disabled={!editing}
              placeholder="Enter skills separated by commas"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          {/* Interests (Students only) */}
          {user?.type === 'student' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interests</h2>
              <input
                type="text"
                value={formData.interests ? formData.interests.join(', ') : ''}
                onChange={(e) => handleArrayChange('interests', e.target.value)}
                disabled={!editing}
                placeholder="Enter interests separated by commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          )}

          {/* Save Button */}
          {editing && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;