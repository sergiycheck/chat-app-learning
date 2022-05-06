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

const deleteDocument = <TModel>(model: mongoose.Model<TModel, {}, {}, {}>, key: keyof TModel) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const userExists = await model.exists({ key: userId });
    if (userExists) {
      const deleteUserRes = await model.deleteOne({ key: userId });
      return res.json({ deleteUserRes, wasDeleted: deleteUserRes.deletedCount ? true : false });
    }
    return res.json({ wasDeleted: false });
  };
};

// '/get-user/:userId'

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const user = await userModel.findById(userId);
  res.json({ userData: user });
};

// '/get-users'

const getAllDocuments = <TModel>(model: mongoose.Model<TModel, {}, {}, {}>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const users = await model.find();
    const count = await model.estimatedDocumentCount();
    res.json({ count, usersDataArr: users });
  };
};

const deleteAllDocuments = <TModel>(model: mongoose.Model<TModel, {}, {}, {}>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await model.deleteMany({});
    if (result.deletedCount) {
      return res.json({ result, wasDeleted: true });
    }
    return res.json({ wasDeleted: false });
  };
};

export default {
  userSignInPost,
  getUser,

  getAllUsers: getAllDocuments(userModel),
  getUsersInChat: getAllDocuments(currentUsersInChatModel),

  deleteUser: deleteDocument(userModel, '_id'),
  deleteUserFromChat: deleteDocument(currentUsersInChatModel, 'id'),

  deleteAllUsers: deleteAllDocuments(userModel),
  deleteAllUsersInChat: deleteAllDocuments(currentUsersInChatModel),
};
