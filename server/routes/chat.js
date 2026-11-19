const express = require('express');
const { auth, requireAdmin } = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');

const router = express.Router();

// Get chat messages for a channel
router.get('/:channel', auth, async (req, res) => {
  try {
    const { channel } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({
      channel,
      is_deleted: false
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
});

// Send chat message
router.post('/:channel', auth, async (req, res) => {
  try {
    const { channel } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const chatMessage = new ChatMessage({
      channel,
      sender_id: req.user.id,
      sender_type: req.userType,
      sender_name: `${req.user.first_name} ${req.user.last_name}`,
      message: message.trim()
    });

    await chatMessage.save();

    // Emit to Socket.IO clients
    req.app.get('io').to(channel).emit('new_message', {
      _id: chatMessage._id,
      id: chatMessage.id,
      channel: chatMessage.channel,
      sender_id: chatMessage.sender_id,
      sender_type: chatMessage.sender_type,
      sender_name: chatMessage.sender_name,
      message: chatMessage.message,
      createdAt: chatMessage.createdAt
    });

    res.json({ message: 'Message sent successfully', chatMessage });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Edit message
router.put('/message/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const chatMessage = await ChatMessage.findOne({
      _id: id,
      sender_id: req.user.id,
      is_deleted: false
    });

    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if message is too old to edit (e.g., 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (chatMessage.createdAt < fiveMinutesAgo) {
      return res.status(400).json({ message: 'Message is too old to edit' });
    }

    chatMessage.message = message.trim();
    chatMessage.is_edited = true;
    chatMessage.edited_at = new Date();

    await chatMessage.save();

    // Emit to Socket.IO clients
    req.app.get('io').to(chatMessage.channel).emit('message_edited', {
      id: chatMessage._id,
      message: chatMessage.message,
      edited_at: chatMessage.edited_at
    });

    res.json({ message: 'Message edited successfully', chatMessage });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Error editing message' });
  }
});

// Delete message (Admin only or message owner)
router.delete('/message/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const chatMessage = await ChatMessage.findById(id);

    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user can delete (admin or message owner)
    const canDelete = req.userType === 'admin' || chatMessage.sender_id === req.user.id;

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    chatMessage.is_deleted = true;
    chatMessage.deleted_at = new Date();
    if (req.userType === 'admin') {
      chatMessage.deleted_by = req.user.id;
    }

    await chatMessage.save();

    // Emit to Socket.IO clients
    req.app.get('io').to(chatMessage.channel).emit('message_deleted', {
      id: chatMessage._id
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
});

// Get all messages for admin moderation
router.get('/admin/messages', auth, requireAdmin, async (req, res) => {
  try {
    const { channel, page = 1, limit = 50 } = req.query;
    
    const query = { is_deleted: false };
    if (channel) query.channel = channel;

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Ban user from chat (Admin only)
router.post('/admin/ban-user', auth, requireAdmin, async (req, res) => {
  try {
    const { user_id, user_type, reason } = req.body;
    
    // In a real implementation, you'd have a banned users collection
    // For now, we'll just log the ban action
    console.log(`Admin ${req.user.id} banned user ${user_id} (${user_type}) for: ${reason}`);
    
    // Emit ban event to socket
    req.app.get('io').emit('user_banned', {
      user_id,
      user_type,
      reason,
      banned_by: req.user.id
    });

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Error banning user' });
  }
});

// Get available channels
router.get('/channels/list', auth, async (req, res) => {
  try {
    const channels = [
      'general',
      'aiml',
      'web3',
      'devops',
      'cloud',
      'cybersecurity',
      'mobile',
      'web-development',
      'data-science',
      'career-advice'
    ];

    res.json({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Error fetching channels' });
  }
});

// Get chat statistics (Admin only)
router.get('/stats/overview', auth, requireAdmin, async (req, res) => {
  try {
    const totalMessages = await ChatMessage.countDocuments({ is_deleted: false });
    const messagesByChannel = await ChatMessage.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$channel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const messagesByType = await ChatMessage.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$sender_type', count: { $sum: 1 } } }
    ]);

    res.json({
      totalMessages,
      messagesByChannel,
      messagesByType
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({ message: 'Error fetching chat statistics' });
  }
});

module.exports = router;