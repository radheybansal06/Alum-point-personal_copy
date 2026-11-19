import React from 'react';
import { HiOutlineChatBubbleLeftRight as MessageSquare } from 'react-icons/hi2';
import { FaUsers as Users } from 'react-icons/fa';
import { PiBriefcaseBold as Briefcase } from 'react-icons/pi';
import { FaRegUser as User } from 'react-icons/fa';
import { FiSettings as Settings } from 'react-icons/fi';
import { FaHashtag as Hash } from 'react-icons/fa';
import { 
  FaRobot as AIML, 
  FaEthereum as Web3, 
  FaDocker as DevOps, 
  FaCloud as Cloud, 
  FaShieldAlt as Security,
  FaMobile as Mobile,
  FaCode as WebDev,
  FaChartLine as DataScience,
  FaGraduationCap as Career
} from 'react-icons/fa';

const Sidebar = ({ activePanel, setActivePanel, userType, currentChannel, setCurrentChannel }) => {
  const channels = [
    { name: 'general', label: 'General', icon: Hash, color: 'text-gray-400', bgColor: 'bg-gray-600' },
    { name: 'aiml', label: 'AI/ML', icon: AIML, color: 'text-purple-400', bgColor: 'bg-purple-600' },
    { name: 'web3', label: 'Web3', icon: Web3, color: 'text-blue-400', bgColor: 'bg-blue-600' },
    { name: 'devops', label: 'DevOps', icon: DevOps, color: 'text-green-400', bgColor: 'bg-green-600' },
    { name: 'cloud', label: 'Cloud', icon: Cloud, color: 'text-cyan-400', bgColor: 'bg-cyan-600' },
    { name: 'cybersecurity', label: 'Security', icon: Security, color: 'text-red-400', bgColor: 'bg-red-600' },
    { name: 'mobile', label: 'Mobile', icon: Mobile, color: 'text-orange-400', bgColor: 'bg-orange-600' },
    { name: 'web-development', label: 'Web Dev', icon: WebDev, color: 'text-yellow-400', bgColor: 'bg-yellow-600' },
    { name: 'data-science', label: 'Data Science', icon: DataScience, color: 'text-pink-400', bgColor: 'bg-pink-600' },
    { name: 'career-advice', label: 'Career', icon: Career, color: 'text-indigo-400', bgColor: 'bg-indigo-600' }
  ];

  const menuItems = userType === 'admin' 
    ? [
        { id: 'chat', label: '💬 Community Chat', icon: MessageSquare, color: 'text-blue-400', bgColor: 'bg-blue-600' },
        { id: 'admin', label: '🛡️ Admin Panel', icon: Settings, color: 'text-red-400', bgColor: 'bg-red-600' }
      ]
    : [
        { id: 'chat', label: '💬 Community Chat', icon: MessageSquare, color: 'text-blue-400', bgColor: 'bg-blue-600' },
        { id: 'mentorship', label: '🤝 Mentorship', icon: Users, color: 'text-green-400', bgColor: 'bg-green-600', glow: true },
        { id: 'opportunities', label: '💼 Opportunities', icon: Briefcase, color: 'text-yellow-400', bgColor: 'bg-yellow-600' },
        { id: 'profile', label: '👤 My Profile', icon: User, color: 'text-purple-400', bgColor: 'bg-purple-600' }
      ];

  return (
    <div className="w-64 bg-gray-800 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">🎓 AlumPoint</h1>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            📢 Channels
          </h3>
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.name}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                  currentChannel === channel.name && activePanel === 'chat'
                    ? `${channel.bgColor} text-white shadow-lg transform scale-105`
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => {
                  setActivePanel('chat');
                  setCurrentChannel(channel.name);
                }}
              >
                <channel.icon className={`h-4 w-4 mr-3 ${channel.color} group-hover:text-white`} />
                <span className="capitalize">{channel.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Menu */}
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            🧭 Navigation
          </h3>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activePanel === item.id
                    ? `${item.bgColor} text-white shadow-lg transform scale-105`
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${item.glow ? 'glow-button' : ''}`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${item.color}`} />
                <span>{item.label}</span>
                {item.glow && (
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          <p>🎓 AlumPoint v1.0</p>
          <p className="mt-1">💪 Building stronger communities</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;