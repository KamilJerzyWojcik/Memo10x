import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const returnUrl = useMemo(() => searchParams.get('returnUrl') ?? '/', [searchParams]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Logowanie</h1>
      <p>Brak sesji. Zaloguj się, aby kontynuować.</p>
      <p>Po zalogowaniu wrócisz do: <code>{returnUrl}</code></p>
      {/* Miejsce na właściwy formularz logowania / integrację z Supabase */}
    </div>
  );
}


