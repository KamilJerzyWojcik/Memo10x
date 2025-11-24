import { useMemo } from 'react'

export interface UsePaginationParams {
  page: number
  pageSize: number
  total: number
  around?: number
}

export interface UsePaginationResult {
  lastPage: number
  pages: number[]
  canPrev: boolean
  canNext: boolean
}

export function usePagination(params: UsePaginationParams): UsePaginationResult {
  const { page, pageSize, total, around = 2 } = params

  const lastPage = useMemo(() => Math.max(1, Math.ceil(total / Math.max(1, pageSize))), [total, pageSize])

  const pages = useMemo(() => {
    const start = Math.max(1, page - around)
    const end = Math.min(lastPage, page + around)
    const result: number[] = []
    for (let p = start; p <= end; p++) result.push(p)
    if (!result.includes(1)) result.unshift(1)
    if (!result.includes(lastPage)) result.push(lastPage)
    return Array.from(new Set(result)).sort((a, b) => a - b)
  }, [page, around, lastPage])

  const canPrev = page > 1
  const canNext = page < lastPage

  return { lastPage, pages, canPrev, canNext }
}


