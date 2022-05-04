import express from 'express';
import messageController from './messages.controller';

const router = express.Router();

router.get('/', messageController.getAllMessages);
router.delete('/single/:messageId', messageController.deleteData);
router.delete('/delete-all', messageController.deletedAllMessages);

export default router;
