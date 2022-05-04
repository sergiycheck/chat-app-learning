import express, { NextFunction, Request, Response } from 'express';
import usersRoutes from './users.routes';
import messageRoutes from './message.routes';

const usersEndPointName = 'users';
const messagesEndPointName = 'messages';

const router = express.Router();

router.get('/default', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

router.use(`/${usersEndPointName}`, usersRoutes);
router.use(`/${messagesEndPointName}`, messageRoutes);

export default router;
