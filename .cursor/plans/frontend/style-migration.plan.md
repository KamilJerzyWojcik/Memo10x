<!-- 78d03ed8-58bc-411e-8098-f95eff4a05dd 163f450a-2a45-4af7-991d-f615be473720 -->
## Redesign MemoWords na dark mode w stylu Urlopownika

### 1. Nowy motyw kolorystyczny (dark theme + koralowy akcent)

- **Przebudowa tokenów kolorystycznych** w `src/styles/tokens.css`:
- Zastąp jasne Apple‑owe kolory ciemną paletą: tło \(--color-bg, --color-bg-elevated, --color-bg-subtle\) na bardzo ciemne grafity z lekkim ociepleniem.
- Ustal nowy kolor akcentu/CTA w stylu koralowo‑pomarańczowym \(--color-primary, --color-primary-strong\) + dopasowane kolory tekstu \(--color-fg, --color-muted-foreground\).
- Dostosuj cienie \(--shadow-md/lg\) i promienie \(--radius-*\) tak, by karty przypominały te ze screenów (miękkie, lekko „pływające” nad tłem).
- **Aktualizacja mapowania Tailwind** w `src/styles/globals.css`:
- Upewnij się, że klasy takie jak `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border` korzystają z nowych ciemnych tokenów.
- Zmień globalne tło `body` i `#root` na gradient (np. `bg-gradient-to-b` z dwóch odcieni ciemnego grafitu), aby zbliżyć się do klimatu Urlopownika.

### 2. Ujednolicenie layoutu do stylu „hero + karta formularza”

- **AppShell i PageShell** (`src/components/layout/AppShell.tsx`, `PageShell.tsx`):
- Zmień tło wrappera na pełny dark gradient (jak na screenach); header lekko przezroczysty z `backdrop-blur` + cieniem.
- Dodaj delikatną pionową linię/zmiękczenie pod headerem, by wyglądał jak „przyklejona belka” nad resztą.
- **Ekrany główne** (`src/pages/LoginPage.tsx`, `CardsPage.tsx`, `AddCardPage.tsx`, `EditCardPage.tsx`):
- Dla logowania / startu: układ typu hero – po lewej duży nagłówek i opis (w stylu „Ile wolnego i przygód czeka Cię…”), po prawej duża karta formularza.
- Dla listy fiszek: zastosuj karty w siatce lub sekcje z kartami (np. panel filtrów jako karta u góry, lista kart w ciemniejszych panelach niż tło).
- Dla formularzy dodawania/edycji: większa, centralna karta z nagłówkiem, opisem i przyciskiem CTA na pełną szerokość w stylu przycisku „Oblicz mój plan”.
- **Karty informacji/statystyk** (`CardListItem.tsx`, `EmptyState.tsx`, późniejsze statystyki):
- Ujednolić karty, by przypominały „Ciekawostki podróżnicze”: duża ikona/skrót, pogrubiony tytuł, opis z wyróżnionymi liczbami w kolorze akcentu.

### 3. Mikro‑interakcje i animacje w komponentach bazowych

- **Przycisk** (`src/components/ui/button.tsx`):
- Rozszerz `buttonVariants` o lekkie animacje: `transition-transform`, `hover:-translate-y-[1px]`, `active:translate-y-0`, subtelny `shadow-md` na hover.
- Dodaj wariant „cta” jeśli potrzeba mocniejszego przycisku landingowego (większy rozmiar, gradient tła, ikona rakiety po prawej).
- **Pola formularza** (`input.tsx`, `textarea.tsx`):
- Dodaj subtelny `focus` efekt: poświata w kolorze akcentu (`ring-primary`, `shadow-[0_0_0_1px_*]`), płynne przejście koloru tła.
- **Karty / sekcje** (`card.tsx`, `layout/Section.tsx`, `layout/ListPageLayout.tsx`):
- Wejście kart przy ładowaniu: `animate-[fadeInUp_0.4s_ease-out] `definiowane w `globals.css` (keyframes fade+slide up).
- Hover na kartach ciekawostek/listy: minimalny `scale-105` i `shadow-lg` z `transition-transform`.

### 4. System „ciekawych rzeczy” przy każdej akcji

