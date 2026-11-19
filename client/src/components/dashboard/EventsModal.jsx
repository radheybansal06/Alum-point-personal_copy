import React, { useState, useEffect } from 'react';
import { HiX as X } from 'react-icons/hi';
import { HiCalendar as Calendar } from 'react-icons/hi';
import { HiLocationMarker as Location } from 'react-icons/hi';
import { HiUsers as Users } from 'react-icons/hi';
import { HiClock as Clock } from 'react-icons/hi';
import axios from 'axios';

const EventsModal = ({ onClose }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await axios.get('/api/admin/public/events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'workshop':
        return 'bg-blue-600';
      case 'seminar':
        return 'bg-green-600';
      case 'networking':
        return 'bg-purple-600';
      case 'conference':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'workshop':
        return '🔧';
      case 'seminar':
        return '🎓';
      case 'networking':
        return '🤝';
      case 'conference':
        return '🏛️';
      default:
        return '📅';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-white">Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">📅 Upcoming Events</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Events Scheduled</h3>
              <p className="text-gray-400">Check back later for upcoming events!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white mr-3 ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)} {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
                        </span>
                        <span className="text-sm text-gray-400">
                          Created {new Date(event.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-300 mb-4">
                        {event.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="text-sm">{formatDate(event.date)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <Clock className="h-4 w-4 text-green-400 mr-2" />
                          <span className="text-sm">{formatTime(event.date)}</span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-gray-300">
                            <Location className="h-4 w-4 text-red-400 mr-2" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        )}
                        
                        {event.max_attendees && (
                          <div className="flex items-center text-gray-300">
                            <Users className="h-4 w-4 text-purple-400 mr-2" />
                            <span className="text-sm">Max {event.max_attendees} attendees</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-750">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              {events.length} event{events.length !== 1 ? 's' : ''} scheduled
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsModal;
