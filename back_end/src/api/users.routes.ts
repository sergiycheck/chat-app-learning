import express from 'express';
import usersController from './users.controller';

const router = express.Router();

router.post('/sign-in', usersController.userSignInPost);
router.get('/get-user/:userId', usersController.getUser);
router.get('/get-users', usersController.getAllUsers);

export default router;
