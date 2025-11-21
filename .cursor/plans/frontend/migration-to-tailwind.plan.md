<!-- afb50836-1969-466f-957a-577a3ddc5da1 fa7f873e-98d7-4c9b-860f-2b44083269f2 -->
# Plan migracji do shadcn/ui + Tailwind 4 z design tokens

## Cel główny

Przebudować warstwę UI tak, aby komponenty w `src/components` opierały się na shadcn/ui, korzystały z Tailwind 4 oraz spójnego systemu design tokens (CSS variables), a całe ekrany były projektowane zgodnie z wzorcami z Apple Human Interface Guidelines.

## Kroki planu

1. Inwentaryzacja i kategoryzacja istniejących komponentów

- Zmapować wszystkie komponenty w `src/components` i pogrupować je na: prymitywy UI (Button, Input, Modal, List, Card, Typography), layout (Grid, Container, Sidebar, Navbar), komponenty domenowe (np. specyficzne widoki).
- Zidentyfikować duplikaty wzorców (różne przyciski, różne style kart, wiele wariantów modali itp.).

2. Konfiguracja Tailwind 4 i podstawowa integracja

- Jeśli Tailwind nie jest skonfigurowany: dodać Tailwind 4 do projektu i skonfigurować postcss / bundler.
- Ustalić strukturę plików stylów globalnych (np. `src/styles/globals.css`, `src/styles/tokens.css`).
- Włączyć nowy model konfiguracyjny Tailwind 4 (np. @theme / design tokens) oraz upewnić się, że purge/scan obejmuje `src/**/*.{ts,tsx,jsx,js}`.

3. Definicja design tokens w oparciu o CSS variables

- W pliku bazowym (np. `src/styles/tokens.css`) zdefiniować zmienne CSS dla:
- kolorów (`--color-bg`, `--color-fg`, `--color-accent`, stany success/warning/error),
- typografii (`--font-sans`, `--font-size-body`, `--font-size-title`, line-height itp.),
- spacingu (`--space-1`, `--space-2`, ...),
- radius (`--radius-sm`, `--radius-md`, `--radius-lg`),
- shadow (`--shadow-sm`, `--shadow-md`),
inspirowane estetyką Apple HIG (dużo przestrzeni, subtelne cienie, delikatne zaokrąglenia).
- Połączyć zmienne CSS z konfiguracją Tailwind 4 (np. mapując je w @theme), aby można ich było używać poprzez klasy Tailwind.

4. Instalacja i podstawowe dostosowanie shadcn/ui

- Dodać shadcn/ui do projektu i wygenerować bazowy zestaw komponentów (Button, Input, Dialog, Card, Form, Toast, NavigationMenu lub podobne) do np. `src/components/ui`.
- Skonfigurować motyw shadcn tak, by opierał się na wcześniej zdefiniowanych zmiennych CSS (nadpisanie kolorów, radius, spacing, typografii tam, gdzie to możliwe).
- Ustalić konwencję: komponenty w `src/components/ui` to surowe prymitywy (atomy), a komponenty z `src/components` to kompozycje i komponenty domenowe.

5. Zdefiniowanie wzorców ekranu zgodnych z Apple HIG

- Zaprojektować 3–4 szablony layoutu strony (np. `PageShell`, `ListPageLayout`, `DetailPageLayout`, `FormPageLayout`).
- Każdy szablon:
- ma `PageHeader` z tytułem i akcją główną (Button shadcn),
- sekcje treści (`Section`, `SectionHeader`),
- spójne marginesy, max-width, responsywny grid.
- Zaplanować gdzie te layouty będą użyte w aplikacji (mapowanie istniejących widoków na nowe szablony).

6. Migracja prymitywów UI do shadcn/ui + Tailwind 4

- Stopniowo zastępować dotychczasowe komponenty bazowe:
- `Button` → wrapper wokół `shadcn/ui` Button z mapowaniem istniejących wariantów na nowe (primary, secondary, ghost).
- `Input`, `Textarea`, `Select`, `Checkbox`, `Radio` → na komponenty shadcn z klasami Tailwind opartymi na tokenach.
- `Card`, `Modal/Dialog`, `Alert`, `Toast/Feedback` → spójne implementacje używające shadcn + tokenów.
- Usunąć stare, rozproszone style CSS dla tych elementów po migracji każdego zestawu.

