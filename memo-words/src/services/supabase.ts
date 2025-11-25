import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  // W trybie dev wyraźnie sygnalizujemy brak konfiguracji środowiska
  // Ustaw VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w pliku .env
  // lub w zmiennych środowiskowych Vite
  console.warn('Supabase env vars are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(url ?? '', anonKey ?? '')


