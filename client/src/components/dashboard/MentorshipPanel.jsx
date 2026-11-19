import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiSearch as Search } from 'react-icons/fi';
import { FaUsers as Users } from 'react-icons/fa';
import { RiMessage2Line as MessageCircle } from 'react-icons/ri';
import { FiClock as Clock } from 'react-icons/fi';
import { HiCheckCircle as CheckCircle } from 'react-icons/hi';
import { HiXCircle as XCircle } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';

const MentorshipPanel = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    if (user?.type === 'alumni') {
      loadMentorshipRequests();
      loadConversations();
    } else if (user?.type === 'student') {
      loadConversations();
    }
  }, [user]);

  const searchMentors = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/mentorship/search', {
        query: searchQuery
      });
      setMentors(response.data.mentors);
    } catch (error) {
      toast.error('Failed to search mentors');
    } finally {
      setLoading(false);
    }
  };

  const loadMentorshipRequests = async () => {
    try {
      const response = await axios.get('/api/mentorship/requests');
      setRequests(response.data.requests);
    } catch (error) {
      toast.error('Failed to load mentorship requests');
    }
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/mentorship/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const requestMentorship = async (alumniId, message) => {
    try {
      await axios.post('/api/mentorship/request', {
        alumni_id: alumniId,
        message: message
      });
      toast.success('Mentorship request sent!');
    } catch (error) {
      toast.error('Failed to send mentorship request');
    }
  };

  const respondToRequest = async (mentorshipId, status, responseMessage = '') => {
    try {
      await axios.post('/api/mentorship/respond', {
        mentorship_id: mentorshipId,
        status,
        response_message: responseMessage
      });
      toast.success(`Request ${status} successfully`);
      loadMentorshipRequests();
    } catch (error) {
      toast.error('Failed to respond to request');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Mentorship</h1>
        <p className="text-gray-600 mt-1">
          {user?.type === 'student' 
            ? 'Find mentors and connect with alumni' 
            : 'Manage mentorship requests and help students'}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Find Mentors
            </button>
            {user?.type === 'alumni' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                Requests ({requests.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('conversations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conversations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Conversations ({conversations.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'search' && (
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Describe what you're looking for in a mentor (e.g., 'AI mentors from 2020 batch at Google')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={searchMentors}
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {mentors.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Matching Mentors</h2>
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {mentor.first_name} {mentor.last_name}
                        </h3>
                        <p className="text-gray-600">{mentor.role} at {mentor.company}</p>
                        <p className="text-sm text-gray-500">Graduated in {mentor.grad_year}</p>
                        {mentor.skills && mentor.skills.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {mentor.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {mentor.bio && (
                          <p className="mt-2 text-sm text-gray-700">{mentor.bio}</p>
                        )}
                      </div>
                      {user?.type === 'student' && (
                        <button
                          onClick={() => {
                            const message = prompt('Enter your mentorship request message:');
                            if (message) {
                              requestMentorship(mentor.id, message);
                            }
                          }}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Request Mentorship
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mentors.length === 0 && searchQuery && !loading && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && user?.type === 'alumni' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Mentorship Requests</h2>
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.student_id.first_name} {request.student_id.last_name}
                        </h3>
                        <p className="text-gray-600">{request.student_id.email}</p>
                        <p className="text-sm text-gray-500">
                          {request.student_id.department} • Expected graduation: {request.student_id.grad_year_expected}
                        </p>
                        <p className="mt-2 text-gray-700">{request.request_message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Requested {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => respondToRequest(request.id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(request.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <XCircle className="h-4 w-4 inline mr-1" />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">You'll see mentorship requests here when students reach out</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Active Conversations</h2>
            {conversations.length > 0 ? (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user?.type === 'student' 
                            ? `${conversation.alumni_id.first_name} ${conversation.alumni_id.last_name}`
                            : `${conversation.student_id.first_name} ${conversation.student_id.last_name}`
                          }
                        </h3>
                        <p className="text-gray-600">
                          {user?.type === 'student' 
                            ? `${conversation.alumni_id.role} at ${conversation.alumni_id.company}`
                            : `${conversation.student_id.department} Student`
                          }
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <MessageCircle className="h-4 w-4 inline mr-1" />
                        Open Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active conversations</h3>
                <p className="text-gray-600">
                  {user?.type === 'student' 
                    ? 'Start by finding and requesting mentorship from alumni'
                    : 'Accept mentorship requests to start conversations with students'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipPanel;