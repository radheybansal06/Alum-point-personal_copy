import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io('http://localhost:3000', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const joinChannel = (channel) => {
    if (socket && connected) {
      socket.emit('join_channel', channel);
    }
  };

  const leaveChannel = (channel) => {
    if (socket && connected) {
      socket.emit('leave_channel', channel);
    }
  };

  const joinMentorship = (mentorshipId) => {
    if (socket && connected) {
      socket.emit('join_mentorship', mentorshipId);
    }
  };

  const leaveMentorship = (mentorshipId) => {
    if (socket && connected) {
      socket.emit('leave_mentorship', mentorshipId);
    }
  };

  const value = {
    socket,
    connected,
    joinChannel,
    leaveChannel,
    joinMentorship,
    leaveMentorship
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};