- **Mapowanie akcji domenowych → efekty**:
- Dodanie fiszki, zapis zmian, usunięcie: w `CardsPage.tsx`, `AddCardPage.tsx`, `EditCardPage.tsx`, `CardForm.tsx` oraz akcje API w `services/cardsApi.ts` – po udanym `create/update/delete` wywołuj rozszerzoną wersję hooka `useAppToast`.
- Logowanie/rejestracja (jeśli jest) – w `LoginPage.tsx` po sukcesie pokazuj bardziej „świąteczny” efekt (toast + konfetti / rozbłysk).
- **Rozbudowa `useAppToast` (`src/hooks/useAppToast.tsx`)**:
- Dodaj wsparcie dla predefiniowanych komunikatów i ikon (np. sukces: ikona rakiety, info: dzwoneczek, warning: trójkąt).
- Dla niektórych akcji (np. pierwsza fiszka w kolekcji, 10., 50.) – pokazuj specjalne toasty z dodatkowymi CTA („Zobacz swoje postępy”).
- **Specyficzne mikro‑animacje:**
- Nowo dodana fiszka (`CardListItem.tsx`): krótka animacja podświetlenia tła (płynne przejście z jaśniejszego akcentu do standardowego koloru karty).
- AI generate (`AiGenerateButton.tsx`): poza spinnerem lekka pulsacja przycisku przy `loading=true` (np. `animate-pulse` na tle lub ikonie).

### 5. Konfetti i efekty „wow” dla kluczowych momentów

- **Nowy hook `useConfetti`** (np. `src/hooks/useConfetti.ts`):
- Implementacja owijająca np. `canvas-confetti` albo prostą własną animację (abstrakcja `fireConfetti({ intensity, origin })`).
- Zapewnienie, że hook jest lekki i odpala się tylko na żądanie (lazy import biblioteki, by nie powiększać bundle niepotrzebnie).
- **Miejsca wywołania konfetti**:
- Po dodaniu pierwszej karty przez użytkownika i przy osiąganiu pułapów (np. 10/50/100 kart) – hook użyty w logice stron `AddCardPage` / `CardsPage` (po sukcesie zapisu + odświeżeniu danych).
- Po udanym logowaniu pierwszym razem w danej sesji (w `LoginPage.tsx`).
- (Opcjonalnie) Po wygenerowaniu tłumaczenia przez AI, jeśli wynik jest szczególnie „bogaty” (np. powyżej X tłumaczeń) – delikatniejsze, krótsze konfetti.

### 6. Animowany background i drobne detale brandowe

- **Tło aplikacji** (`globals.css` + `AppShell.tsx`):
- Dodaj bardzo powolny animowany gradient (np. `@keyframes gradientShift`) używany jako `bg-[radial-gradient(...)] `na pseudoelemencie lub dedykowanym divie w `AppShell`.
- Utrzymaj animację subtelną (ok. 20–30s cyklu, niewielka zmiana kolorów), by nie męczyć użytkownika.
- **Branding MemoWords**:
- Zaktualizuj „MW” w headerze (`AppShell.tsx`), by pasował do nowego motywu: ciemna karta + jasny koralowy gradient w tle avatara.
- Dodaj małe, ilustrowane emoji/ikony podróżnicze (samolot, walizka) w `PageHeader` opisów, podobnie jak na screenach.

### 7. Dostępność, wydajność i spójność

- Sprawdź kontrast nowych kolorów (szczególnie tekstu na ciemnym tle i CTA).
- Upewnij się, że wszystkie animacje są krótkie i nie blokują interakcji (max ~400ms, konfetti ~1–1.5s) oraz że aplikacja działa poprawnie bez JS animacji (progressive enhancement).
- Zweryfikuj, że globalne zmiany styli nie łamią istniejących komponentów shadcn/ui (przegląd głównych ekranów i komponentów domenowych po włączeniu dark mode).

### To-dos

- [ ] Przebudować tokeny kolorystyczne i globalne style na ciemny motyw z koralowym akcentem w `tokens.css` i `globals.css`.
- [ ] Zaktualizować główne layouty i strony (Login, Cards, Add/Edit Card), aby używały układów hero + duże karty formularzy i list w stylu Urlopownika.
- [ ] Rozszerzyć `button`, pola formularza, karty i `useAppToast` o mikro‑animacje i bogatsze komunikaty powiązane z akcjami domenowymi.
- [ ] Dodać hook `useConfetti` i wywoływać konfetti przy kluczowych akcjach (dodanie kart, progi, logowanie, AI generate).
- [ ] Dodać subtelnie animowane tło, dopasować header, ikonografię i sprawdzić kontrast oraz wydajność na całej aplikacji.