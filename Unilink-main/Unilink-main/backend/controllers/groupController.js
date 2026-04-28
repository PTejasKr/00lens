import asyncHandler from 'express-async-handler';
import Group from '../models/Group.js';
import Post from '../models/Post.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Helper: safely delete a temp file
const cleanupFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (_) {}
};

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
const createGroup = asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name || !description) {
            if (req.files) {
                if (req.files.avatar) cleanupFile(req.files.avatar[0].path);
                if (req.files.banner) cleanupFile(req.files.banner[0].path);
            }
            return res.status(400).json({ message: 'Please provide name and description' });
        }

        let avatarUrl = '';
        let bannerUrl = '';

        if (req.files) {
            if (req.files.avatar && req.files.avatar[0]) {
                const result = await cloudinary.uploader.upload(req.files.avatar[0].path, { folder: 'unilink/groups' });
                avatarUrl = result.secure_url;
                cleanupFile(req.files.avatar[0].path);
            }
            if (req.files.banner && req.files.banner[0]) {
                const result = await cloudinary.uploader.upload(req.files.banner[0].path, { folder: 'unilink/groups' });
                bannerUrl = result.secure_url;
                cleanupFile(req.files.banner[0].path);
            }
        }

        const group = await Group.create({
            name,
            description,
            avatar: avatarUrl || undefined,
            banner: bannerUrl || undefined,
            creator: req.user._id,
            members: [req.user._id]
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update group details
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = asyncHandler(async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            res.status(404);
            throw new Error('Group not found');
        }

        if (group.creator.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized to update this group');
        }

        const { name, description } = req.body;

        group.name = name || group.name;
        group.description = description || group.description;

        if (req.files) {
            if (req.files.avatar && req.files.avatar[0]) {
                const result = await cloudinary.uploader.upload(req.files.avatar[0].path, { folder: 'unilink/groups' });
                group.avatar = result.secure_url;
                cleanupFile(req.files.avatar[0].path);
            }
            if (req.files.banner && req.files.banner[0]) {
                const result = await cloudinary.uploader.upload(req.files.banner[0].path, { folder: 'unilink/groups' });
                group.banner = result.secure_url;
                cleanupFile(req.files.banner[0].path);
            }
        }

        const updatedGroup = await group.save();
        res.json(updatedGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add member directly to group (founder only)
// @route   POST /api/groups/:id/add-member
// @access  Private
const addMemberDirectly = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (group.creator.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Only the founder can add members directly');
    }

    if (!group.members.includes(userId)) {
        group.members.push(userId);
        await group.save();
    }

    res.json({ message: 'Member added successfully', group });
});

// @desc    Invite members to group
// @route   POST /api/groups/:id/invite
// @access  Private
const inviteToGroup = asyncHandler(async (req, res) => {
    const { userIds } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (!userIds || !Array.isArray(userIds)) {
        res.status(400);
        throw new Error('Invalid user list');
    }

    // Only add users who are not already members
    const newMembers = userIds.filter(id => !group.members.some(memberId => memberId.toString() === id.toString()));
    group.members.push(...newMembers);
    
    await group.save();
    res.json({ message: 'Invitations processed', group });
});

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
const getGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find()
        .populate('creator', 'name profilePic')
        .populate('members', 'name profilePic')
        .sort({ createdAt: -1 });
        
    res.json(groups);
});

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id)
        .populate('creator', 'name profilePic')
        .populate('members', 'name profilePic');
    
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    res.json(group);
});

// @desc    Join group
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (group.members.some(id => id.toString() === req.user._id.toString())) {
        res.status(400);
        throw new Error('Already a member of this group');
    }

    group.members.push(req.user._id);
    await group.save();

    res.json({ message: 'Joined successfully', group });
});

// @desc    Create post in a group
// @route   POST /api/groups/:id/posts
// @access  Private
const createGroupPost = asyncHandler(async (req, res) => {
    const { text, image } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (!group.members.some(id => id.toString() === req.user._id.toString())) {
        res.status(401);
        throw new Error('Must be a member to post in this group');
    }

    const post = await Post.create({
        user: req.user._id,
        group: req.params.id,
        text,
        image
    });

    res.status(201).json(post);
});

// @desc    Send batch of posts (Offline support)
// @route   POST /api/groups/posts/batch
// @access  Private
const sendBatchPosts = asyncHandler(async (req, res) => {
    const { posts } = req.body;
    if (!posts || !Array.isArray(posts)) {
        return res.status(400).json({ message: 'Invalid batch format' });
    }

    const formattedPosts = posts.map(p => ({
        user: req.user._id,
        group: p.groupId,
        text: p.text,
        image: p.image,
        createdAt: p.timestamp || new Date()
    }));

    const savedPosts = await Post.insertMany(formattedPosts);
    res.status(201).json(savedPosts);
});

export { createGroup, getGroups, joinGroup, getGroupPosts, getGroupById, updateGroup, inviteToGroup, addMemberDirectly, createGroupPost, sendBatchPosts };
