# Architektura UI dla MemoWords

## 1. Przegląd struktury UI

MemoWords to aplikacja webowa (React, standalone components, Signals) zaprojektowana mobile‑first. UI składa się z czterech głównych widoków: lista kart, dodawanie, edycja oraz prosty ekran logowania (placeholder pod przyszłe auth). Nawigacja odbywa się poprzez ścieżki: `/login`, `/cards`, `/cards/add`, `/cards/:id/edit`, z przekierowaniem z `/` do `/cards`. Lista używa paginacji sterowanej parametrami zapytania `page` i `pageSize` (10/50/100).

- Architektura uwzględnia integrację z backendem REST (prefiks `/api/v1`) i przygotowanie pod Supabase JWT (w MVP mock użytkownika po stronie backendu). 
- Bezpieczeństwo: wszystkie żądania do `/api/v1/*` zakładają nagłówek `Authorization: Bearer <token>` (interceptor gotowy na wpięcie tokenu); w MVP ekran `/login` pełni rolę informacyjną.
- Dostępność: cały interfejs po polsku; formularze pełnoekranowe na mobile; fokus i kolejność tab zgodna z oczekiwaniami; minimalny hit target ≥44px; komunikaty błędów czytelne i mapowane z odpowiedzi API.
- Wydajność i UX: OnPush, deferrable views dla cięższych fragmentów, wczytywanie danych per widok; listy i formularze mają czytelne stany: loading, pusty, sukces, błąd.
- Obsługa błędów: globalny interceptor mapuje 422/400 na błędy pól formularza, 401 na ścieżkę reauth (`/login`), 404/409/5xx na toast + opcję ponowienia; dla AI 429/502/504 wyświetlany komunikat i przycisk „Ponów”.


## 2. Lista widoków

- Nazwa widoku: Ekran logowania (placeholder)
  - Ścieżka widoku: `/login`
  - Główny cel: Informuje o wymaganym zalogowaniu i przygotowuje UI pod przyszłą integrację z Supabase Auth; w dev może przekierować do `/cards`.
  - Kluczowe informacje do wyświetlenia: Komunikat „Zaloguj się, aby używać aplikacji”; w dev skrót/przycisk przejścia do listy.
  - Kluczowe komponenty widoku: `AppHeader`, panel informacji, akcja „Przejdź do listy” (dev), placeholder pod formularz logowania.
  - UX, dostępność i względy bezpieczeństwa: Prosty, zrozumiały komunikat; brak zbierania haseł w UI; po zalogowaniu (docelowo) redirect do `/cards`; guard/interceptor przygotowane na 401.

- Nazwa widoku: Lista kart
  - Ścieżka widoku: `/cards` (query: `page` [domyślnie 1], `pageSize` [10|50|100, domyślnie 10])
  - Główny cel: Wyświetla karty użytkownika posortowane malejąco po `createdAt`, umożliwia zmianę rozmiaru strony, przejście do dodania/edycji oraz twarde usunięcie z potwierdzeniem inline.
  - Kluczowe informacje do wyświetlenia: `items` (sourceText, targetText, createdAt, updatedAt), `page`, `pageSize`, `total`, `hasNextPage`; stan pusty z sugestią dodania pierwszej karty.
  - Kluczowe komponenty widoku: `AppHeader`, `Paginator` (10/50/100), `CardListItem` (akcje: Edytuj, Usuń), `ConfirmInline` (potwierdzenie usunięcia bez modali), `EmptyState`, `Toast`, `LoadingSpinner`.
  - UX, dostępność i względy bezpieczeństwa: Mobile‑first; duże obszary dotykowe; potwierdzenie usunięcia inline z jasnym komunikatem o braku cofania; 401 → `/login`; 404/409/5xx → toast z ponów; paginacja i rozmiar strony synchronizowane w URL; respektujemy wartości z query jeśli obecne.

