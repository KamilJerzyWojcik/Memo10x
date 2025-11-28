<!-- e3ba585a-ed00-4bfe-936b-78b7e086db98 17d470ce-d4ea-4774-8ca6-b92721ede0bf -->
# Plan wdrożenia funkcji grup słów (Word Groups)

## 1. Założenia biznesowe i konsekwencje Twoich odpowiedzi

- **Grupy są prywatne** – każda grupa jest widoczna wyłącznie dla właściciela (użytkownika zalogowanego).
- **Jedno słowo (karta) może być użyte w wielu grupach** – brak globalnego ograniczenia; ten sam tekst może pojawić się w wielu grupach.
- **AssociationWord jest niezależnym obiektem**:
- Tworząc grupę, **kopiujemy wartości** z istniejącej karty (`SourceText`, `TargetText` itp.) do nowego obiektu AssociationWord.
- **Nie utrzymujemy relacji domenowej Card → AssociationWord** (grupa nie reaguje na usunięcie karty; karta nie jest usuwana przy usunięciu grupy).
- Usunięcie grupy usuwa **powiązane AssociationWord**, ale **nie usuwa oryginalnych kart** – słowa na liście kart pozostają.
- **Limit 9 słów na grupę** – grupa zawiera **od 1 do 9 AssociationWord**.
- **Kolejność słów jest ważna**:
- Podczas tworzenia grupy użytkownik może **zmieniać kolejność słów** (np. przesuwanie/drag&drop).
- Po zapisaniu grupy kolejność (1–9) jest **zamrożona** i nie może być edytowana.
- **Brak historii zmian** – zmiana tytułu nadpisuje poprzednią wartość, nie przechowujemy wersji.
- **Aktualny cel** – proste grupowanie słów po 1–9 elementów; w przyszłości mogą dojść wyższe poziomy / tryby nauki oparte na grupach.

Te założenia będą podstawą dla wszystkich decyzji projektowych w backendzie i frontendzie.

---

## 2. Projekt domeny i modelu danych (poziom koncepcyjny)

1. **Nowy byt domenowy: Group (WordGroup)**

- Pola koncepcyjne:
- Id grupy
- UserId (właściciel)
- Title (tytuł)
- CreatedAt / UpdatedAt (dla porządku biznesowego)
- Reguły:
- Grupa musi mieć **tytuł** (niepusty, limit długości np. 100 znaków).
- Grupa należy **do jednego użytkownika** i jest przez niego w całości kontrolowana.

2. **Nowy byt domenowy: AssociationWord (słowo-grupowe)**

- Pola koncepcyjne:
- Id AssociationWord
- GroupId (odniesienie do grupy – relacja 1:N: jedna grupa ma wiele AssociationWord, max 9)
- Order (liczba całkowita 1–9, unikalna w obrębie danej grupy)
- SourceTextCopy, TargetTextCopy (kopie tekstów z karty z momentu tworzenia grupy)
- (Opcjonalnie) CreatedAt – dla informacji statystycznej.
- Reguły:
- **Order w obrębie jednej grupy jest unikalny** – brak duplikatów pozycji 1–9.
- Maksymalnie 9 AssociationWord w jednej grupie; minimalnie 1.
- AssociationWord **nie ma twardej relacji domenowej** z `Card` (brak wymaganego powiązania przy usuwaniu kart).

3. **Powiązania z istniejącymi bytami**

- `Card` (z [MemoWords/MemoWords.Api/Domain/Entities/Card.cs](MemoWords/MemoWords.Api/Domain/Entities/Card.cs)) pozostaje bez zmian w kontekście relacji – nie wie o grupach.
- `Group` i `AssociationWord` mają własne tabele/encji i obsługę.

---

## 3. Backend – plan prac (ASP.NET / domena / aplikacja)

### 3.1. Warstwa domenowa

