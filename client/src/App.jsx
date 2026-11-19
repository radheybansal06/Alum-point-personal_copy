import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import LandingPage from './components/LandingPage';
import RoleSelection from './components/RoleSelection';
import AdminLogin from './components/auth/AdminLogin';
import AlumniLogin from './components/auth/AlumniLogin';
import StudentSignup from './components/auth/StudentSignup';
import StudentLogin from './components/auth/StudentLogin';
import OTPVerification from './components/auth/OTPVerification';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              
              {/* Auth routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/alumni/login" element={<AlumniLogin />} />
              <Route path="/student/signup" element={<StudentSignup />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/verify-otp" element={<OTPVerification />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
    );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;