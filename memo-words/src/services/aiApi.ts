import { apiClient } from './apiClient';
import type { TranslateRequest, TranslateResponse } from '../types/ai';

export async function translate(req: TranslateRequest, signal?: AbortSignal): Promise<TranslateResponse> {
  return apiClient.post<TranslateResponse>('/api/v1/ai/translate', { json: req, signal });
}


