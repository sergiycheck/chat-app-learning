import mongoose from 'mongoose';
import { MessageEntity } from '../app_types';

const Schema = mongoose.Schema;

const schema = new Schema<MessageEntity>(
  {
    id: { type: String, required: true },
    message: { type: String, required: true },
    userData: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
    canDelete: { type: Boolean },
  },
  { versionKey: false },
);

const messageModel = mongoose.model('Message', schema);

export default messageModel;
