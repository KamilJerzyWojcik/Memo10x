import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CardDto, CardsQuery, PagedResultDto } from './dtos';
import { API_BASE_URL } from '../core/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class CardsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/v1/cards`;

  getCards(query: CardsQuery): Observable<PagedResultDto<CardDto>> {
    const params = new HttpParams()
      .set('page', String(query.page))
      .set('pageSize', String(query.pageSize));
    return this.http.get<PagedResultDto<CardDto>>(this.baseUrl, { params });
    }

  deleteCard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }
}