- Dodać nowe klasy domenowe:
- `Group` (lub `WordGroup`) w katalogu domeny, na wzór `Card`.
- `AssociationWord` w tym samym obszarze domenowym.
- Zaimplementować metody/fabryki domenowe, np.:
- `Group.Create(userId, title, associationWords)` – pilnująca:
- limitu 1–9 AssociationWord,
- spójnych i unikalnych wartości `Order` (1..N bez dziur),
- przypisania `UserId` do grupy.
- Metody pomocnicze dla modyfikacji tytułu (`UpdateTitle`) z walidacją.

### 3.2. Warstwa infrastruktury (EF Core)

- Rozszerzyć konfigurację kontekstu danych o nowe encje `Group` i `AssociationWord`.
- Skonfigurować relację:
- `Group` 1:N `AssociationWord` z kasowaniem zależnych `AssociationWord` przy usunięciu grupy.
- Przygotować migrację EF Core tworzącą odpowiednie tabele oraz indeksy (np. indeks po `UserId`, `GroupId`, unikalność `(GroupId, Order)`).

### 3.3. Warstwa aplikacyjna (DTO, requesty, serwisy)

- Dodać DTO i requesty dla nowych operacji:
- `GroupDto` (Id, Title, lista AssociationWord, daty opcjonalnie).
- `AssociationWordDto` (Order, SourceTextCopy, TargetTextCopy).
- `CreateGroupRequest` (Title, kolekcja pozycji { cardId lub teksty + docelowa pozycja Order }).
- `UpdateGroupTitleRequest` (Title).
- Zaimplementować serwis aplikacyjny `IGroupService` / `GroupService`, analogicznie do `ICardService`/`CardService`:
- `CreateGroupAsync(userId, title, wordSelections)` –
- pobiera odpowiednie `Card` (z uwzględnieniem `UserId`),
- tworzy kopie tekstów w `AssociationWord` we właściwych pozycjach 1–9,
- zapisuje grupę.
- `UpdateGroupTitleAsync(userId, groupId, newTitle)`.
- `DeleteGroupAsync(userId, groupId)` – usuwa grupę oraz jej `AssociationWord`.
- `GetGroupByIdAsync(userId, groupId)` i `GetGroupsAsync(userId, paging)` – dla listy i szczegółu.
- Ustalić wspólną odpowiedzialność za paginację list grup (np. prosty model jak w `CardsController.List`).

### 3.4. Walidacja (FluentValidation / reguły biznesowe)

- Walidatory dla requestów:
- `CreateGroupRequestValidator`:
- tytuł niepusty, max długość,
- liczba słów 1–9,
- brak duplikatów pozycji Order,
- brak duplikatów tych samych `cardId` w obrębie grupy (opcjonalnie, jeśli nie chcesz powtórzeń).
- `UpdateGroupTitleRequestValidator` – walidacja tytułu.
- Dodatkowo w warstwie serwisu:
- weryfikacja, że wszystkie wskazane `Card` należą do bieżącego użytkownika (`UserId`).

### 3.5. Nowy kontroler API

- Dodać `GroupsController` (analogicznie do [MemoWords/MemoWords.Api/Controllers/CardsController.cs](MemoWords/MemoWords.Api/Controllers/CardsController.cs)) z atrybutem `[Authorize]`:
- `GET /groups` – lista grup użytkownika (z paginacją).
- `GET /groups/{id}` – szczegóły grupy (z AssociationWord).
- `POST /groups` – tworzenie grupy.
- `PATCH /groups/{id}` – zmiana tytułu grupy.
- `DELETE /groups/{id}` – usunięcie grupy z powiązanymi `AssociationWord`.
- Wszystkie metody muszą:
- pobierać `userId` z `IUserContext` (tak jak w `CardsController`),
- zwracać odpowiednie kody błędów (404, gdy grupa nie istnieje lub nie należy do użytkownika; 400 przy błędach walidacji).

### 3.6. Zachowanie przy usuwaniu karty (Card)

