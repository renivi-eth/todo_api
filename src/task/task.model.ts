import { Schema, model, connect, SortOrder } from 'mongoose';
import { UserState } from '../lib/variables/user-state';
import { Document, ObjectId } from 'mongodb';

/**
 * @link src/tags/tags.controller.ts
 * sort(
      arg?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null,
      options?: { override?: boolean }
    ): this;
 */

export interface ITask {
  title: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  state?: UserState;
  user: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date },
    tags: { type: [String] },
    state: {
      type: String,
      enum: [UserState.BACKLOG, UserState.DONE, UserState.IN_PROGRESS],
      default: UserState.BACKLOG,
    },
    // ID user
    owner: { type: ObjectId, required: true },
  },
  { versionKey: false },
);

export const TaskModel = model<ITask>('Task', taskSchema);
