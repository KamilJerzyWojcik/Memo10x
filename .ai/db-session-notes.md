<conversation_summary>

<decisions>
1. Uwierzytelnianie wyłącznie przez Supabase (`auth.users` jako źródło tożsamości; brak lokalnej tabeli profilu).
2. Nie tworzymy żadnych indeksów (ani unikalnych, ani wydajnościowych).
3. Model `cards` (MVP): `id uuid`, `user_id uuid`, `source_text text`, `target_text text`, `created_at timestamptz`, `updated_at timestamptz`.
4. Aktualizacja `updated_at` realizowana przez aplikację/EF (bez triggerów w DB).
5. Paginacja: `OFFSET/LIMIT`; sortowanie: `ORDER BY created_at DESC, id DESC`.
6. RLS tylko na `cards` dla `SELECT/INSERT/UPDATE/DELETE` z warunkiem `user_id = auth.uid()`.
7. `events` (telemetria): `id uuid`, `user_id uuid`, `type enum`, `created_at timestamptz default now()`, `card_id uuid null`, `meta jsonb`, `error_code text`, `ai_model text`; użytkownicy nie mają dostępu.
8. Brak retencji/partycjonowania dla `events`.
9. Usunięcie użytkownika usuwa wszystkie jego karty (`cards.user_id ON DELETE CASCADE`).
</decisions>

<matched_recommendations>
1. Użycie `uuid` z `gen_random_uuid()` dla kluczy głównych i `timestamptz` z `DEFAULT now()` (zgodne z EF Core i Supabase).
2. RLS: polityki `USING/WITH CHECK user_id = auth.uid()` wyłącznie na `cards` dla wszystkich operacji (SELECT/INSERT/UPDATE/DELETE).
4. Paginacja i sortowanie deterministyczne: `ORDER BY created_at DESC, id DESC`.
5. Ograniczenia walidacyjne na `cards`: `NOT NULL`, brak pustych po `trim()`, limity długości pól (rozsądne, np. do ustalenia).
6. Relacje FK: `cards.user_id → auth.users(id) ON DELETE CASCADE`; `events.user_id → auth.users(id)` i `events.card_id → cards(id)` (szczegóły kaskad dla `events` do doprecyzowania).
7. EF Core jako narzędzie migracji, z użyciem surowego SQL do: typu ENUM (`events.type`) i polityk RLS (wymóg Supabase).
</matched_recommendations>

<database_planning_summary>
- Główne wymagania:
  - Uwierzytelnianie i identyfikacja użytkownika przez Supabase (`auth.users`).
  - pełna historia zdarzeń w `events` bez retencji.
  - Paginacja `OFFSET/LIMIT` i deterministyczne sortowanie `created_at DESC, id DESC`.

- Kluczowe encje i relacje:
  - `cards`: `id uuid PK`, `user_id uuid NOT NULL → auth.users(id) ON DELETE CASCADE`, `source_text text NOT NULL`, `target_text text NOT NULL`, `created_at timestamptz DEFAULT now() NOT NULL`, `updated_at timestamptz DEFAULT now() NOT NULL`.
  - `events`: `id uuid PK`, `user_id uuid NOT NULL → auth.users(id)`, `type enum NOT NULL`, `created_at timestamptz DEFAULT now() NOT NULL`, `card_id uuid NULL → cards(id)`, `meta jsonb`, `error_code text`, `ai_model text`.
  - Brak tabel lokalnych profili; `auth.users` jako jedyna referencja użytkownika.

- Bezpieczeństwo:
  - RLS włączone tylko dla `cards` z warunkiem `user_id = auth.uid()` na SELECT/INSERT/UPDATE/DELETE.
  - `events` niedostępne dla użytkowników; dostęp przewidziany dla serwisu/analityki (np. przez rolę serwisową lub backend).
  - Brak RLS na `events` zgodnie z decyzją, co wymaga kontroli dostępu na poziomie warstwy aplikacji/połączenia (np. service key).

- Wydajność i skalowalność:
  - Świadoma rezygnacja z indeksów — pełne skany przy sortowaniu/paginacji; akceptacja wpływu na wydajność MVP.
  - Brak retencji/partycjonowania `events` — możliwy wzrost wolumenu i kosztów zapytań w czasie.
  - Brak kontroli współbieżności (rezygnacja z tokenów/`xmin`).

- Integralność i spójność:
  - Ograniczenia: `NOT NULL` dla kluczowych kolumn; walidacje długości i pustych wartości po `trim()` dla `source_text` i `target_text` (np. sensowny limit znaków).
  - `updated_at` aktualizowany przez aplikację/EF (bez triggerów).
  - ENUM dla `events.type` zgodny z katalogiem zdarzeń z PRD.

- Implementacja (EF Core + Supabase):
  - Migracje EF z surowym SQL do: `CREATE TYPE` dla `events.type`, `ENABLE ROW LEVEL SECURITY` i `CREATE POLICY` na `cards`.
  - Domyślne wartości: `gen_random_uuid()` dla PK, `now()` dla znaczników czasu.
</database_planning_summary>

<unresolved_issues>
1. `events.user_id` i `events.card_id` — zachowanie przy usunięciu: czy `events.user_id` ma kaskadować (DELETE CASCADE) czy zachowywać rekordy? Czy `events.card_id` powinno mieć `ON DELETE SET NULL`?
2. Dokładny zestaw wartości dla ENUM `events.type` (np. `generate_clicked`, `translate_generated`, `card_added_after_generate`, `edit_saved`, `delete_confirmed`, `dialog_add_canceled`) — potwierdzenie listy.
3. Konkretne limity długości dla `source_text` i `target_text` (np. 500 znaków?) — finalizacja wartości.
4. Sposób generowania `uuid`: czy używamy DB (`gen_random_uuid()`) czy generujemy w aplikacji i wstawiamy z EF — do potwierdzenia w kontekście spójności.
</unresolved_issues>

</conversation_summary>