import { SortDirection } from '../variables/sort-direction';

export type TagsQueryParams = {
  limit: string;
  sortProperty?: string;
  sortDirection?: SortDirection;
};
