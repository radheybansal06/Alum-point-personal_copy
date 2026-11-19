import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MdFileUpload as Upload } from 'react-icons/md';
import { FaUsers as Users } from 'react-icons/fa';
import { LuCalendar as Calendar } from 'react-icons/lu';
import { HiBell as Bell } from 'react-icons/hi';
import { TbChartBar as BarChart3 } from 'react-icons/tb';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.type === 'admin') {
      loadDashboardStats();
      loadEvents();
      loadAnnouncements();
      loadChatMessages();
    }
  }, [user, selectedChannel]);

  const loadDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    }
  };

  const loadEvents = async () => {
    try {
      const response = await axios.get('/api/admin/events');
      setEvents(response.data.events);
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await axios.get('/api/admin/announcements');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      toast.error('Failed to load announcements');
    }
  };

  const loadChatMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/admin/messages?channel=${selectedChannel}`);
      setChatMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load chat messages');
    }
  };

  const handleCSVUpload = async (file) => {
    const formData = new FormData();
    formData.append('csv', file);

    setLoading(true);
    try {
      const response = await axios.post('/api/admin/upload-alumni', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Successfully processed ${response.data.successful_invites} alumni invites`);
      loadDashboardStats();
    } catch (error) {
      toast.error('Failed to upload CSV file');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      await axios.post('/api/admin/events', eventData);
      toast.success('Event created successfully!');
      loadEvents();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const createAnnouncement = async (announcementData) => {
    try {
      await axios.post('/api/admin/announcements', announcementData);
      toast.success('Announcement created successfully!');
      loadAnnouncements();
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  if (user?.type !== 'admin') {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage the AlumPoint platform</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('alumni')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alumni'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Alumni Management
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Events
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bell className="h-4 w-4 inline mr-2" />
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Chat Moderation
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Platform Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Alumni</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAlumni || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Announcements</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('alumni')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-blue-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Upload Alumni CSV</p>
                    <p className="text-sm text-gray-600">Bulk import alumni data</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-6 w-6 text-green-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Create Event</p>
                    <p className="text-sm text-gray-600">Schedule a new event</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Bell className="h-6 w-6 text-yellow-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Post Announcement</p>
                    <p className="text-sm text-gray-600">Share important updates</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alumni' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Alumni Management</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Alumni Data</h3>
              <p className="text-gray-600 mb-4">
                Upload a CSV file with alumni information. The system will automatically generate 
                usernames and passwords, then send invitation emails.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleCSVUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {loading ? 'Processing...' : 'Click to upload CSV file'}
                  </p>
                  <p className="text-sm text-gray-600">
                    CSV files only, max 5MB
                  </p>
                </label>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Required columns: email, first_name, last_name, roll_no, grad_year, department</li>
                  <li>• Optional columns: company, role, skills, bio, linkedin, github</li>
                  <li>• Skills should be comma-separated</li>
                  <li>• First row should contain column headers</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Event Management</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Event</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                createEvent({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  date: formData.get('date'),
                  location: formData.get('location'),
                  type: formData.get('type'),
                  max_attendees: formData.get('max_attendees') || null
                });
                e.target.reset();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Event Title"
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="type"
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="networking">Networking</option>
                    <option value="conference">Conference</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  name="description"
                  placeholder="Event Description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <input
                  type="number"
                  name="max_attendees"
                  placeholder="Max Attendees (optional)"
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Event
                </button>
              </form>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Events</h3>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                            <span>{event.location}</span>
                            <span className="capitalize">{event.type}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No events created yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Announcement Management</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Announcement</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                createAnnouncement({
                  title: formData.get('title'),
                  content: formData.get('content'),
                  priority: formData.get('priority'),
                  target_audience: formData.get('target_audience'),
                  expires_at: formData.get('expires_at') || null
                });
                e.target.reset();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Announcement Title"
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="priority"
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    name="target_audience"
                    required
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="alumni">Alumni Only</option>
                  </select>
                  <input
                    type="datetime-local"
                    name="expires_at"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  name="content"
                  placeholder="Announcement Content"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Post Announcement
                </button>
              </form>
            </div>

            {/* Announcements List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Announcements</h3>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="capitalize">{announcement.priority} priority</span>
                            <span className="capitalize">{announcement.target_audience}</span>
                            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this announcement?')) {
                                axios.delete(`/api/admin/announcements/${announcement._id}`)
                                  .then(() => {
                                    toast.success('Announcement deleted');
                                    loadAnnouncements();
                                  })
                                  .catch(() => {
                                    toast.error('Failed to delete announcement');
                                  });
                              }
                            }}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No announcements posted yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Chat Moderation</h2>
            
            {/* Channel Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Channel
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">General</option>
                <option value="aiml">AI/ML</option>
                <option value="web3">Web3</option>
                <option value="devops">DevOps</option>
                <option value="cloud">Cloud</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="mobile">Mobile</option>
                <option value="web-development">Web Development</option>
                <option value="data-science">Data Science</option>
                <option value="career-advice">Career Advice</option>
              </select>
            </div>

            {/* Chat Messages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Messages in #{selectedChannel}
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {chatMessages.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {chatMessages.map((message) => (
                      <div key={message._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {message.sender_name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(message.createdAt).toLocaleString()}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {message.sender_type}
                              </span>
                            </div>
                            <p className="text-gray-700 mt-1">{message.message}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this message?')) {
                                  axios.delete(`/api/chat/message/${message._id}`)
                                    .then(() => {
                                      toast.success('Message deleted');
                                      loadChatMessages();
                                    })
                                    .catch(() => {
                                      toast.error('Failed to delete message');
                                    });
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No messages in this channel yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;