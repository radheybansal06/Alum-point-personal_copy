import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft as ArrowLeft } from 'react-icons/hi';
import { PiGraduationCapBold as GraduationCap } from 'react-icons/pi';
import { FaUsers as Users } from 'react-icons/fa';
import { HiShieldCheck as Shield } from 'react-icons/hi2';

const RoleSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRole = location.state?.selectedRole;

  const handleContinue = () => {
    if (selectedRole === 'student') {
      navigate('/student/signup');
    } else if (selectedRole === 'alumni') {
      navigate('/alumni/login');
    } else if (selectedRole === 'admin') {
      navigate('/admin/login');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'student':
        return {
          icon: <GraduationCap className="h-16 w-16 text-blue-600" />,
          title: 'Student Registration',
          description: 'Join as a current student to connect with alumni and discover opportunities.',
          color: 'blue',
          steps: [
            'Enter your personal information',
            'Verify your university email with OTP',
            'Complete your profile with skills and interests',
            'Start connecting with alumni mentors'
          ]
        };
      case 'alumni':
        return {
          icon: <Users className="h-16 w-16 text-green-600" />,
          title: 'Alumni Login',
          description: 'Access your alumni account to mentor students and share opportunities.',
          color: 'green',
          steps: [
            'Login with your provided credentials',
            'Upload your resume for profile completion',
            'Review and edit your auto-filled profile',
            'Start mentoring and sharing opportunities'
          ]
        };
      case 'admin':
        return {
          icon: <Shield className="h-16 w-16 text-purple-600" />,
          title: 'Admin Access',
          description: 'Manage the platform, moderate discussions, and oversee the community.',
          color: 'purple',
          steps: [
            'Login with your employee ID',
            'Upload alumni CSV files',
            'Manage events and announcements',
            'Moderate community discussions'
          ]
        };
      default:
        return null;
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Role Selected</h1>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(selectedRole);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">AlumPoint</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {roleInfo.icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {roleInfo.title}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {roleInfo.description}
            </p>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              What to expect:
            </h2>
            <div className="space-y-4">
              {roleInfo.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${roleInfo.color}-100 flex items-center justify-center mr-4`}>
                    <span className={`text-sm font-medium text-${roleInfo.color}-600`}>
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBack}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleContinue}
              className={`px-8 py-3 bg-${roleInfo.color}-600 text-white rounded-lg hover:bg-${roleInfo.color}-700 transition-colors font-medium`}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-800">
            If you're having trouble accessing your account or need assistance, 
            please contact your university's alumni relations office or the platform administrators.
          </p>
        </div>
      </main>
    </div>
  );
};

export default RoleSelection;