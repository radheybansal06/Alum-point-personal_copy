import React, { useState, useEffect } from 'react';
import { HiX as X } from 'react-icons/hi';
import { HiBell as Bell } from 'react-icons/hi';
import { HiOutlineExclamationCircle as AlertCircle } from 'react-icons/hi';
import { HiOutlineInformationCircle as Info } from 'react-icons/hi';
import { HiCheckCircle as CheckCircle } from 'react-icons/hi';
import axios from 'axios';

const AnnouncementsModal = ({ onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-600 bg-red-900/20';
      case 'medium':
        return 'border-yellow-600 bg-yellow-900/20';
      case 'low':
        return 'border-green-600 bg-green-900/20';
      default:
        return 'border-gray-600 bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">📢 Announcements</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`border rounded-lg p-4 ${getPriorityColor(announcement.priority)}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getPriorityIcon(announcement.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-white">
                          {announcement.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300">
                          {announcement.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{announcement.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>
                          {announcement.target_audience === 'all' 
                            ? 'All Users' 
                            : `${announcement.target_audience.charAt(0).toUpperCase() + announcement.target_audience.slice(1)} Only`
                          }
                        </span>
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No announcements</h3>
              <p className="text-gray-400">There are no announcements at this time.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsModal;