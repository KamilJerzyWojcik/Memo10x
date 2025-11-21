<!-- bcac4c98-474c-43b9-a023-db52563e56a9 7b6dde68-e09d-4897-9437-6ea624ca9f7d -->
# Plan Wdrożenia Autentykacji (Supabase + React + .NET)

Celem jest zastąpienie mockowej autentykacji pełną integracją z Supabase Auth, zgodnie z wymaganiami PRD i aktualnymi wytycznymi Supabase.

## 1. Architektura Interfejsu Użytkownika (Frontend)

### Konfiguracja Klienta Supabase
- **Biblioteki**: Użycie `@supabase/supabase-js` (najnowsza wersja stabilna).
- **Inicjalizacja**: `src/lib/supabase.ts` – singleton klienta `createClient` z konfiguracją `auth.persistSession: true`.
- **Przechowywanie sesji**: Domyślne zachowanie (localStorage) jest zalecane dla SPA React.

### Nowe Komponenty i Struktura
- **AuthContext**: `src/context/AuthContext.tsx`
  - Wykorzystanie hooka `useEffect` do subskrypcji zmian stanu: `supabase.auth.onAuthStateChange`.
  - Zarządzanie stanem sesji (loading, user, session).
  - Udostępnianie metod wrapperów: `signIn`, `signUp`, `signOut`, `resetPassword`.
- **ProtectedRoute**: `src/components/auth/ProtectedRoute.tsx` – weryfikacja `session` z kontekstu.

### Strony (Pages)
- **LoginPage.tsx**: Obsługa `supabase.auth.signInWithPassword`.
- **RegisterPage.tsx**: Obsługa `supabase.auth.signUp`.
  - Ważne: Konfiguracja `emailRedirectTo` na URL frontendu, jeśli wymagane potwierdzenie email (w MVP wyłączone w PRD, ale warto obsłużyć parametr w kodzie).
- **ForgotPasswordPage.tsx**: `supabase.auth.resetPasswordForEmail` z parametrem `redirectTo`.
- **ResetPasswordPage.tsx**: `supabase.auth.updateUser` (wymiana hasła po kliknięciu w link).

### Zmiany w istniejących plikach
- **router.tsx**: Nowe trasy `/register`, `/forgot-password`, `/reset-password`.
- **apiClient.ts**:
  - Zastąpienie logiki w `getAuthToken`.
  - **Nowe podejście**: Pobieranie `access_token` bezpośrednio z `supabase.auth.getSession()` (gwarantuje świeży token, odświeżony automatycznie przez bibliotekę JS).
- **AppShell.tsx**: Wyświetlanie stanu zalogowania z `AuthContext`.

## 2. Logika Backendowa (.NET API)

### Konfiguracja JWT Bearer
- **Pakiet**: `Microsoft.AspNetCore.Authentication.JwtBearer`.
- **Walidacja**:
  - Supabase używa standardu HS256 (symetryczny) lub RS256 (asymetryczny). Domyślne projekty używają HS256 z `JWT Secret` z dashboardu.
  - **Ważne**: Weryfikacja `ValidAudience` (zazwyczaj "authenticated") i `ValidIssuer` (URL projektu Supabase).
  - **Token Refresh**: Backend nie odświeża tokenów – polega na tym, że klient (React) przesyła zawsze ważny token.

### Serwisy i Infrastruktura
- **UserContext**: `Infrastructure/Auth/UserContext.cs`.
  - Odczyt `ClaimTypes.NameIdentifier` (sub) z `HttpContext.User`.
  - Użycie `IHttpContextAccessor`.
- **Usunięcie**: `MockUserContext.cs`.
- **Kontrolery**: Dodanie `[Authorize]` do wszystkich chronionych akcji.

## 3. System Autentykacji (Supabase)

### Konfiguracja Projektu (Instrukcje dla użytkownika)
- Wyłączenie "Confirm email" w dashboardzie Supabase (zgodnie z PRD MVP - brak weryfikacji email).
- Ustawienie Site URL na `http://localhost:5173` (dla przekierowań i linków magicznych).

### Flow
1. **Logowanie**: React -> `supabase.auth.signInWithPassword()` -> Supabase zwraca Session (Access Token + Refresh Token).
2. **API Request**: React -> `apiClient` pobiera `session.access_token` -> Request z nagłówkiem `Authorization: Bearer ...`.
3. **Weryfikacja**: .NET Middleware weryfikuje podpis tokenu kluczem sekretnym (`JWT Secret`).
4. **Kontekst**: .NET wyciąga `sub` (UUID użytkownika) i używa go w zapytaniach do bazy (np. `Where(x => x.UserId == userId)`).

### Specyfikacja zmian (plik .ai/auth-spec.md)
Zostanie utworzony plik `.ai/auth-spec.md` zawierający szczegółowy opis techniczny, uwzględniający powyższe, zaktualizowane o dokumentację Supabase informacje.

### To-dos

- [ ] Zapisanie specyfikacji architektury do pliku .ai/auth-spec.md