- **Kluczowe założenie**: brak relacji Card ↔ AssociationWord oznacza:
- usunięcie karty **nie modyfikuje istniejących grup**;
- grupy nadal przechowują **kopie tekstów** w AssociationWord.
- Biznesowo warto jedynie:
- doprecyzować komunikację dla użytkownika (w UI), że usunięcie karty z listy nie usuwa jej „kopii” z już istniejących grup.

---

## 4. Frontend – plan prac (React / Vite)

### 4.1. Modelowanie typów i serwisów API

- W katalogu `memo-words/src/types/` dodać:
- typy `GroupDto`, `AssociationWordDto`, `PagedResultDto<GroupDto>`.
- W katalogu `memo-words/src/services/` utworzyć `groupsApi.ts` na wzór `cardsApi.ts`:
- funkcje: `getGroups`, `getGroup`, `createGroup`, `updateGroupTitle`, `deleteGroup`.

### 4.2. Nowe ekrany i nawigacja

1. **Lista grup**

- Nowa strona, np. `GroupsPage` w `memo-words/src/pages/`:
- lista grup użytkownika z możliwością paginacji,
- przyciski: „Utwórz grupę”, „Edytuj nazwę”, „Usuń grupę”, „Zobacz szczegóły”.
- Dodać trasę w konfiguracji routera (np. `/groups`).

2. **Tworzenie grupy**

- Nowa strona / modal, np. `GroupCreatePage`:
- pole **tytuł grupy**,
- **selector słów**: lista kart użytkownika (np. podobna do `CardsPage`, ale w trybie wyboru),
- możliwość ułożenia wybranych słów w kolejności 1–9:
- np. osobna sekcja „Wybrane słowa (max 9)” z listą, którą można **przestawiać** (drag&drop lub przyciski „w górę/w dół”),
- licznik informujący o liczbie wybranych słów.
- po zapisie wysyłamy struktury z kolejnością do `createGroup`.
- po sukcesie: nawigacja do listy grup lub szczegółu grupy + toast sukcesu.

3. **Szczegóły grupy (podgląd)**

- Nowa strona `GroupDetailsPage`:
- wyświetla tytuł grupy,
- prezentuje **zamrożoną listę słów** z numerami 1–9 (bez możliwości edycji kolejności czy treści),
- przyciski: „Edytuj nazwę”, „Usuń grupę”, „Powrót do listy”.

4. **Edycja tytułu grupy**

- Lekki formularz (modal lub mała sekcja na stronie szczegółów):
- tylko pole „Tytuł grupy”,
- zapis przy pomocy `updateGroupTitle`.

5. **Integracja z istniejącą nawigacją**

- Dodać odnośnik do listy grup (np. w głównym menu / AppShell), tak by użytkownik łatwo odkrył funkcję.
- ekran grup powiniec wyswietlac się pod sciezką /groups i powinna byc to sciezka na ktora prowadzi po zalogowaniu i na ktora wraca sie po 404

### 4.3. UX i komunikaty

- Na etapie tworzenia grupy:
- wyraźna informacja „Grupa może zawierać do 9 słów; po zapisaniu nie będzie można zmienić ich liczby ani kolejności”.
- Przy usuwaniu grupy:
- komunikat potwierdzający, że **słówka na liście kart pozostaną**, usunięte zostaną tylko kopie w tej grupie.
- Przy usuwaniu karty z listy kart:
- opcjonalna informacja (tooltip/tekst pomocniczy), że "jeśli słowo zostało wcześniej dodane do jakiejś grupy, jego kopie w grupach pozostaną".

### 4.4. Obsługa błędów i stanów ładowania

- Wzorce jak na `CardsPage` ([memo-words/src/pages/CardsPage.tsx](memo-words/src/pages/CardsPage.tsx)):
- `LoadingSpinner` do globalnych stanów ładowania.
- Toastery z `useAppToast` do komunikatów o błędach i sukcesach.
- Obsługa 400 (błędy walidacji) i 404 (grupa nie istnieje) ze zrozumiałymi komunikatami.

---

