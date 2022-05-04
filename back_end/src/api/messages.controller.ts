import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import messageModel from '../models/message';

const getAllMessages = async (req: Request, res: Response, next: NextFunction) => {
  const data = await messageModel.find().populate('userData');
  const count = await messageModel.estimatedDocumentCount();
  res.json({ count, messagesArr: data });
};

const deletedAllMessages = async (req: Request, res: Response, next: NextFunction) => {
  const result = await messageModel.deleteMany({});
  if (result.deletedCount) {
    return res.json({ result, wasDeleted: true });
  }
  return res.json({ wasDeleted: false });
};

const deleteData = async (req: Request, res: Response, next: NextFunction) => {
  const { messageId } = req.params;

  const exists = await messageModel.exists({ _id: messageId });

  if (exists) {
    const deleteRes = await messageModel.deleteOne({ _id: messageId });

    return res.json({ deleteRes, wasDeleted: deleteRes.deletedCount ? true : false });
  }

  return res.json({ wasDeleted: false });
};

export default {
  getAllMessages,
  deleteData,
  deletedAllMessages,
};
