import express from 'express';
import { getMessages, getConversations, sendMessage, sendMediaMessage, markAsRead, sendBatchMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
import multer from 'multer';
const upload = multer({ dest: 'tmp/' });

router.get('/conversations', protect, getConversations);
router.post('/', protect, sendMessage);
router.post('/batch', protect, sendBatchMessages);
router.post('/media', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'document', maxCount: 1 }]), sendMediaMessage);
router.get('/:userId', protect, getMessages);
router.put('/:userId/read', protect, markAsRead);

export default router;
