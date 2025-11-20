<conversation_summary>

<decisions>

1. Zastosować trasy: `/login` i `/cards` (domyślna), przekierowanie z `/` do `/cards`, ochrona dostępu (guard).
2. Paginacja: `page` i `pageSize` widoczne w query string. Ustawienia przechowywane wyłącznie w stanie komponentu (bez localStorage); po pełnym odświeżeniu wracają do wartości domyślnych.
3. Formularz dodawania/edycji: jeden wspólny komponent, ale osobne pełnoekranowe strony (bez dialogów/modali).
4. Generowanie AI: zablokować edycję `targetText` podczas żądania, spinner, możliwość anulowania poprzedniego żądania (AbortController), obsługa 429/502/504 z akcją „Ponów”.
5. Telemetria zdarzeń: wyłączona w MVP (brak rejestrowania eventów).
6. Uwierzytelnianie: do wdrożenia później; tymczasowo backend używa mocka użytkownika (`d8985899-2145-4139-a92e-1e35b8bc6f83`).
8. Obsługa błędów: globalny `HttpInterceptor` mapujący 422/400 na błędy pól, 401 na ścieżkę reauth, 404/409/5xx na toast + retry; 504 (AI) z komunikatem i „Ponów”.
9. Styl i prostota: najlepsze praktyki + clean code, minimalna złożoność.
10. UI: bez bibliotek zewnętrznych; własne komponenty i SCSS inspirowane stylem Picassa.

</decisions>

<matched_recommendations>

1. Zdefiniować routing: `/login`, `/cards`, `/cards/add`, `/cards/:id/edit`; przekierowanie z `/` do `/cards`; guard przygotowany pod przyszłe auth.
2. Paginacja i rozmiar strony: sterowane query paramami oraz sygnałami; brak trwałej pamięci; domyślne (page=1, pageSize=10) po odświeżeniu, jeśli brak parametrów.
3. Reużywalny komponent formularza (Add/Edit) na dwóch stronach; wspólna walidacja i mapowanie błędów 422/400.
4. Integracja AI: blokada pól, wskaźnik ładowania, anulowanie in-flight (AbortController), obsługa 429/502/504 z kontrolką „Ponów”.
5. Brak eventów telemetrycznych: usunąć/nie implementować klientskich emitów i endpointów zdarzeń.
6. Przygotować `HttpInterceptor` pod błędy i późniejsze wstrzykiwanie JWT; obecnie działa głównie jako warstwa obsługi błędów.
7. Prosty `CardsStore` i `AuthStore` oparte na Signals; źródło prawdy w pamięci, odczyt z API per widok.
8. Usuwanie bez modali: potwierdzenie inline na liście lub dedykowana strona „confirm delete”.
9. Responsywność: pełnoekranowe strony (mobile-first), grid/karty na desktopie; focus management i dostępność.
10. UI/SCSS: własny design system (typografia, spacing, kolory), nowoczesne style inspirowane kubizmem (Picasso), bez bibliotek.

</matched_recommendations>

<ui_architecture_planning_summary>

a. Główne wymagania UI:
- Interfejs PL, mobile-first, proste przepływy: dodaj → generuj (opcjonalnie) → edytuj → zapisz.
- Operacje na kartach: lista z paginacją, tworzenie, edycja, twarde usuwanie z potwierdzeniem.
- Generowanie tłumaczeń AI z możliwością wielokrotnej regeneracji i ponawiania po błędach.
- Brak telemetrii i brak zewnętrznej biblioteki UI w MVP.

b. Widoki, ekrany, przepływy:
- Routing:
  - `/login` (placeholder pod przyszłe auth; w dev może przekierowywać do `/cards`).
  - `/cards` (lista: query `page`, `pageSize`).
  - `/cards/add` (pełnoekranowa strona dodawania; generowanie AI).
  - `/cards/:id/edit` (pełnoekranowa edycja; możliwość regeneracji AI).
- Lista kart:
  - Sterowanie paginacją i rozmiarem strony w query; sygnały do stanu bieżącego.
  - Akcje wiersza: Edytuj, Usuń (z potwierdzeniem bez modali).
- Dodawanie/edycja:
  - Jeden komponent formularza; walidacja długości 1..500, mapowanie błędów 422/400.
  - AI: przycisk „Generuj/Regeneruj”, spinner, blokada `targetText`, anulowanie żądania, „Ponów” dla 429/502/504.
- Usuwanie:
  - Potwierdzenie bez modalu: inline na liście lub oddzielna trasa z potwierdzeniem.

c. Integracja z API i stan:
- Serwisy:
  - `CardsService`: `GET /cards`, `POST /cards`, `PATCH /cards/{id}`, `DELETE /cards/{id}`.
  - `AiService`: `POST /ai/translate` z anulowaniem i retry.
  - `AuthService` (stub): opcjonalnie `GET /auth/whoami` pod przyszłe auth.
- Signals:
  - `CardsStore`: sygnały `items`, `page`, `pageSize`, `total`, `loading`, `error`.
  - `AuthStore`: stan sesji (mock/później Supabase).
- Nawigacja i URL:
  - `page` i `pageSize` trzymane w query; brak trwałej pamięci; domyślne po odświeżeniu (jeśli brak parametrów).
- Błędy:
  - `HttpInterceptor`: 422/400 → błędy pól, 401 → reauth (docelowo), 404/409/5xx → toast + retry, 504 (AI) → komunikat z „Ponów”.

d. Responsywność, dostępność, bezpieczeństwo:
- Responsywność: pełnoekranowe formularze na mobile, układ kart/listy na desktopie; min. 44px obszar klikalny.
- Dostępność: `lang="pl"`, focus-trap na stronach formularzy, aria-label po polsku, kolejność tab, kontrast kolorów.
- Bezpieczeństwo:
  - MVP: brak realnego Supabase; backend ma mock user.
  - Architektura gotowa na wpięcie JWT (interceptor, guard, whoami); CORS/HTTPS po stronie serwera.

e. Styl i komponenty:
- Własny mini design system (typografia, siatka, spacing, kolory).
- Komponenty: `AppHeader`, `Paginator`, `CardListItem`, `CardForm`, `Toast`, `ConfirmInline`.
- SCSS: nowoczesne, geometryczne formy i palety inspirowane Picassiem; konsekwentna tematyzacja.

</ui_architecture_planning_summary>

<unresolved_issues>

1. Konflikt oczekiwań dot. trwałości `page/pageSize`: skoro mają być w query string, to odświeżenie zwykle zachowa wartości; czy przy odświeżeniu mamy je mimo to resetować do domyślnych, ignorując query?
2. Potwierdzenie usunięcia bez modalu: preferowane inline na liście czy dedykowana strona (np. `/cards/:id/delete`)?
3. Zachowanie `/login` w trybie mock: czy wyświetlać prostą stronę informacyjną i autologin do `/cards`, czy od razu przekierowywać?
4. Retry strategia dla AI (429/502/504): prosty „Ponów” ręczny czy dodatkowo 1–2 automatyczne próby z backoff?
5. Edycja: czy pobierać kartę przez `GET /cards/{id}` po wejściu na `/cards/:id/edit`, czy użyć danych z listy i odświeżyć w tle?
6. Potencjalne ETag/412 przy edycji (w API-plan jest wzmianka o 412): czy obsługiwać konflikt wersji już w MVP?
7. Szczegóły stylu „Picasso”: paleta i stopień „artystyczności” a czytelność (zwłaszcza kontrast i wielkości).

</unresolved_issues>

</conversation_summary>