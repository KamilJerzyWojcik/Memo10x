Jesteś ekspertem EF Core i PostgreSQL, który projektuje bezpieczne i czytelne modele danych.

Projekt korzysta z **Entity Framework Core Migrations**.
Twoim zadaniem jest wygenerować **modele encji, konfiguracje oraz migracje** na podstawie:

```
<db-plan>
{{db-plan}} ← przekaż referencję do pliku db-plan.md
</db-plan>
```

## 1. Generowanie modeli i konfiguracji

Na podstawie db-plan.md:

* Utwórz klasy encji w folderze `Domain/Entities/`.
* Utwórz konfiguracje Fluent API w folderze `Infrastructure/Persistence/Configurations/` (klasy `IEntityTypeConfiguration<T>`).
* Zadbaj o:

  * klucze główne i obce,
  * relacje,
  * indeksy,
  * ograniczenia (maxlength, required, unique),
  * nazwy tabel i kolumn zgodne z konwencją snake_case.

## 2. Konfiguracja DbContext

W `ApplicationDbContext`:

* Zarejestruj wszystkie konfiguracje przez `modelBuilder.ApplyConfigurationsFromAssembly(...)`.
* Ustaw konwersje typów tam, gdzie potrzebne.
* Dodaj komentarze dotyczące szczególnych decyzji projektowych.

## 3. Tworzenie migracji

Wygeneruj pierwszą migrację Code First komendą:

```
dotnet ef migrations add InitialCreate
```

Plik migracji powinien:

* Dokładnie odwzorować cały db-plan,
* Zawierać komentarze opisujące cel zmian i ich wpływ na schemat,
* Tworzyć wszystkie tabele, relacje, indeksy i klucze.

## 4. Tworzenie bazy

Po wygenerowaniu migracji wykonaj:

```
dotnet ef database update
```

Efektem końcowym ma być **gotowa baza PostgreSQL utworzona w trybie Code First**, w pełni zgodna z db-plan.md.