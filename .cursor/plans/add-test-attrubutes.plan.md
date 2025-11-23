<!-- 36ae9d5c-091d-4c4a-918b-0e9777e61e6d eb678c7c-6150-40a4-ab23-98eba4716a5a -->
# Plan: Dodanie data-testid dla CardForm pod E2E

### Założenia

- Używamy atrybutu `data-testid` (zgodnie z regułą repo), nie `data-test-id`.
- Minimalne, nieinwazyjne zmiany – tylko atrybuty, bez modyfikacji logiki.
- Scenariusze pokrywają Add/Edit, generowanie AI, walidacje, stany disabled/readonly.

### Miejsca i wartości data-testid

- `memo-words/src/components/CardForm.tsx`
  - Form root: `data-testid="cardform"`
  - Pole EN (Textarea id="sourceText"): `data-testid="cardform-source"`
  - Błąd pola EN (div role="alert"): `data-testid="cardform-source-error"`
  - Licznik EN (div z `{(sourceCount ?? sourceText.trim().length)}/{maxLen}`): `data-testid="cardform-source-count"`
  - Sekcja nagłówka tłumaczenia (wrapper label + GenerateButton): `data-testid="cardform-generate-area"`
  - Pole PL (Textarea id="targetText"): `data-testid="cardform-target"`
  - Błąd pola PL (div role="alert"): `data-testid="cardform-target-error"`
  - Licznik PL (div z `{(targetCount ?? targetText.trim().length)}/{maxLen}`): `data-testid="cardform-target-count"`
  - Submit (Button): `data-testid="cardform-submit"` (stałe niezależnie od `submitLabel` – „Dodaj”/„Zapisz”)
  - Cancel (Button variant="ghost"): `data-testid="cardform-cancel"`

- `memo-words/src/components/AiGenerateButton.tsx`
  - Główny Button: `data-testid="cardform-generate"`
  - (opcjonalnie) Spinner: `data-testid="cardform-generate-spinner"`

### Przykładowe, zwięzłe zmiany (podgląd)

- W `CardForm.tsx` (fragmenty):
```tsx
<form data-testid="cardform" ...>
  ...
  <Textarea id="sourceText" data-testid="cardform-source" ... />
  <div className="flex ...">
    {errors.sourceText ? (
      <div role="alert" data-testid="cardform-source-error" className="text-destructive">{errors.sourceText}</div>
    ) : <span />}
    <div data-testid="cardform-source-count">{(sourceCount ?? sourceText.trim().length)}/{maxLen}</div>
  </div>
  ...
  <div className="flex ..." data-testid="cardform-generate-area">
    <label htmlFor="targetText" ...>Tłumaczenie (PL)</label>
    {GenerateButton ? (<GenerateButton ... />) : null}
  </div>
  <Textarea id="targetText" data-testid="cardform-target" ... />
  <div className="flex ...">
    {errors.targetText ? (
      <div role="alert" data-testid="cardform-target-error" className="text-destructive">{errors.targetText}</div>
    ) : <span />}
    <div data-testid="cardform-target-count">{(targetCount ?? targetText.trim().length)}/{maxLen}</div>
  </div>
  ...
  <Button type="submit" data-testid="cardform-submit">{submitLabel}</Button>
  <Button type="button" data-testid="cardform-cancel" variant="ghost" ...>Anuluj</Button>
</form>
```

- W `AiGenerateButton.tsx` (fragment):
```tsx
<Button type="button" data-testid="cardform-generate" ...>
  {loading ? (
    <span data-testid="cardform-generate-spinner" aria-hidden="true" className="h-4 w-4 animate-spin ..." />
  ) : null}
  <span>{loading ? 'Generowanie…' : 'Generuj'}</span>
</Button>
```


### Mapowanie na scenariusze E2E (kluczowe kroki → selektory)

- Walidacja EN: `getByTestId('cardform-source')` → `click('cardform-submit')` → `getByTestId('cardform-source-error')`
- Generowanie: `getByTestId('cardform-generate')` → sprawdź disabled/label; `getByTestId('cardform-target')` ma `readonly` w trakcie i uzupełnia się po.
- Liczniki: `getByTestId('cardform-source-count')`, `getByTestId('cardform-target-count')`.
- Zapis: `getByTestId('cardform-submit')`; Anuluj: `getByTestId('cardform-cancel')`.

### Kroki wdrożenia

1. Dodać `data-testid` w `CardForm.tsx` jak powyżej.
2. Dodać `data-testid` w `AiGenerateButton.tsx` na główny przycisk i spinner.
3. Zbudować frontend (Vite) i upewnić się, że brak błędów typów/ESLint.
4. Zaktualizować testy E2E, by używały `getByTestId(...)` zamiast tekstów/labeli.
5. Uruchomić scenariusze na testowym API/DB, bez mocków; dodać retry/timeouty tylko jeśli konieczne.

### To-dos

- [ ] Dodać data-testid do elementów w CardForm.tsx
- [ ] Dodać data-testid do Button w AiGenerateButton.tsx
- [ ] Zaktualizować testy E2E do getByTestId() selektorów