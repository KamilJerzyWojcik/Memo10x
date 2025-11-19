# Inwentaryzacja komponentów UI (2025-11-19)

## Prymitywy UI (`src/components`)

- `AiGenerateButton` – lekki przycisk akcji pomocniczej z wbudowanym spinnerem; dziś używa inline-style i lokalnej animacji `@keyframes spin`.
- `LoadingSpinner` – pełnoekranowa zasłona ładowania wykorzystywana na poziomie stron; obecnie duplikuje animację z `AiGenerateButton`.
- `Paginator` – kontrolka nawigacji stron z obliczaniem zakresów; zarządza stanem aktywnych/wyłączonych przycisków poprzez własne style.
- `ToastProvider` / `useToast` – kontekst powiadomień i portal z prostymi wariantami kolorystycznymi (info/success/warning/error).

## Elementy layoutu i narzędzia

- `EmptyState` – komponent stanów pustych z przyciskiem nawigującym; służy jako zalążek sekcji `Section`.
- Brakuje dedykowanych komponentów takich jak `PageShell`, `PageHeader`, `Section`, `Toolbar`; ich funkcjonalność jest dziś realizowana inline w stronach.

## Komponenty domenowe

- `CardForm` – główny formularz dodawania/edycji kart z walidacją pól, obsługą przycisku AI i komunikatów o błędach.
- `CardListItem` – wizualizacja pojedynczej karty wraz z akcjami edycji/usunięcia oraz mini-dialogiem potwierdzenia.
- `CardsToolbar` – pasek narzędzi z selektorem rozmiaru strony i akcją dodawania.
- `ToastProvider` jest wykorzystywany jako globalny feedback domenowy (aktywności CRUD/AI).

## Widoki (`src/pages`)

- `CardsPage` – lista kart, integracja z API, paginacja i akcje kontekstowe.
- `AddCardPage` – proces tworzenia kart + integracja z AI.
- `EditCardPage` – modyfikacja kart wraz z obsługą stanu „dirty”.
- `LoginPage` – placeholder na integrację z Supabase.

## Zidentyfikowane duplikaty i ryzyka UX

- Prawie wszystkie przyciski i pola używają podobnych inline-styli (`padding`, `border-radius: 8px`, `border: 1px solid #222`), co utrudnia globalną zmianę wyglądu.
- Animacja spinnera pojawia się zarówno w `AiGenerateButton`, jak i `LoadingSpinner` – docelowo powinna zostać zastąpiona komponentem z design systemu.
- Brak rozdzielenia na prymitywy (`src/components/ui`) i komponenty domenowe powoduje mieszanie odpowiedzialności – migracja do shadcn/ui + Tailwind rozwiąże ten problem.
- Layout stron (nagłówki, sekcje, stopki) jest deklarowany per widok; potrzebne są szablony HIG (np. `PageShell`, `ListPageLayout`).

> Notatka: instrukcje `frontend.mdc`, `shared.mdc`, `ui-shadcn-helper.mdc` nie są obecne w repozytorium – po ich udostępnieniu można uzupełnić dodatkowe wytyczne.


