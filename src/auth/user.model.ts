import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  email?: string;
  roles: string[];
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    roles: [{ type: String, ref: 'roles' }],
  },
  { versionKey: false },
);

export const UserModel = model<IUser>('users', userSchema);
