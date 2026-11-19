import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PiBriefcaseBold as Briefcase } from 'react-icons/pi';
import { HiPlus as Plus } from 'react-icons/hi';
import { FiFilter as Filter } from 'react-icons/fi';
import { GoLocation as MapPin } from 'react-icons/go';
import { LuCalendar as Calendar } from 'react-icons/lu';
import { FaUsers as Users } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const OpportunitiesPanel = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    company: '',
    experience_level: ''
  });

  useEffect(() => {
    loadOpportunities();
    if (user?.type === 'alumni') {
      loadMyOpportunities();
    } else if (user?.type === 'student') {
      loadMyApplications();
    }
  }, [user]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.company) params.append('company', filters.company);
      if (filters.experience_level) params.append('experience_level', filters.experience_level);
      
      const response = await axios.get(`/api/opportunities?${params}`);
      setOpportunities(response.data.opportunities);
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const loadMyOpportunities = async () => {
    try {
      const response = await axios.get('/api/opportunities/my/opportunities');
      setMyOpportunities(response.data.opportunities);
    } catch (error) {
      toast.error('Failed to load your opportunities');
    }
  };

  const loadMyApplications = async () => {
    try {
      const response = await axios.get('/api/opportunities/my/applications');
      setMyApplications(response.data.applications);
    } catch (error) {
      toast.error('Failed to load your applications');
    }
  };

  const applyToOpportunity = async (opportunityId, coverLetter = '') => {
    try {
      await axios.post(`/api/opportunities/${opportunityId}/apply`, {
        cover_letter: coverLetter
      });
      toast.success('Application submitted successfully!');
      loadOpportunities();
      loadMyApplications();
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const createOpportunity = async (opportunityData) => {
    try {
      await axios.post('/api/opportunities', opportunityData);
      toast.success('Opportunity created successfully!');
      setShowCreateForm(false);
      loadMyOpportunities();
    } catch (error) {
      toast.error('Failed to create opportunity');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
            <p className="text-gray-600 mt-1">
              {user?.type === 'alumni' 
                ? 'Share opportunities with students' 
                : 'Discover internships, jobs, and freelance opportunities'}
            </p>
          </div>
          {user?.type === 'alumni' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Opportunity
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Browse Opportunities
            </button>
            {user?.type === 'alumni' && (
              <button
                onClick={() => setActiveTab('my-opportunities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-opportunities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Opportunities ({myOpportunities.length})
              </button>
            )}
            {user?.type === 'student' && (
              <button
                onClick={() => setActiveTab('my-applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Applications ({myApplications.length})
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'browse' && (
          <div className="max-w-6xl mx-auto">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="internship">Internship</option>
                  <option value="job">Job</option>
                  <option value="freelance">Freelance</option>
                  <option value="project">Project</option>
                </select>
                <select
                  value={filters.experience_level}
                  onChange={(e) => setFilters({...filters, experience_level: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
                <input
                  type="text"
                  placeholder="Company name"
                  value={filters.company}
                  onChange={(e) => setFilters({...filters, company: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={loadOpportunities}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Opportunities List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                            {opportunity.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{opportunity.company}</p>
                        <p className="text-gray-700 mb-4">{opportunity.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {opportunity.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {opportunity.location}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {opportunity.experience_level} level
                          </div>
                          {opportunity.application_deadline && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Apply by {new Date(opportunity.application_deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {opportunity.skills_required && opportunity.skills_required.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {opportunity.skills_required.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {user?.type === 'student' && (
                        <button
                          onClick={() => {
                            const coverLetter = prompt('Enter your cover letter (optional):');
                            applyToOpportunity(opportunity.id, coverLetter);
                          }}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later</p>
              </div>
            )}
          </div>
        )}

        {/* My Applications (Student) */}
        {activeTab === 'my-applications' && user?.type === 'student' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">My Applications</h2>
            {myApplications.length > 0 ? (
              <div className="space-y-4">
                {myApplications.map((app) => (
                  <div key={app.opportunity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{app.opportunity.title}</h3>
                        <p className="text-gray-600">{app.opportunity.company}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied on {new Date(app.application.applied_at).toLocaleDateString()}
                        </p>
                        {app.application.cover_letter && (
                          <p className="mt-2 text-sm text-gray-700">{app.application.cover_letter}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.application.status)}`}>
                        {app.application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600">Start applying to opportunities to see them here</p>
              </div>
            )}
          </div>
        )}

        {/* My Opportunities (Alumni) */}
        {activeTab === 'my-opportunities' && user?.type === 'alumni' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">My Posted Opportunities</h2>
            {myOpportunities.length > 0 ? (
              <div className="space-y-4">
                {myOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                        <p className="text-gray-600">{opportunity.company}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {opportunity.applications.length} applications
                        </p>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                          View Applications
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities posted yet</h3>
                <p className="text-gray-600">Start sharing opportunities with students</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunitiesPanel;