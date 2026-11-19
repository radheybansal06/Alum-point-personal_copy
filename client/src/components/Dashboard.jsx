import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Sidebar from './dashboard/Sidebar';
import ChatPanel from './dashboard/ChatPanel';
import MentorshipPanel from './dashboard/MentorshipPanel';
import OpportunitiesPanel from './dashboard/OpportunitiesPanel';
import ProfilePanel from './dashboard/ProfilePanel';
import AdminPanel from './dashboard/AdminPanel';
import AnnouncementsModal from './dashboard/AnnouncementsModal';
import EventsModal from './dashboard/EventsModal';
import { HiBell as Bell } from 'react-icons/hi';
import { HiCalendar as Calendar } from 'react-icons/hi';
import { FiLogOut as LogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [activePanel, setActivePanel] = useState('chat');
  const [currentChannel, setCurrentChannel] = useState('general');
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const renderMainPanel = () => {
    switch (activePanel) {
      case 'chat':
        return <ChatPanel currentChannel={currentChannel} setCurrentChannel={setCurrentChannel} />;
      case 'mentorship':
        return <MentorshipPanel />;
      case 'opportunities':
        return <OpportunitiesPanel />;
      case 'profile':
        return <ProfilePanel />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <ChatPanel currentChannel={currentChannel} setCurrentChannel={setCurrentChannel} />;
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar 
        activePanel={activePanel} 
        setActivePanel={setActivePanel}
        userType={user?.type}
        currentChannel={currentChannel}
        setCurrentChannel={setCurrentChannel}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-sm text-gray-300">
                {user?.type === 'admin' ? '🛡️ Admin Dashboard' :
                 user?.type === 'alumni' ? '🎓 Alumni Portal' :
                 '🎒 Student Portal'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {connected ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
              </div>

              {/* Events Button */}
              <button
                onClick={() => setShowEvents(true)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Upcoming Events"
              >
                <Calendar className="h-5 w-5" />
                {/* Event indicator */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>

              {/* Announcements Button */}
              <button
                onClick={() => setShowAnnouncements(true)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Announcements"
              >
                <Bell className="h-5 w-5" />
                {/* Notification dot */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.type}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Panel */}
        <main className="flex-1 overflow-hidden">
          {renderMainPanel()}
        </main>
      </div>

      {/* Announcements Modal */}
      {showAnnouncements && (
        <AnnouncementsModal onClose={() => setShowAnnouncements(false)} />
      )}

      {/* Events Modal */}
      {showEvents && (
        <EventsModal onClose={() => setShowEvents(false)} />
      )}
    </div>
  );
};

export default Dashboard;