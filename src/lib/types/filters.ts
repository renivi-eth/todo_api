import { UserState } from '../variables/user-state';

export interface IFilters {
  completed?: boolean;
  state?: UserState;
}
