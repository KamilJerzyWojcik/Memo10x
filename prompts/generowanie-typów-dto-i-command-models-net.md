Jesteś wykwalifikowanym programistą C# / ASP.NET Core (.NET 9), którego zadaniem jest stworzenie biblioteki typów DTO (Data Transfer Object) oraz Command Models dla aplikacji backendowej. Twoim zadaniem jest przeanalizowanie definicji modeli bazy danych (encje EF Core) oraz planu API, a następnie utworzenie odpowiednich klas/rekordów DTO i Command Models, które dokładnie reprezentują struktury danych wymagane przez API, zachowując jednocześnie ścisłe powiązanie z podstawowymi modelami domenowymi/bazy danych.

Najpierw dokładnie przejrzyj następujące dane wejściowe:

1. Modele bazy danych (encje domenowe / EF Core):

<database_models>
{{db-models}} <- zamień na rzeczywistą referencję do projektu z encjami (np. projekt Domain/Entities lub plik Database/Entities/*.cs)
</database_models>

2. Plan API (zawierający zdefiniowane DTO i operacje):

<api_plan>
{{api-plan}} <- zamień na rzeczywistą referencję do pliku z planem API, np. @docs/api-plan.md
</api_plan>

Twoim zadaniem jest utworzenie definicji typów C# dla DTO i Command Models określonych w planie API, upewniając się, że pochodzą one z modeli domenowych/bazy danych (encje EF Core). Wykonaj następujące kroki:

1. **Przeanalizuj modele bazy danych i plan API.**

   * Zidentyfikuj, które encje odpowiadają którym zasobom/endpointom w planie API.
   * Zwróć uwagę, jakie pola są wymagane w odpowiedziach (Response DTO), a jakie w żądaniach (Command / Request DTO).

2. **Utwórz DTO (Response/Query) oraz Command Models (Request) na podstawie planu API, wykorzystując definicje encji bazy danych.**

   * Dla każdego endpointu z planu API, który wymaga wejścia/wyjścia, utwórz odpowiednie klasy/rekordy DTO.
   * Dbaj o to, by właściwości DTO pochodziły bezpośrednio z encji (lub ich logicznych projekcji), a dodatkowe pola były jasno uzasadnione.

3. **Zapewnij zgodność między DTO / Command Models a wymaganiami API.**

   * Upewnij się, że wszystkie pola oznaczone jako wymagane w planie API są odpowiednio reprezentowane (np. typy niemające `?`, atrybuty walidacji).
   * Upewnij się, że struktury kolekcji, typy wyliczeniowe, relacje (np. listy elementów zależnych) odpowiadają opisowi w planie API.

4. **Stosuj odpowiednie funkcje języka C# i wzorce projektowe, aby tworzyć, zawężać lub rozszerzać typy zgodnie z potrzebami:**

   * Wykorzystuj:

     * `record` / `record class` dla niezmienniczych DTO (szczególnie w odpowiedziach).
     * Klasy z `init;` lub `required` dla właściwości w modelach komend.
     * Dziedziczenie dla wspólnych bazowych typów DTO (np. `BaseEntityDto` z Id, datami audytu itp.).
     * Kompozycję dla bardziej złożonych struktur (zagnieżdżone DTO).
   * W razie potrzeby rozdzielaj:

     * DTO do listowania (`ListItemDto`),
     * DTO do szczegółów (`DetailDto`),
     * DTO do tworzenia (`CreateXCommand`),
     * DTO do aktualizacji (`UpdateXCommand`).

5. **Zadbaj, aby każde DTO i Command Model było bezpośrednio lub pośrednio połączone z definicjami encji:**

   * Nazewnictwo DTO powinno jasno wskazywać encję, z której pochodzi (np. `UserDto`, `UserDetailDto`, `CreateUserCommand`).
   * Unikaj duplikowania logiki biznesowej – DTO to projekcje encji, a nie nowe modele domenowe.
   * Jeśli dodajesz pola pochodne (np. wyliczane z kilku pól encji), dodaj komentarz opisujący ich źródło.

6. **Wykonaj końcowe sprawdzenie kompletności:**

   * Upewnij się, że wszystkie DTO i Command Models zdefiniowane w planie API są zaimplementowane.
   * Sprawdź, czy nie ma endpointu, który nie ma powiązanego typu wejścia/wyjścia.
   * Upewnij się, że nie tworzysz nieużywanych DTO.

---

### Wymagania dotyczące finalnego wyniku

* Końcowy wynik powinien składać się **wyłącznie** z definicji typów DTO i Command Models w C#, które zapiszesz w plikach (kazda klasa w osobnym pliku), np.:
  `Application/DTOs/ExampleDto.cs`, `Application/Commands/ExampleCommand.cs`.
* Używaj **jasnych i opisowych nazw** dla swoich typów, np.:

  * `UserListItemDto`, `UserDetailDto`,
  * `CreateUserCommand`, `UpdateUserCommand`, `DeleteUserCommand`.
* Dodaj **komentarze XML (`///`)** nad klasami i właściwościami, aby wyjaśnić:

  * złożone projekcje typów,
  * nieoczywiste relacje między DTO a encjami,
  * różnice między podobnymi typami (np. między DTO do tworzenia a DTO do aktualizacji).

Pamiętaj:

* Upewnij się, że wszystkie DTO i Command Models zdefiniowane w planie API są uwzględnione.
* Każdy DTO i Command Model powinien być logicznie powiązany z jedną lub więcej encji domenowych/bazy danych.
* W razie potrzeby używaj:

  * kompozycji zamiast dziedziczenia,
  * interfejsów (np. `IHasId`, `IHasTimestamps`),
  * rekordów z właściwościami zainicjalizowanymi w konstruktorze,
  * typów wyliczeniowych z silnym typowaniem (`enum`) spójnych z encjami.
* Dodaj komentarze tam, gdzie relacje lub transformacje nie są oczywiste na pierwszy rzut oka.

Końcowe pliki powinny zawierać **tylko** definicje klas/rekordów DTO i Command Models (bez logiki mapowania, kontrolerów czy konfiguracji EF Core).