- Nazwa widoku: Dodawanie karty
  - Ścieżka widoku: `/cards/add`
  - Główny cel: Utworzenie nowej karty ze słowem/kolokacją i tłumaczeniem; opcjonalna integracja AI do generowania propozycji (wielokrotne „Regeneruj” w ramach sesji).
  - Kluczowe informacje do wyświetlenia: Pola formularza `sourceText` i `targetText`; stan generatora AI (idle/loading/error); wskazania walidacji (1..500 znaków po przycięciu); komunikaty 429/502/504 dla AI z przyciskiem „Ponów”.
  - Kluczowe komponenty widoku: `CardForm` (wspólny z edycją), `AiGenerateButton` ze spinnerem i blokadą edycji `targetText` podczas żądania, `Toast`, `LoadingSpinner`.
  - UX, dostępność i względy bezpieczeństwa: Pełnoekranowy formularz, focus management; w trakcie generowania blokada tylko `targetText`; brak limitów funkcjonalnych regeneracji; po zapisie redirect do `/cards?page=1` i wyróżnienie nowej karty; zachowanie wartości pól przy błędach.

- Nazwa widoku: Edycja karty
  - Ścieżka widoku: `/cards/:id/edit`
  - Główny cel: Aktualizacja `sourceText` i/lub `targetText`; opcjonalna regeneracja tłumaczenia AI.
  - Kluczowe informacje do wyświetlenia: Bieżące wartości karty; walidacja 1..500; stan AI (jak w dodawaniu); znaczniki `updatedAt` po sukcesie.
  - Kluczowe komponenty widoku: `CardForm` (z danymi wyjściowymi), `AiGenerateButton` ze spinnerem i blokadą edycji `targetText` podczas żądania, `Toast`, `LoadingSpinner`.
  - UX, dostępność i względy bezpieczeństwa: Preferowane użycie danych z listy jeśli dostępne; w przeciwnym razie pobranie przez `GET /cards/{id}`; po zapisie powrót do `/cards` z zachowaniem `page` i `pageSize`; 404 → toast + powrót do listy.

- Nazwa widoku: Potwierdzenie usunięcia (Modal)
  - Ścieżka widoku: W obrębie `/cards` (komponent inline zamiast odrębnej trasy)
  - Główny cel: Jasne, nieodwracalne potwierdzenie twardego usunięcia przez modal.
  - Kluczowe informacje do wyświetlenia: Nazwa/uszczegółowienie usuwanej karty; ostrzeżenie o braku cofania.
  - Kluczowe komponenty widoku: `ConfirmModal` (przyciski „Tak”/„Nie”), `Toast` po 204.
  - UX, dostępność i względy bezpieczeństwa: Wyraźny kontrast i tekst ostrzegawczy; focus na „Nie” jako bezpieczna domyślna akcja; brak opcji „Cofnij” po usunięciu.

- Nazwa widoku: Fallback 404
  - Ścieżka widoku: `**` (catch‑all) → redirect do `/cards`
  - Główny cel: Łagodne przechwycenie nieznanych adresów.
  - Kluczowe komponenty widoku: bezpośrednie przekierowanie.
  - UX, dostępność i względy bezpieczeństwa: Minimalne tarcie; powrót do głównego widoku.


## 3. Mapa podróży użytkownika

- Główny przepływ: Dodanie karty z AI (US‑007, US‑008, US‑009)
  1) Użytkownik na `/cards` wybiera „Dodaj” → przejście do `/cards/add`.
  2) Wpisuje `sourceText` (EN). Opcjonalnie klika „Generuj”: UI blokuje `targetText`, pokazuje spinner; po sukcesie pole `targetText` uzupełnione i odblokowane; przy błędach 429/502/504 komunikat + „Ponów”.
  3) Użytkownik może edytować oba pola; zapis (POST) powoduje redirect do `/cards?page=1`, nowa karta widoczna u góry, krótkie wyróżnienie.
  4) Błędy 422/400 pokazane inline przy polach; wartości pól zachowane.

- Przepływ edycji (US‑010)
  1) Z listy `/cards` użytkownik wybiera „Edytuj” → `/cards/:id/edit`.
  2) Formularz pokazuje wartości; możliwa regeneracja AI jak w dodawaniu.
  3) Zapis (PATCH) odświeża `updatedAt`; redirect do `/cards` z zachowaniem `page` i `pageSize`, element może zostać lekko wyróżniony.
  4) 404 podczas wejścia/patcha → toast + powrót do listy; 412 (opcjonalnie) → komunikat o konflikcie i propozycja odświeżenia.

- Przepływ usuwania (US‑011)
  1) W wierszu listy klik „Usuń” otwiera `ConfirmModal` z ostrzeżeniem.
  2) „Tak” wywołuje DELETE; po 204 element znika z listy; „Nie” zamyka potwierdzenie.

