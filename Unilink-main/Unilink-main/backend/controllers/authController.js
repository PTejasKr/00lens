import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validationResult } from 'express-validator';

// Helper to build a consistent auth response
const buildAuthResponse = (user, token) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    profilePic: user.profilePic,
    bannerImage: user.bannerImage,
    department: user.department,
    year: user.year,
    skills: user.skills,
    interests: user.interests,
    followers: user.followers,
    following: user.following,
    role: user.role,
    createdAt: user.createdAt,
    token,
});

import bcrypt from 'bcryptjs';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Save user
    const user = new User({
        name,
        email,
        password // Let the User model pre-save hook handle hashing
    });
    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    // Return response with user data and token
    res.status(201).json(buildAuthResponse(user, token));
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email })
        .populate('followers', 'name profilePic')
        .populate('following', 'name profilePic');
        
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Return response
    res.status(200).json(buildAuthResponse(user, token));
});

export { registerUser, loginUser };
