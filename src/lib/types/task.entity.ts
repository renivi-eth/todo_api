import { TaskState } from '../variables/task-state';

export interface TaskEntity {
  id: string;
  name: string;
  description: string;
  state: TaskState;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
