import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const cleanupFile = (filePath) => {
    try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
};

// @desc    Get message history between two users (with pagination)
// @route   GET /api/chat/:userId?page=1&limit=50
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { groupId } = req.query;
        const currentUserId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        let query;
        if (groupId) {
            query = { group: groupId };
        } else {
            query = {
                $or: [
                    { sender: currentUserId, receiver: userId },
                    { sender: userId, receiver: currentUserId },
                ],
            };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments(query);

        res.json({ messages, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get list of users the current user has chatted with (with last message preview)
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // 1. Get Private Conversations
        const messages = await Message.find({
            group: { $exists: false },
            $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        }).sort({ createdAt: -1 });

        const conversationMap = new Map();
        messages.forEach((msg) => {
            const otherId = msg.sender.toString() === currentUserId.toString()
                ? msg.receiver.toString()
                : msg.sender.toString();

            if (!conversationMap.has(otherId)) {
                conversationMap.set(otherId, {
                    lastMessage: msg.text || (msg.image ? '📷 Photo' : msg.video ? '🎥 Video' : '📄 Document'),
                    lastMessageAt: msg.createdAt,
                    unreadCount: 0,
                });
            }

            if (msg.sender.toString() !== currentUserId.toString() && !msg.readAt) {
                const conv = conversationMap.get(otherId);
                conv.unreadCount = (conv.unreadCount || 0) + 1;
            }
        });

        const userIds = Array.from(conversationMap.keys());
        const users = await User.find({ _id: { $in: userIds } }).select('name profilePic bio');

        const privateResults = users.map((u) => {
            const conv = conversationMap.get(u._id.toString()) || {};
            return {
                _id: u._id,
                name: u.name,
                profilePic: u.profilePic,
                lastMessage: conv.lastMessage || '',
                lastMessageAt: conv.lastMessageAt || null,
                unreadCount: conv.unreadCount || 0,
                isGroup: false,
            };
        });

        // 2. Get Group Conversations (Groups the user is a member of)
        const Group = (await import('../models/Group.js')).default;
        const userGroups = await Group.find({ members: currentUserId });

        const groupResults = await Promise.all(userGroups.map(async (group) => {
            const lastMsg = await Message.findOne({ group: group._id }).sort({ createdAt: -1 });
            return {
                _id: group._id,
                name: group.name,
                profilePic: group.avatar || group.image,
                lastMessage: lastMsg ? (lastMsg.text || 'Media') : 'New community',
                lastMessageAt: lastMsg ? lastMsg.createdAt : group.createdAt,
                unreadCount: 0, // Group unread logic can be complex, skipping for now
                isGroup: true,
            };
        }));

        const result = [...privateResults, ...groupResults];
        result.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send a text message
// @route   POST /api/chat
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { receiverId, groupId, text } = req.body;
        const senderId = req.user._id;

        if (!receiverId && !groupId) {
            return res.status(400).json({ message: 'Receiver or Group ID is required' });
        }

        if (!text && !req.files) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId || undefined,
            group: groupId || undefined,
            text: text || '',
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send a batch of messages
// @route   POST /api/chat/batch
// @access  Private
const sendBatchMessages = asyncHandler(async (req, res) => {
    try {
        const { messages } = req.body; // Array of message objects
        const senderId = req.user._id;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: 'Invalid batch format' });
        }

        const formattedMessages = messages.map(msg => ({
            sender: senderId,
            receiver: msg.receiverId || undefined,
            group: msg.groupId || undefined,
            text: msg.text || '',
            createdAt: msg.timestamp || new Date(), // Use provided timestamp if available
        }));

        const savedMessages = await Message.insertMany(formattedMessages);

        res.status(201).json(savedMessages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send a media message (image/video/document)
// @route   POST /api/chat/media
// @access  Private
const sendMediaMessage = asyncHandler(async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const senderId = req.user._id;

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver is required' });
        }

        let imageUrl = '';
        let videoUrl = '';
        let documentUrl = '';
        let documentName = '';

        // Handle uploaded files
        if (req.files) {
            if (req.files.image && req.files.image[0]) {
                const file = req.files.image[0];
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'unilink/chat_media',
                        resource_type: 'auto',
                    });
                    imageUrl = result.secure_url;
                } finally {
                    cleanupFile(file.path);
                }
            }

            if (req.files.video && req.files.video[0]) {
                const file = req.files.video[0];
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'unilink/chat_media',
                        resource_type: 'video',
                    });
                    videoUrl = result.secure_url;
                } finally {
                    cleanupFile(file.path);
                }
            }

            if (req.files.document && req.files.document[0]) {
                const file = req.files.document[0];
                documentName = file.originalname;
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'unilink/chat_docs',
                        resource_type: 'raw',
                    });
                    documentUrl = result.secure_url;
                } finally {
                    cleanupFile(file.path);
                }
            }
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            text: text || '',
            image: imageUrl,
            video: videoUrl,
            document: documentUrl,
            documentName,
        });

        res.status(201).json(message);
    } catch (error) {
        // Cleanup any remaining files on error
        if (req.files) {
            Object.values(req.files).forEach(files => {
                files.forEach(f => cleanupFile(f.path));
            });
        }
        res.status(500).json({ message: error.message });
    }
});

// @desc    Mark messages as read
// @route   PUT /api/chat/:userId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        await Message.updateMany(
            {
                sender: userId,
                receiver: currentUserId,
                readAt: null,
            },
            { $set: { readAt: new Date() } }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export { getMessages, getConversations, sendMessage, sendMediaMessage, markAsRead, sendBatchMessages };
