import { TaskState } from '../variables/task-state';

export interface IQueryParam {
  limit?: number;
  state?: TaskState;
}
