import express, { NextFunction, Request, Response } from 'express';
import usersRoutes from './users.routes';

const usersEndPointName = 'users';

const router = express.Router();

router.get('/default', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

router.use(`/${usersEndPointName}`, usersRoutes);

export default router;
