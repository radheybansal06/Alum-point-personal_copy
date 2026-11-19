import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUsers as Users } from 'react-icons/fa';
import { PiGraduationCapBold as GraduationCap } from 'react-icons/pi';
import { HiShieldCheck as Shield } from 'react-icons/hi2';
import { MdArrowRightAlt as ArrowRight } from 'react-icons/md';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleRoleSelection = (role) => {
    navigate('/role-selection', { state: { selectedRole: role } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-400">🎓 AlumPoint</h1>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              💪 Alumni Engagement Platform
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="text-blue-400">AlumPoint</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            🌟 Connect with your alumni community, find mentors, discover opportunities, 
            and build lasting professional relationships.
          </p>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Student Card */}
            <div 
              className="bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 border border-gray-700"
              onClick={() => handleRoleSelection('student')}
            >
              <div className="flex flex-col items-center">
                <div className="bg-blue-600 p-4 rounded-full mb-6 group-hover:bg-blue-500 transition-colors">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">🎒 Student</h3>
                <p className="text-gray-300 text-center mb-6">
                  Join as a current student to connect with alumni, find mentors, 
                  and discover career opportunities.
                </p>
                <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Alumni Card */}
            <div 
              className="bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 border border-gray-700"
              onClick={() => handleRoleSelection('alumni')}
            >
              <div className="flex flex-col items-center">
                <div className="bg-green-600 p-4 rounded-full mb-6 group-hover:bg-green-500 transition-colors">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">🎓 Alumni</h3>
                <p className="text-gray-300 text-center mb-6">
                  Connect with fellow alumni, mentor students, and share 
                  career opportunities with the next generation.
                </p>
                <div className="flex items-center text-green-400 font-medium group-hover:text-green-300">
                  Join Community
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Admin Card */}
            <div 
              className="bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 border border-gray-700"
              onClick={() => handleRoleSelection('admin')}
            >
              <div className="flex flex-col items-center">
                <div className="bg-purple-600 p-4 rounded-full mb-6 group-hover:bg-purple-500 transition-colors">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">🛡️ Admin</h3>
                <p className="text-gray-300 text-center mb-6">
                  Manage the platform, moderate discussions, and help 
                  build a thriving alumni community.
                </p>
                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300">
                  Admin Access
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white mb-12">
              ✨ What makes AlumPoint special?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">💬 Community Chat</h3>
                <p className="text-gray-300 text-sm">
                  Join topic-based channels and connect with like-minded professionals
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">🤝 Mentorship</h3>
                <p className="text-gray-300 text-sm">
                  Find mentors or become one using our AI-powered matching system
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">💼 Opportunities</h3>
                <p className="text-gray-300 text-sm">
                  Discover internships, jobs, and freelance opportunities
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">📅 Events</h3>
                <p className="text-gray-300 text-sm">
                  Stay updated with alumni events and networking opportunities
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 🎓 AlumPoint. 💪 Building stronger alumni communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;