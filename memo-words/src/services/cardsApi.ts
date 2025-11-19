import { apiClient } from './apiClient';
import type {
  CardsQuery,
  CardDto,
  PagedResultDto,
  CreateCardRequest,
  UpdateCardRequest,
} from '../types/cards';

export async function getCards(query: CardsQuery): Promise<PagedResultDto<CardDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  return apiClient.get<PagedResultDto<CardDto>>(`/api/v1/cards?${params.toString()}`);
}

export async function createCard(payload: CreateCardRequest): Promise<CardDto> {
  return apiClient.post<CardDto>('/api/v1/cards', { json: payload });
}

export async function getCard(id: string): Promise<CardDto> {
  return apiClient.get<CardDto>(`/api/v1/cards/${encodeURIComponent(id)}`);
}

export async function updateCard(id: string, payload: UpdateCardRequest): Promise<CardDto> {
  return apiClient.patch<CardDto>(`/api/v1/cards/${encodeURIComponent(id)}`, { json: payload });
}

export async function deleteCard(id: string): Promise<void> {
  await apiClient.delete<void>(`/api/v1/cards/${encodeURIComponent(id)}`);
}


