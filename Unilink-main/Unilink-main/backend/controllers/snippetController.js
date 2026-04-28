import asyncHandler from 'express-async-handler';
import CodeSnippet from '../models/CodeSnippet.js';

// @desc    Create a new code snippet
// @route   POST /api/snippets
// @access  Private
const createSnippet = asyncHandler(async (req, res) => {
    const { title, language, code, isPublic } = req.body;
    const author = req.user._id;
    if (!language || !code) {
        return res.status(400).json({ message: 'Language and code are required' });
    }
    const snippet = await CodeSnippet.create({
        author,
        title: title || '',
        language,
        code,
        isPublic: !!isPublic,
    });
    res.status(201).json(snippet);
});

// @desc    Get a snippet by id
// @route   GET /api/snippets/:id
// @access  Private (or public if snippet.isPublic)
const getSnippet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const snippet = await CodeSnippet.findById(id).populate('author', 'name profilePic');
    if (!snippet) {
        return res.status(404).json({ message: 'Snippet not found' });
    }
    if (!snippet.isPublic && snippet.author._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(snippet);
});

// @desc    Get snippets for a user
// @route   GET /api/snippets/user/:userId
// @access  Private (owner can see private snippets, others only public)
const getUserSnippets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const query = { author: userId };
    // If not the owner, filter to public only
    if (userId !== req.user._id.toString()) {
        query.isPublic = true;
    }
    const snippets = await CodeSnippet.find(query).sort({ createdAt: -1 });
    res.json(snippets);
});

export { createSnippet, getSnippet, getUserSnippets };