## 5. Bezpieczeństwo i spójność danych

- **Autoryzacja**:
- Wszystkie endpointy grup muszą być oznaczone `[Authorize]`.
- W serwisach każda operacja przyjmuje `userId` (z `IUserContext`) i filtruje dane tylko po tym `UserId`.
- **Separacja danych**:
- Każdy rekord `Group` i `AssociationWord` musi być trwale powiązany z `UserId` (bez możliwości „przeniesienia” do innego użytkownika).
- **Integralność w obrębie grupy**:
- Logika waliduje limit 1–9 słów i unikalność kolejności (Order).
- Usunięcie grupy zawsze usuwa powiązane `AssociationWord`.
- **Brak historii zmian**:
- Aktualizacje tytułu grupy nadpisują poprzednią wartość; nie ma potrzeby dodatkowych struktur do versioningu.

---

## 6. Testy i weryfikacja

1. **Testy backendu (xUnit)**

- Testy domenowe dla `Group` i `AssociationWord`:
- poprawne tworzenie z 1–9 słów,
- błąd przy >9 słowach lub duplikatach `Order`,
- poprawna aktualizacja tytułu.
- Testy serwisów aplikacyjnych:
- tworzenie grupy kopiuje teksty z kart i respektuje `UserId`,
- usuwanie grupy usuwa powiązane `AssociationWord`,
- próba dostępu do grupy innego użytkownika kończy się błędem.

2. **Testy frontendowe (Vitest / e2e później)**

- Test komponentu formularza tworzenia grupy:
- poprawne liczenie wybranych słów i blokada >9,
- możliwość zmiany kolejności przed zapisem,
- brak możliwości edycji listy po przejściu do widoku szczegółów.
- Testy integracyjne serwisu `groupsApi` z mockowanym backendem.

3. **Testy ręczne / UAT**

- Scenariusze:
- utworzenie grupy z 3 słowami; sprawdzenie kolejności i braku edycji po zapisie,
- próba dodania 10 słowa – oczekiwany błąd/komunikat,
- usunięcie grupy – słowa nadal istnieją na liście kart,
- usunięcie karty, która kiedyś była użyta w grupie – grupa i AssociationWord pozostają bez zmian.

---

## 7. Etapy wdrożenia (iteracyjnie)

1. **Etap 1 – Backend**

- Domena i migracje dla `Group` i `AssociationWord`.
- Serwis `GroupService` i `GroupsController` z pełnym zestawem operacji.
- Testy jednostkowe domeny i serwisów.

2. **Etap 2 – Frontend podstawowy**

- Typy i `groupsApi.ts`.
- Strona `GroupsPage` (lista) z możliwością usuwania grup.

3. **Etap 3 – Formularz tworzenia i szczegóły grupy**

- Ekran tworzenia z wyborem słów i układaniem kolejności.
- Ekran szczegółów z zamrożoną listą i edycją tytułu.

4. **Etap 4 – UX, komunikaty i dopracowanie**

- Doprecyzowanie komunikatów (limity, brak edytowalności po zapisie).
- Ulepszenia ergonomii (sortowanie, filtrowanie listy kart przy wyborze).

5. **Etap 5 – Testy końcowe i przygotowanie do produkcji**

- Pełna ścieżka testów automatycznych i manualnych.
- Ewentualne poprawki na podstawie feedbacku.

### To-dos

- [ ] Dodać encje domenowe Group i AssociationWord oraz ich konfigurację EF Core z migracjami
- [ ] Zaimplementować GroupService oraz GroupsController z operacjami CRUD zgodnie z regułami biznesowymi
- [ ] Dodać typy GroupDto/AssociationWordDto i moduł groupsApi.ts w frontendzie
- [ ] Stworzyć strony GroupsPage, GroupCreatePage i GroupDetailsPage z logiką 1–9 słów i zamrożoną kolejnością
- [ ] Przygotować testy jednostkowe backendu (xUnit) i frontendowe (Vitest) dla nowej funkcjonalności grup