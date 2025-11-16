## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### Typy niestandardowe
- **public.event_type (ENUM)**: `generate_clicked`, `translate_generated`, `translate_failed`, `card_added_after_generate`, `edit_saved`, `delete_confirmed`, `dialog_add_canceled`

### auth.users
tabela “users” będzie obsługiwana przez Supabase Auth


### public.cards
- **Opis**: Karty słownictwa użytkownika (EN → PL), jedna tabela per wszystkich użytkowników z RLS.
- **Kolumny**:
  - `id uuid` — PRIMARY KEY, NOT NULL, DEFAULT `gen_random_uuid()`
  - `user_id uuid` — NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE
  - `source_text text` — NOT NULL, CHECK `char_length(btrim(source_text)) BETWEEN 1 AND 500`
  - `target_text text` — NOT NULL, CHECK `char_length(btrim(target_text)) BETWEEN 1 AND 500`
  - `created_at timestamptz` — NOT NULL, DEFAULT `now()`
  - `updated_at timestamptz` — NOT NULL, DEFAULT `now()`
- **Ograniczenia**:
  - CHECK: `btrim(source_text) <> ''` i `btrim(target_text) <> ''`
  - Brak dodatkowych unikalności (dopuszczalne duplikaty treści dla tego samego użytkownika)


### public.events
- **Opis**: Telemetria kluczowych zdarzeń produktowych (logi do metryki akceptacji i zdrowia).
- **Kolumny**:
  - `id uuid` — PRIMARY KEY, NOT NULL, DEFAULT `gen_random_uuid()`
  - `user_id uuid` — NULL, FK → `auth.users(id)` ON DELETE SET NULL
  - `type public.event_type` — NOT NULL
  - `created_at timestamptz` — NOT NULL, DEFAULT `now()`
  - `card_id uuid` — NULL, FK → `public.cards(id)` ON DELETE SET NULL
  - `meta jsonb` — NULL (dodatkowy kontekst, np. rozmiar promptu, czas generowania)
  - `error_code text` — NULL (np. kod błędu AI, timeout)
  - `ai_model text` — NULL (np. nazwa/model użyty do generowania)
- **Ograniczenia**:
  - Brak RLS (tabela serwisowa; dostęp kontrolowany połączeniem/service role)


## 2. Relacje między tabelami
- `auth.users (1) → public.cards (N)` przez `cards.user_id` (ON DELETE CASCADE)
- `auth.users (1) → public.events (N)` przez `events.user_id` (ON DELETE SET NULL, `user_id` opcjonalne dla trwałości logów)
- `public.cards (1) → public.events (N)` przez `events.card_id` (ON DELETE SET NULL; zachowujemy telemetrię po usunięciu karty)


## 3. Indeksy
- Automatyczne indeksy kluczy głównych:
  - `public.cards_pkey` na `cards(id)`
  - `public.events_pkey` na `events(id)`
- Indeksy wspierające najczęstsze zapytania i paginację:
  - `idx_cards_user_created_id` ON `public.cards (user_id, created_at DESC, id DESC)` — lista kart użytkownika z sortowaniem `created_at DESC, id DESC`
  - `idx_events_user_created` ON `public.events (user_id, created_at DESC)` — przegląd zdarzeń użytkownika po czasie
  - `idx_events_type_created` ON `public.events (type, created_at DESC)` — agregacje i raporty po typie zdarzenia w czasie
  - `idx_events_card_created` ON `public.events (card_id, created_at DESC)` — analizy zdarzeń powiązanych z konkretną kartą


## 4. Zasady PostgreSQL (RLS i uprawnienia)

### RLS dla public.cards
> Weryfikacja tożsamości przez Supabase JWT; dostęp tylko do własnych rekordów.

1) Włączenie RLS
- `ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;`

2) Polityki
- SELECT (tylko własne rekordy):
  - `CREATE POLICY cards_select_own ON public.cards FOR SELECT USING (user_id = auth.uid());`
- INSERT (użytkownik może wstawić tylko swoje rekordy):
  - `CREATE POLICY cards_insert_own ON public.cards FOR INSERT WITH CHECK (user_id = auth.uid());`
- UPDATE (użytkownik może zmieniać tylko swoje rekordy):
  - `CREATE POLICY cards_update_own ON public.cards FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`
- DELETE (użytkownik może usuwać tylko swoje rekordy):
  - `CREATE POLICY cards_delete_own ON public.cards FOR DELETE USING (user_id = auth.uid());`

3) Uprawnienia (zarządzane przez Supabase; przykładowo role `authenticated`/`anon`)
- Dostęp do `public.cards` wyłącznie dla roli z ważnym JWT; brak dostępu dla `anon` bez JWT.

### Brak RLS dla public.events
- RLS: wyłączone (domyślnie), tabela dostępna jedynie przez backend/serwis z service role (secret). Użytkownicy końcowi nie powinni mieć żadnych przywilejów do `public.events`.


## 5. Dodatkowe uwagi projektowe
- Wymagane rozszerzenie: `pgcrypto` (dla `gen_random_uuid()`).
- Normalizacja: 3NF — słowniki/encje minimalne; brak lokalnej tabeli profilu (źródło tożsamości: `auth.users`).
- `updated_at` aktualizowany przez warstwę aplikacji/EF Core (bez triggerów DB).
- Paginacja i sortowanie: `ORDER BY created_at DESC, id DESC` + indeks z odwróconą kolejnością kolumn jak wyżej.
- Limity długości tekstu: 1–500 znaków (można dostosować w przyszłości bez zmiany modelu EF, tylko migracja constraintu).
- Telemetria błędów AI: użycie `translate_failed` + `error_code`, opcjonalny kontekst w `meta` (JSONB) oraz `ai_model` dla analiz kosztów/skuteczności.


