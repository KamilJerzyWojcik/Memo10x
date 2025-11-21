# Specyfikacja Techniczna Modułu Autentykacji

Dokument ten definiuje architekturę i szczegóły implementacyjne dla modułu rejestracji, logowania, zarządzania sesją i odzyskiwania hasła w aplikacji MemoWords, zgodnie z wymaganiami US-001, US-002, US-003, US-004 i US-019 oraz aktualną dokumentacją Supabase (Auth z PKCE).

## 1. Architektura Interfejsu Użytkownika (Frontend)

Frontend aplikacji (React 19 + Vite) będzie komunikował się bezpośrednio z Supabase Auth w celu zarządzania tożsamością, wykorzystując bibliotekę `@supabase/supabase-js`.

### 1.1 Nowe i Zmodyfikowane Komponenty

#### Kontekst i Stan (State Management)
*   **`AuthProvider`**: Nowy kontekst Reacta (`src/context/AuthContext.tsx`).
    *   **Inicjalizacja**: `createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)`.
    *   **Zarządzanie sesją**:
        *   Wykorzystuje `auth.getSession()` przy starcie.
        *   Nasłuchuje zmian przez `auth.onAuthStateChange((event, session) => { ... })`.
        *   Obsługuje zdarzenia: `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `PASSWORD_RECOVERY`.
    *   **Eksportuje**: Obiekt `user`, `session`, flagę `loading` oraz metody wrapperów (`signIn`, `signUp`, `signOut`, `resetPassword`, `updatePassword`).

#### Routing i Layouty
*   **`AuthLayout`**: Layout dla stron autentykacji (Logowanie, Rejestracja, Reset).
    *   Wyśrodkowany kontener (Card z shadcn/ui).
    *   Logo i powrót do strony głównej (jeśli dotyczy).
*   **`ProtectedRoute`**: Komponent wrapper (`src/components/auth/ProtectedRoute.tsx`).
    *   Sprawdza `session` z `AuthContext`.
    *   Stan `loading`: Wyświetla spinner.
    *   Brak sesji: Przekierowuje na `/login` z parametrem `?returnUrl=...`.
    *   Sesja aktywna: Renderuje `Outlet` lub `children`.
*   **Zmiany w `router.tsx`**:
    *   Trasy publiczne:
        *   `/login` (Logowanie)
        *   `/register` (Rejestracja)
        *   `/forgot-password` (Inicjowanie resetu)
        *   `/update-password` (Ustawianie nowego hasła - dostępna tylko po kliknięciu w link resetujący)
    *   Trasy chronione (wszystkie `/cards` i pochodne) owinięte w `ProtectedRoute`.

#### Formularze (React Hook Form + Zod)
Walidacja po stronie klienta przy użyciu `zod`.

1.  **`LoginForm`**:
    *   Pola: `email`, `password`.
    *   Akcja: `supabase.auth.signInWithPassword({ email, password })`.
2.  **`RegisterForm` (US-001)**:
    *   Pola: `email`, `password`, `confirmPassword`.
    *   Walidacja: Hasło min. 8 znaków, 1 cyfra.
    *   Akcja: `supabase.auth.signUp({ email, password })`.
    *   *Uwaga*: Domyślnie Supabase może wymagać potwierdzenia email. W MVP wyłączamy to w dashboardzie ("Confirm email" = OFF) dla natychmiastowego dostępu, lub obsługujemy komunikat "Sprawdź email".
3.  **`ForgotPasswordForm` (US-019)**:
    *   Pola: `email`.
    *   Akcja: `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/update-password' })`.
    *   *Ważne*: URL `/update-password` musi być dodany do "Redirect URLs" w Supabase Dashboard.
4.  **`UpdatePasswordForm`**:
    *   Pola: `password`, `confirmPassword`.
    *   Akcja: `supabase.auth.updateUser({ password })`.
    *   Kontekst: Formularz dostępny tylko gdy użytkownik jest zalogowany (sesja odzyskana z linku resetującego).

### 1.2 Obsługa Scenariuszy (Auth Flow)

