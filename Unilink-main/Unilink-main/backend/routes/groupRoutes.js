import express from 'express';
import { createGroup, getGroups, joinGroup, getGroupById, getGroupPosts, updateGroup, inviteToGroup, createGroupPost, sendBatchPosts } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleGroupUpload } from '../middleware/groupUploadMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, handleGroupUpload, createGroup)
    .get(protect, getGroups);

router.post('/posts/batch', protect, sendBatchPosts);

router.route('/:id')
    .get(protect, getGroupById)
    .put(protect, handleGroupUpload, updateGroup);

router.post('/:id/join', protect, joinGroup);
router.post('/:id/invite', protect, inviteToGroup);
router.route('/:id/posts')
    .get(protect, getGroupPosts)
    .post(protect, createGroupPost);

export default router;