7. Refaktoryzacja layoutu i nawigacji

- Wprowadzić globalne komponenty layoutu (`AppShell`, `Navbar`, `Sidebar` lub `TabNavigation`) wykorzystujące shadcn (np. `NavigationMenu`, `Sheet`) oraz klasy Tailwind.
- Przepiąć istniejące strony na nowe layouty, dbając o:
- jedną główną akcję primary na ekran,
- spójny tytuł i hierarchię typografii,
- sekcje treści zgodnie z HIG (np. listy, karty, formularze w odseparowanych blokach).

8. Migracja komponentów domenowych

- Dla każdego komponentu domenowego (np. listy słówek, szczegóły elementu, dashboard):
- przepiąć użycie starych przycisków / inputów / kart na nowe komponenty shadcn,
- oczyścić nadmiarowe style CSS, zastępując je klasami Tailwind opartymi na tokenach,
- upewnić się, że stany ładowania, błędów, empty state korzystają z nowych wzorców feedbacku (Alert/Toast).

9. Porządkowanie dawnych styli i CSS

- Zidentyfikować nieużywane pliki `.css` w `src/components` i usunąć je po pełnej migracji danego obszaru.
- Wspólne zasady (typografia bazowa, reset, body background) przenieść do globalnego CSS + Tailwind base.
- Upewnić się, że nie ma konfliktów między starymi klasami a Tailwind (np. nazwy klas globalnych).

10. Testy wizualne i dostępności

- Przejść po głównych widokach aplikacji i sprawdzić:
- spójność typografii (taki sam styl nagłówków i treści na wszystkich stronach),
- kontrast, stany hover/focus/disabled zgodnie z HIG,
- zachowanie na mobile/desktop (layout, nawigacja).
- Skorygować tokeny (np. rozmiary, spacing, radius), jeśli wizualnie odbiegają od zamierzonego stylu inspirowanego Apple.

11. Dokumentacja nowego design systemu

- Utworzyć prostą dokumentację (np. `DESIGN_SYSTEM.md` lub storybook / przykładową stronę), opisującą:
- dostępne design tokens i ich przeznaczenie,
- listę komponentów `src/components/ui` (shadcn) i ich wariantów,
- szablony layoutów i zasady komponowania całych stron.
- Dodać wytyczne jak tworzyć nowe komponenty domenowe: zawsze bazując na prymitywach shadcn + Tailwind + tokenach, z zachowaniem wzorców z Apple HIG.

### To-dos

- [ ] Zmapować i pogrupować wszystkie komponenty w src/components (prymitywy, layout, domenowe).
- [ ] Skonfigurować Tailwind 4 i globalne pliki styli, tak aby wspierały scanning całego src.
- [ ] Zdefiniować design tokens jako zmienne CSS (kolory, typografia, spacing, radius, shadow) i powiązać je z konfiguracją Tailwind 4.
- [ ] Dodać shadcn/ui, wygenerować podstawowe komponenty UI i dostosować je do design tokens.
- [ ] Stworzyć szablony layoutów stron (PageShell, ListPageLayout, DetailPageLayout, FormPageLayout) zgodne z Apple HIG.
- [ ] Zmigrować prymitywy UI (Button, Input, Card, Modal, Alert, List itp.) na shadcn/ui + Tailwind 4.
- [ ] Przebudować globalny layout i nawigację (AppShell, Navbar/Sidebar) w oparciu o nowe layouty i komponenty shadcn.
- [ ] Stopniowo przepiąć komponenty domenowe na nowe prymitywy UI i layouty, usuwając stare style CSS.
- [ ] Usunąć nieużywane pliki CSS i ujednolicić globalne style po migracji.
- [ ] Przeprowadzić przegląd wizualny i dostępności, dopracować tokeny i szczegóły interfejsu.
- [ ] Udokumentować nowy design system, komponenty shadcn/ui i zasady budowy stron.