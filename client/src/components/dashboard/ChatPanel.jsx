import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { IoSend as Send } from 'react-icons/io5';
import { FaHashtag as Hash } from 'react-icons/fa';
import { FiMoreVertical as MoreVertical } from 'react-icons/fi';
import { FiEdit2 as Edit2, FiTrash2 as Trash2 } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatPanel = ({ currentChannel, setCurrentChannel }) => {
  const { user } = useAuth();
  const { socket, joinChannel, leaveChannel } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket) {
      // Join the current channel
      joinChannel(currentChannel);
      
      // Listen for new messages
      socket.on('new_message', (message) => {
        if (message.channel === currentChannel) {
          setMessages(prev => [...prev, message]);
        }
      });

      // Listen for message edits
      socket.on('message_edited', (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.id ? { ...msg, message: data.message, edited_at: data.edited_at } : msg
        ));
      });

      // Listen for message deletions
      socket.on('message_deleted', (data) => {
        setMessages(prev => prev.filter(msg => msg._id !== data.id));
      });

      return () => {
        leaveChannel(currentChannel);
        socket.off('new_message');
        socket.off('message_edited');
        socket.off('message_deleted');
      };
    }
  }, [socket, currentChannel, joinChannel, leaveChannel]);

  useEffect(() => {
    loadMessages();
  }, [currentChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/chat/${currentChannel}`);
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`/api/chat/${currentChannel}`, {
        message: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Hash className="h-5 w-5 text-gray-400 mr-2" />
              <h1 className="text-lg font-semibold text-white capitalize">
                #{currentChannel.replace('-', ' ')}
              </h1>
            </div>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-600"></div>
                  <span className="px-3 text-xs font-medium text-gray-400 bg-gray-800 rounded-full">
                    📅 {date}
                  </span>
                  <div className="flex-1 border-t border-gray-600"></div>
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message, index) => (
                  <div key={message.id} className="flex items-start space-x-3 group hover:bg-gray-800 p-2 rounded-lg transition-colors">
                    <div className="flex-shrink-0 relative group/avatar">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer">
                        <span className="text-sm font-medium text-white">
                          {message.sender_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Profile Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        <div className="font-medium">{message.sender_name}</div>
                        {message.sender_type === 'alumni' && (
                          <div className="text-gray-300">
                            {message.company && <div>🏢 {message.company}</div>}
                            {message.role && <div>💼 {message.role}</div>}
                          </div>
                        )}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-medium text-white">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.is_edited && (
                          <span className="text-xs text-gray-500">(edited)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mt-1 break-words">
                        {message.message}
                      </p>
                    </div>
                    {(message.sender_id === user?.id || user?.type === 'admin') && (
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                        {message.sender_id === user?.id && (
                          <button className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this message?')) {
                              // Call delete API
                              axios.delete(`/api/chat/message/${message._id}`)
                                .then(() => {
                                  toast.success('Message deleted');
                                  // Manually remove the message from the UI immediately
                                  setMessages(prev => prev.filter(msg => msg._id !== message._id));
                                })
                                .catch(() => {
                                  toast.error('Failed to delete message');
                                });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`💬 Message #${currentChannel}`}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;