*   **Logowanie (PKCE Flow)**:
    *   Standardowe logowanie hasłem. Sesja jest persystowana w `localStorage` (domyślne zachowanie `supabase-js`).
*   **Automatyczne Odświeżanie (US-003)**:
    *   Supabase Client automatycznie odświeża tokeny.
    *   Interceptor w `apiClient.ts` musi pobierać *świeży* token: `(await supabase.auth.getSession()).data.session?.access_token`.
*   **Reset Hasła (US-019)**:
    1.  Użytkownik podaje email na `/forgot-password`.
    2.  Otrzymuje email z linkiem (Action: `recovery`).
    3.  Klika link -> Przekierowanie na `/update-password` (z kodem PKCE w URL).
    4.  Aplikacja ładuje się, Supabase Client wymienia kod na sesję.
    5.  Zdarzenie `PASSWORD_RECOVERY` (lub `SIGNED_IN`) aktywuje sesję.
    6.  Użytkownik widzi formularz `UpdatePasswordForm` i ustawia nowe hasło.

---

## 2. Logika Backendowa (.NET 9)

Backend pełni rolę Resource Server. Nie zarządza sesjami, jedynie waliduje tokeny Bearer.

### 2.1 Konfiguracja JWT (Program.cs)

Wykorzystanie standardu JWT (HS256 - HMACSHA256) zgodnego z domyślną konfiguracją Supabase.

1.  **Biblioteka**: `Microsoft.AspNetCore.Authentication.JwtBearer`.
2.  **Konfiguracja**:
    ```csharp
    var supabaseUrl = builder.Configuration["Supabase:Url"];
    var supabaseKey = builder.Configuration["Supabase:JwtSecret"]; // "JWT Secret" z Dashboard -> API Settings
    var bytes = Encoding.UTF8.GetBytes(supabaseKey);

    builder.Services.AddAuthentication().AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(bytes),
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
    ```

### 2.2 User Context

*   Klasa `SupabaseUserContext` implementująca `IUserContext`.
*   Pobieranie `UserId` z claima `ClaimTypes.NameIdentifier` (lub `sub`).
*   Rejestracja w DI jako `Scoped`.

---

## 3. Konfiguracja Supabase (Dashboard)

Należy wykonać następujące kroki w panelu Supabase:

1.  **Authentication -> Providers**: Enable Email provider.
2.  **Authentication -> URL Configuration**:
    *   **Site URL**: URL produkcyjny (lub `http://localhost:5173` dla dev).
    *   **Redirect URLs**: Dodać `http://localhost:5173/update-password` (oraz inne, jeśli potrzebne).
3.  **Authentication -> Email Templates**:
    *   Dostosować szablon "Reset Password". Upewnić się, że link korzysta z `{{ .SiteURL }}/auth/callback?code=...` (standard PKCE) lub bezpośredniego linku, zależnie od konfiguracji.
    *   *Rekomendacja*: Użyć domyślnego flow Supabase, który przekieruje na `redirectTo` z parametrem `code`.

## 4. Plan Wdrożenia (Kroki)

1.  **Backend**:
    *   Dodać sekcję `Supabase` do `appsettings.json` (Url, JwtSecret).
    *   Skonfigurować `JwtBearer` w `Program.cs`.
    *   Zaimplementować `SupabaseUserContext`.
    *   Dodać `[Authorize]` do kontrolerów.
2.  **Frontend**:
    *   Zainstalować `@supabase/supabase-js` oraz `zod` `@hookform/resolvers`.
    *   Utworzyć `src/services/supabase.ts` (klient).
    *   Zaimplementować `AuthContext`.
    *   Zaktualizować `apiClient.ts` (dodawanie tokena).
    *   Stworzyć strony i formularze (`Login`, `Register`, `Forgot`, `Update`).
    *   Zaktualizować `router.tsx`.
3.  **Weryfikacja**:
    *   Test rejestracji nowego użytkownika.
    *   Test dostępu do API (czy backend poprawnie odczytuje UserId).
    *   Test resetu hasła (cała ścieżka mailowa).
