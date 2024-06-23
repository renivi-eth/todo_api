import { SortOrder } from 'mongoose';
import { SortDirection } from '../variables/sort-direction';

export interface IUserSort {
  createdAt: SortDirection;
  title: SortDirection;
  completed: SortDirection;
}
