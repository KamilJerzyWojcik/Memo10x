# Szablony layoutów (Apple HIG) – 2025-11-19

## AppShell
- Globalny kontener (sticky navbar + gradient tła) montowany jako element nadrzędny w `router.tsx`.
- Zapewnia brand (logo MW), single primary action (logowanie/wylogowanie) oraz slot na dzieci (`<Outlet />`).

## PageShell
- Wewnątrz `AppShell` odpowiada już tylko za kolumnowy układ i odstępy między sekcjami.

## PageHeader
- Prezentuje tytuł, opis oraz pojedynczą akcję nadrzędną (primary CTA).
- Zawiera linię pomocniczą „MemoWords” jako breadcrumb systemowy.
- W ekranach listy karta „Dodaj kartę” będzie jedyną akcją primary; inne działania trafiają do toolbarów.

## Section
- Sekcja z miękkim promieniem i cieniem, idealna na listy, panele filtrów lub karty informacyjne.
- Obsługuje nagłówki sekcji (`title`, `description`) oraz slot `aside` (np. filtry/toolbar).

## ListPageLayout
- Kompozycja `PageShell` + `PageHeader` + pojedyncza `Section`.
- W `Section` slot `aside` służy za toolbar (np. zmianę rozmiaru strony).
- Stosowany w `CardsPage` (lista kart). W przyszłości także dla list zdarzeń lub dashboardu.

## FormPageLayout
- Dwukolumnowy układ (formularz + panel boczny na wskazówki/widżety).
- Aktualnie używany w `AddCardPage` i `EditCardPage`.
- Panel boczny może zawierać checklisty, akcje kontekstowe, statusy AI.

## DetailPageLayout
- Szablon szczegółu (kontent + boczny panel). Nie jest jeszcze użyty, ale przewidziany dla widoków pojedynczej karty lub statystyk użytkownika.

## Mapowanie istniejących widoków
- `CardsPage` → `ListPageLayout` (toolbar = `CardsToolbar`, footer = `Paginator` + licznik kart).
- `AddCardPage` → `FormPageLayout` (panel boczny w planie).
- `EditCardPage` → `FormPageLayout`.
- `LoginPage` → `PageShell` + `Section` (oddzielny gradient, ale te same prymitywy).


