import mongoose from 'mongoose';
import { UserData } from '../app_types';

const Schema = mongoose.Schema;

const userSchema = new Schema<UserData>(
  {
    id: String,
    username: String,
    socketId: String,
  },
  { versionKey: false },
);

const userModel = mongoose.model('User', userSchema);
export const currentUsersInChatModel = mongoose.model('UserInChat', userSchema);

export default userModel;
