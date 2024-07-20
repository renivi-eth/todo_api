import { TaskState } from '../variables/task-state';
import { SortDirection } from '../variables/sort';

export interface IQueryParam {
  limit?: number;
  state?: TaskState;
  sortColumn?: string;
  direction?: SortDirection | null;
}
