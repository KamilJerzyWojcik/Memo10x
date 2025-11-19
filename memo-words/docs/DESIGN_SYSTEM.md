# MemoWords Design System (Tailwind 4 + shadcn/ui)

## Tokens i motyw
- Źródło: `src/styles/tokens.css`, importowane w `src/styles/globals.css`.
- Kolory inspirowane Apple HIG (`--color-bg`, `--color-primary`, stany success/warning/destructive).
- Typografia: `--font-sans` (SF Pro stack) + rozmiary body/sm/xs.
- Spacing i promienie (`--space-*`, `--radius-*`) oraz cienie (`--shadow-sm/md/lg`) mapowane do Tailwind przez `@theme`.
- Używaj klas Tailwind (np. `text-muted-foreground`, `bg-card`) – każda odpowiada zmiennej z tokenów.

## Prymitywy UI (`src/components/ui`)
- `button.tsx` – warianty: `default`, `secondary`, `outline`, `ghost`, `destructive`, `subtle`; rozmiary: `sm/md/lg/icon`.
- `input.tsx`, `textarea.tsx` – pola formularzy z ringiem `--color-ring`.
- `card.tsx` – `Card`, `CardHeader`, `CardContent`, `CardFooter`.
- `dialog.tsx` – wrapper Radix (`Dialog`, `DialogContent`, itp.) z półprzezroczystą warstwą i `shadow-lg`.
- `toast.tsx`, `use-toast.ts`, `toaster.tsx` – globalny system powiadomień; warianty `default/success/warning/destructive`.
- `lib/utils.ts` – helper `cn`.
- Wszystkie prymitywy korzystają wyłącznie z klas Tailwind (brak inline-style).

## Layouty (`src/components/layout`)
- `AppShell` – lepkie navbar + slot `children`; zawiera akcje logowania/wylogowania (wpięty w `router.tsx`).
- `PageShell` – kolumnowy kontener wewnątrz AppShell.
- `PageHeader` – nagłówek sekcji, obsługuje opis i akcję primary.
- `Section` – blok treści (rounded-3xl, border, blur).
- `ListPageLayout`, `FormPageLayout`, `DetailPageLayout` – kompozycje HIG dla list, formularzy i widoków szczegółowych.

## Komponenty domenowe (migracja zakończona)
- `CardForm`, `CardListItem`, `CardsToolbar`, `Paginator`, `EmptyState`, `AiGenerateButton`, `LoadingSpinner` korzystają z prymitywów shadcn + Tailwind.
- `CardsPage`, `AddCardPage`, `EditCardPage`, `LoginPage` używają nowych layoutów.
- Brak inline-style i legacy `.css` w `src/components` / `src/pages`.

## Wzorce interakcji
- Toasty: używaj `useAppToast` (mapuje domenowe typy `info/success/warning/error` na warianty shadcn + wstawia CTA z `Button`).
- Formularze: `CardForm` demonstruje walidację, liczniki znaków i stany disabled, opierając się na `Textarea` + `Button`.
- Listy: `CardListItem` pokazuje highlight (np. po dodaniu) oraz dialog potwierdzenia w stylu Apple.

## QA checklist (przed merge)
- `npm run build` (wymóg z `frontend.mdc` po każdej modyfikacji).
- Sprawdź widoki na szerokości `<640px` i `>=1024px` – layouty używają gridów `lg:*`.
- Zweryfikuj kontrast na `CardListItem` (highlight) oraz focus ringi formularzy.
- Potwierdź, że wszystkie wywołania API (get/create/update/delete/AI) korzystają z `useAppToast`.
- W razie potrzeby dopisz nowe prymitywy w `src/components/ui` i dokumentuj w tym pliku.


