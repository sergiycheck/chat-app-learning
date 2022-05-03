import { NextFunction, Request, Response } from 'express';
import userModel from '../models/user';
import mongoose from 'mongoose';

// /sign-in
const userSignInPost = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.body as { username: string };

  const userRegistered = await userModel.findOne({ username });
  if (userRegistered) return res.json({ userData: userRegistered });

  const id = new mongoose.Types.ObjectId();
  const user = new userModel({
    _id: id,
    id: id,
    username,
    socketId: null,
  });

  await user.save();

  res.json({ userData: user });
};

// '/get-user/:userId'

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const user = await userModel.findById(userId);
  res.json({ userData: user });
};

// '/get-users'

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  const users = await userModel.find();
  res.json({ usersDataArr: users });
};

export default {
  userSignInPost,
  getUser,
  getAllUsers,
};
