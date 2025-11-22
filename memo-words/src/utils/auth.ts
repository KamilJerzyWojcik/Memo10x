export function getAuthToken(): string | null {
  // Fallback dla tokena jeśli Supabase.getSession() jest niedostępne.
  // Preferowane źródło: supabase.auth.getSession().
  const candidates = [
    'sb-access-token', // custom/local
    'access_token', // generic
  ];
  for (const key of candidates) {
    const value = localStorage.getItem(key);
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  // If Supabase SDK is used, consider integrating supabase.auth.getSession() here.
  return null;
}


