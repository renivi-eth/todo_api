import { UserState } from '../variables/user-state';

export interface ICreateTask {
  title: string;
  description: string;
  completed: boolean;
  tags: string[];
  state: UserState;
}
