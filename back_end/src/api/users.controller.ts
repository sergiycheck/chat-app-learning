import { NextFunction, Request, Response } from 'express';
import userModel, { currentUsersInChatModel } from '../models/user';
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

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  const userExists = await userModel.exists({ _id: userId });

  if (userExists) {
    const deleteUserRes = await userModel.deleteOne({ _id: userId });

    return res.json({ deleteUserRes, wasDeleted: deleteUserRes.deletedCount ? true : false });
  }

  return res.json({ wasDeleted: false });
};

const deleteUserFromChat = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  const userExists = await currentUsersInChatModel.exists({ id: userId });

  if (userExists) {
    const deleteUserRes = await currentUsersInChatModel.deleteOne({ id: userId });

    return res.json({ deleteUserRes, wasDeleted: deleteUserRes.deletedCount ? true : false });
  }
  return res.json({ wasDeleted: false });
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
  const count = await userModel.estimatedDocumentCount();
  res.json({ count, usersDataArr: users });
};

const getUsersInChat = async (req: Request, res: Response, next: NextFunction) => {
  const users = await currentUsersInChatModel.find();
  const count = await currentUsersInChatModel.estimatedDocumentCount();
  res.json({ count, usersDataArr: users });
};

export default {
  userSignInPost,
  getUser,
  getAllUsers,
  getUsersInChat,
  deleteUser,
  deleteUserFromChat,
};
