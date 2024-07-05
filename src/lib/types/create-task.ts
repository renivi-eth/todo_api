import { UserState } from '../variables/user-state';

export interface ICreateTask {
  name: string;
  description: string;
  tags: string;
  state: string;
}
