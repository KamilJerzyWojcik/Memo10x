export function withTs(base: string): string {
  return `${base} ${new Date().toISOString().replace(/[:.]/g, '-')}`
}


