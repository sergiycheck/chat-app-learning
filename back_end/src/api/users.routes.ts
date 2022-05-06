import express from 'express';
import usersController from './users.controller';

const router = express.Router();

router.post('/sign-in', usersController.userSignInPost);
router.get('/get-user/:userId', usersController.getUser);

router.get('/get-users', usersController.getAllUsers);
router.get('/get-users-in-chat', usersController.getUsersInChat);

router.delete('/single/:userId', usersController.deleteUser);
router.delete('/user-from-chat/:userId', usersController.deleteUserFromChat);

router.delete('/all-users', usersController.deleteAllUsers);
router.delete('/all-users-in-chat', usersController.deleteAllUsersInChat);

export default router;
