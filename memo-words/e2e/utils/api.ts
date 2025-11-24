import type { APIRequestContext } from '@playwright/test'

export interface PagedResultDto<T> {
  items: T[]
  total: number
}

export interface CardDto {
  id: string
  sourceText: string
  targetText: string
  createdAt: string
  updatedAt: string
}

export function createApi(
  request: APIRequestContext,
  baseUrl: string,
  token: string,
  options?: { timeoutMs?: number }
) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  const timeout = options?.timeoutMs ?? 60_000

  return {
    async listCards(page = 1, pageSize = 100): Promise<PagedResultDto<CardDto>> {
      const res = await request.get(
        `${baseUrl}/api/v1/cards?page=${page}&pageSize=${pageSize}`,
        { headers, timeout }
      )
      if (!res.ok()) throw new Error(`GET cards failed: ${res.status()} ${await res.text()}`)
      return res.json()
    },

    async deleteCard(id: string): Promise<void> {
      const res = await request.delete(
        `${baseUrl}/api/v1/cards/${encodeURIComponent(id)}`,
        { headers, timeout }
      )
      if (!res.ok()) throw new Error(`DELETE card failed: ${res.status()} ${await res.text()}`)
    },

    async createCard(sourceText: string, targetText: string): Promise<CardDto> {
      const res = await request.post(`${baseUrl}/api/v1/cards`, {
        headers,
        timeout,
        data: { sourceText, targetText },
      })
      if (!res.ok()) throw new Error(`POST card failed: ${res.status()} ${await res.text()}`)
      return res.json()
    },

    async updateCard(id: string, targetText: string): Promise<CardDto> {
      const res = await request.patch(`${baseUrl}/api/v1/cards/${encodeURIComponent(id)}`, {
        headers,
        timeout,
        data: { targetText },
      })
      if (!res.ok()) throw new Error(`PATCH card failed: ${res.status()} ${await res.text()}`)
      return res.json()
    },

    async listAllCards(maxPages = 20, pageSize = 100): Promise<CardDto[]> {
      const result: CardDto[] = []
      for (let page = 1; page <= maxPages; page++) {
        const res = await this.listCards(page, pageSize)
        result.push(...res.items)
        if (res.items.length < pageSize) break
      }
      return result
    },

    async deleteAllCards(): Promise<void> {
      const all = await this.listAllCards()
      await Promise.all(all.map(c => this.deleteCard(c.id)))
    },
  }
}


