import { TaskState } from '../variables/task-state';
import { SortDirection } from '../variables/sort-direction';

// TODO: Чьи это query параметры. Почему interface, а не type ?

export interface IQueryParam {
  limit?: number;
  state?: TaskState;
  sortColumn?: string;
  direction?: SortDirection | null;
}
