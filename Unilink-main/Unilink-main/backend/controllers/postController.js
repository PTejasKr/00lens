import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';
import fs from 'fs';
import path from 'path';

// Helper: safely delete a temp file
const cleanupFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
};

// Build a public URL for an uploaded file (served via Express static /uploads)
const buildFileUrl = (req, filePath) => {
    // filePath looks like "uploads/images/12345.jpg"
    // Normalize to forward slashes
    const normalized = filePath.replace(/\\/g, '/');
    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/${normalized}`;
};

// Try Cloudinary upload; fall back to local URL if credentials are missing/dummy
const tryCloudinaryOrLocal = async (filePath, options, req) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const credsOk =
        cloudName && cloudName !== 'dummy' &&
        apiKey    && apiKey    !== 'dummy' &&
        apiSecret && apiSecret !== 'dummy';

    if (credsOk) {
        const { default: cloudinary } = await import('../config/cloudinary.js');
        const result = await cloudinary.uploader.upload(filePath, options);
        cleanupFile(filePath);
        return result.secure_url;
    }

    // Fall back to local — keep the file on disk and return a local URL
    return buildFileUrl(req, filePath);
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const files = req.files || {};
    const imgArr = files.image    || [];
    const vidArr = files.video    || [];
    const docArr = files.document || [];

    try {
        const { text, groupId } = req.body;

        if (!text && imgArr.length === 0 && vidArr.length === 0 && docArr.length === 0) {
            return res.status(400).json({ message: 'Post cannot be empty' });
        }

        const postData = {
            text: text || '',
            user: req.user._id,
            group: groupId || null,
        };

        // Handle Image
        if (imgArr.length > 0) {
            postData.image = await tryCloudinaryOrLocal(imgArr[0].path, {
                folder: 'unilink/posts/images',
                resource_type: 'auto',
            }, req);
        }

        // Handle Video
        if (vidArr.length > 0) {
            postData.video = await tryCloudinaryOrLocal(vidArr[0].path, {
                resource_type: 'video',
                folder: 'unilink/posts/videos',
            }, req);
        }

        // Handle Document
        if (docArr.length > 0) {
            postData.document = await tryCloudinaryOrLocal(docArr[0].path, {
                resource_type: 'raw',
                folder: 'unilink/posts/docs',
            }, req);
        }

        const post = await Post.create(postData);
        const populatedPost = await Post.findById(post._id)
            .populate('user', 'name email profilePic');
        return res.status(201).json(populatedPost);
    } catch (error) {
        // Cleanup all uploaded temp files on error
        if (imgArr[0]?.path) cleanupFile(imgArr[0].path);
        if (vidArr[0]?.path) cleanupFile(vidArr[0].path);
        if (docArr[0]?.path) cleanupFile(docArr[0].path);
        console.error('[createPost] error:', error.message);
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;
        const tag  = req.query.tag;

        const query = { group: null };
        if (tag) {
            const searchTerm = tag.startsWith('#') ? tag : `#${tag}`;
            query.text = { $regex: new RegExp(`${searchTerm}(?!\\w)`, 'i') };
        }

        const count = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .populate('user', 'name email profilePic')
            .populate('comments.user', 'name profilePic')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        return res.json({ posts, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'name email profilePic')
            .populate('group', 'name')
            .populate('comments.user', 'name profilePic');

        if (post) return res.json(post);
        return res.status(404).json({ message: 'Post not found' });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Post not found' });
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Update post text
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: 'User not authorized' });

        post.text = text || post.text;
        const updatedPost = await post.save();
        return res.json(updatedPost);
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Post not found' });
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(401).json({ message: 'User not authorized' });

        await post.deleteOne();
        return res.json({ message: 'Post removed' });
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Post not found' });
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Like / Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user._id.toString();
        const isLiked = post.likedBy.some(id => id.toString() === userId);

        if (isLiked) {
            post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            post.likedBy.push(userId);
            post.likes = post.likes + 1;
        }

        const updatedPost = await post.save();
        return res.json(updatedPost);
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Post not found' });
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get current user's posts
// @route   GET /api/posts/my/all
// @access  Private
const getMyPosts = asyncHandler(async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id })
            .populate('user', 'name email profilePic')
            .populate('comments.user', 'name profilePic')
            .sort({ createdAt: -1 });
        return res.json(posts);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({ user: req.user._id, text });
        await post.save();

        const updatedPost = await Post.findById(req.params.id)
            .populate('user', 'name email profilePic')
            .populate('comments.user', 'name profilePic');
        return res.status(201).json(updatedPost);
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Post not found' });
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get any user's posts
// @route   GET /api/posts/user/:id
// @access  Public
const getUserPosts = asyncHandler(async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.id })
            .populate('user', 'name email profilePic')
            .populate('comments.user', 'name profilePic')
            .sort({ createdAt: -1 });
        return res.json(posts);
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'User not found' });
        return res.status(500).json({ message: error.message });
    }
});

// @desc    Get trending hashtags (last 7 days)
// @route   GET /api/posts/trending
// @access  Public
const getTrendingHashtags = asyncHandler(async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trending = await Post.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, text: { $exists: true, $ne: '' } } },
            {
                $project: {
                    tags: { $regexFindAll: { input: '$text', regex: /#[a-zA-Z0-9_]+/ } }
                }
            },
            { $unwind: '$tags' },
            {
                $group: {
                    _id:   { $toLower: '$tags.match' },
                    count: { $sum: 1 },
                    tag:   { $first: '$tags.match' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, tag: 1, count: 1 } }
        ]);

        return res.json(trending);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    toggleLikePost,
    getMyPosts,
    addComment,
    getUserPosts,
    getTrendingHashtags,
};