- Przeglądanie listy i paginacja (US‑005, US‑006)
  - Lista sortowana `createdAt DESC`; `page` i `pageSize` w query; zmiana rozmiaru strony i strony aktualizuje URL oraz odświeża dane.

- Sesja i logowanie (US‑001, US‑002, US‑003, US‑004)
  - MVP: backend używa mock user; UI ma `/login` jako placeholder; przy 401 interceptor kieruje na `/login`. Po przyszłym wdrożeniu Supabase, `/login` stanie się realnym ekranem logowania; po sukcesie redirect do `/cards`.

- Błędy i stany brzegowe (US‑014, US‑015, US‑016)
  - 401 → `/login`; 422 → błędy pól; 404/409/5xx → toast + „Ponów” (gdy ma sens); AI 429/502/504 → komunikat + „Ponów”; brak cofania po DELETE.


## 4. Układ i struktura nawigacji

- Drzewo tras
  - `/` → redirect do `/cards`
  - `/login`
  - `/cards` (query: `page`, `pageSize`)
    - `/cards/add`
    - `/cards/:id/edit`
  - `**` → redirect do `/cards`

- Nawigacja i sterowanie URL
  - Paginacja i rozmiar strony utrzymywane w query string; przy odświeżeniu respektujemy wartości z URL (jeśli obecne), w przeciwnym razie ustawiamy domyślne (page=1, pageSize=10).
  - Po dodaniu nowej karty nawigacja do `/cards?page=1` (nowa karta widoczna u góry); po edycji powrót do listy z zachowaniem bieżących parametrów.

- Ochrona dostępu i błędy
  - Guard/interceptor przygotowane na przyszłe JWT (Supabase). 401 skutkuje przekierowaniem do `/login`.
  - Globalny `HttpInterceptor` mapuje statusy błędów i agreguje obsługę toasts oraz retry.

- Layout i responsywność
  - `AppHeader` z nawigacją (link do listy, przycisk „Dodaj”).
  - Mobile‑first: pełnoekranowe formularze, czytelne odstępy i typografia; na desktopie układ listy/kart.


## 5. Kluczowe komponenty

- `AppHeader`: Pasek nagłówka; link do `/cards`, akcja „Dodaj” (→ `/cards/add`), placeholder pod przyszłe „Wyloguj”.
- `Paginator`: Steruje `page` i `pageSize` (10/50/100), synchronizuje parametry w URL; przyciski poprzednia/następna, numery stron.
- `CardListItem`: Prezentacja karty (EN → PL) z akcjami „Edytuj”, „Usuń”; stan rozwijany dla `ConfirmInline`.
- `ConfirmModal`: Komponent potwierdzenia twardego usunięcia (przyciski „Tak”/„Nie”, ostrzeżenie o braku cofania).
- `CardForm`: Reużywalny formularz dodawania/edycji z walidacją 1..500, licznik znaków, mapowanie błędów 422/400, zachowanie wartości pól po błędach.
- `AiGenerateButton`: Przycisk „Generuj/Regeneruj” z loaderem; blokuje edycję `targetText` podczas żądania; obsługa anulowania in‑flight; komunikaty 429/502/504 z „Ponów”.
- `Toast`: Lekki system powiadomień (sukces/błąd), używany przez interceptor i akcje CRUD.
- `LoadingSpinner` / `LoadingBar`: Wizualne stany ładowania dla listy, formularzy i AI.
- `EmptyState`: Widok pustej listy z zachętą do dodania pierwszej karty.
- `ErrorState` (opcjonalny): Prezentacja błędów 5xx/404 z działaniem „Ponów”/„Powrót”.
- `HttpInterceptor` (infrastrukturalny): Mapowanie błędów 422/401/404/409/5xx; w przyszłości wstrzykiwanie JWT do `Authorization`.
- `AuthGuard` (przygotowany): Ochrona tras pod `/cards/*` po wdrożeniu JWT; w MVP może być pasywny.
- `CardsStore` (Signals) i serwisy: Przechowywanie `items`, `page`, `pageSize`, `total`, `loading`, `error`; serwisy wywołują API:
  - Lista: `GET /api/v1/cards?page=&pageSize=`
  - Tworzenie: `POST /api/v1/cards`
  - Edycja: `PATCH /api/v1/cards/{id}`
  - Usuwanie: `DELETE /api/v1/cards/{id}`
  - AI: `POST /api/v1/ai/translate`
  - (opcjonalnie) WhoAmI: `GET /api/v1/auth/whoami`



