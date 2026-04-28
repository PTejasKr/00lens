import express from 'express';
import { createSnippet, getSnippet, getUserSnippets } from '../controllers/snippetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSnippet);
router.get('/:id', protect, getSnippet);
router.get('/user/:userId', protect, getUserSnippets);

export default router;
