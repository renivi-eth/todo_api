import { Document, ObjectId } from 'mongodb';
import { Schema, model } from 'mongoose';

export interface IRole extends Document {
  value: 'user' | 'admin';
}
export const roleSchema = new Schema<IRole>({
  value: { type: String, unique: true, required: true },
});

//

export const RoleModel = model<IRole>('roles', roleSchema);
