<!-- fdb714dc-acf0-4271-83d2-e9c2234109a5 0f2fbd1a-3de5-45d4-95da-02458632b7c9 -->
# Refaktor: AlertDialog, usePagination, dostępność formularza, Link zamiast navigate (klik)

## Zakres

- Zastąpienie inline confirm w `CardListItem.tsx` komponentem `AlertDialog` (shadcn/ui), bez utraty obecnego wyglądu i zachowania.
- Wydzielenie logiki paginacji do hooka `usePagination` i użycie go w `CardsPaginationToolbar.tsx`.
- Ulepszenia a11y i ergonomii w `CardForm.tsx`: `maxLength`, `aria-describedby` z `useId`, autofocus pierwszego błędnego pola.
- Zamiana imperatywnego `navigate()` na deklaratywny `Link` w miejscach wywoływanych kliknięciem w UI (pozostawiamy `navigate()` dla przepływów programatywnych po akcji).

## Zmiany plików

- `memo-words/src/components/ui/alert-dialog.tsx` (NOWY): dodanie wrappera `AlertDialog` (shadcn/ui) zgodnego stylistycznie z projektem (wykorzystanie istniejących zmiennych kolorów i cieni jak w `dialog.tsx`).
- `memo-words/src/components/CardListItem.tsx`:
  - Zastąpienie własnego inline `role="alertdialog"` -> `AlertDialog` z `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
  - Zachowanie obecnej logiki propsów: `confirming`, `onRequestDelete`, `onCancelDelete`, `onConfirmDelete` (sterujemy `open` AlertDialog przez `confirming`).
  - Przycisk „Edytuj”: zamiana na deklaratywną nawigację — `Button asChild` z `Link` do `/cards/${card.id}/edit` (opcjonalnie: zachować `onEdit` jako fallback, ale domyślnie użyć `Link`).
- `memo-words/src/hooks/usePagination.ts` (NOWY): logika `lastPage`, `pages` (z parametrem `around`), `canPrev`, `canNext`.
- `memo-words/src/components/CardsPaginationToolbar.tsx`:
  - Usunięcie lokalnego liczenia stron na rzecz `usePagination`.
  - Zachowanie istniejącego wyglądu i atrybutów ARIA; drobna poprawa dostępności (etykiety stron, `aria-current`, opcjonalnie live region).
- `memo-words/src/components/CardForm.tsx`:
  - Dodanie `maxLength={maxLen}` do obu `Textarea`.
  - Dodanie `useId` i powiązań `aria-describedby` z komunikatami błędów.
  - Efekt, który po pojawieniu się błędów ustawia focus na pierwszym niepoprawnym polu (`sourceRef` -> `targetRef`).
- Zamiana klików z `navigate()` na `Link`:
  - `memo-words/src/components/EmptyState.tsx`: `Button asChild` + `Link to={actionTo}`.
  - `memo-words/src/pages/CardsPage.tsx`: przycisk „Dodaj” -> `Button asChild` + `Link to="/cards/add"`.
  - (Opcjonalnie) przeniesienie „Edytuj” do `CardListItem.tsx` jako `Link`, aby usunąć `navigate(`/cards/${id}/edit`)` wywoływany kliknięciem.
  - Pozostałe użycia `navigate()` zostają (post-submit, auth, replacery, synchronizacja URL).

## Notatki implementacyjne

- Komponent `AlertDialog` weźmiemy ze shadcn/ui i dostosujemy stylami do obecnych (`bg-card`, `border-border/40`, cienie jak w liście).
- `usePagination` API: `usePagination({ page, pageSize, total, around = 2 }) => { lastPage, pages, canPrev, canNext }`.
- `CardForm` fokus: efekt reaguje na zmianę `errors` i ustawia focus gdy któreś pole ma błąd.
- Deklaratywna nawigacja: w `Button` używamy `asChild` i `Link` z React Router.

## Minimalne przykłady

- AlertDialog użycie w `CardListItem.tsx` (schematycznie):
```tsx
<AlertDialog open={confirming} onOpenChange={(o) => (o ? onRequestDelete(card.id) : onCancelDelete(card.id))}>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="sm">Usuń</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Na pewno?</AlertDialogTitle>
      <AlertDialogDescription>Tej operacji nie można cofnąć.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => onCancelDelete(card.id)}>Nie</AlertDialogCancel>
      <AlertDialogAction onClick={() => onConfirmDelete(card.id)}>Tak</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- Link w `EmptyState.tsx`:
```tsx
<Button size="lg" asChild>
  <Link to={actionTo}>{actionLabel}</Link>
</Button>
```

- usePagination API:
```ts
const { lastPage, pages, canPrev, canNext } = usePagination({ page, pageSize, total, around: 2 })
```

### To-dos

- [ ] Dodać `components/ui/alert-dialog.tsx` (shadcn/ui) i dopasować style
- [ ] Użyć AlertDialog w `CardListItem.tsx`; „Edytuj” jako Link; zachować propsy confirm
- [ ] Utworzyć `hooks/usePagination.ts` z logiką pages/lastPage/canPrev/canNext
- [ ] Wykorzystać `usePagination` w `CardsPaginationToolbar.tsx`, zachować UI i ARIA
- [ ] W `CardForm.tsx` dodać maxLength, aria-describedby + useId, autofocus na błędnym polu
- [ ] Zamienić klikowe navigate() na Link w `EmptyState.tsx` i „Dodaj” w `CardsPage.tsx`
- [ ] (Opcjonalnie) przenieść nawigację „Edytuj” do `CardListItem` jako Link
- [ ] Zbudować projekt i uruchomić lint; poprawić ewent. ostrzeżenia
- [ ] Przeklikać UI (paginacja, formularz, usuwanie, dodawanie) i poprawić e2e jeśli trzeba