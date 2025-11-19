export type PageSize = 10 | 50 | 100;

export interface CardDto {
  id: string;
  sourceText: string;
  targetText: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardRequest {
  sourceText: string;
  targetText: string;
}

export interface PagedResultDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface CardsQuery {
  page: number;
  pageSize: PageSize;
}

export interface CardsPageState {
  items: CardDto[];
  page: number;
  pageSize: PageSize;
  total: number;
  hasNextPage: boolean;
  loading: boolean;
  deletingIds: Set<string>;
}


