## API Endpoint Implementation Plan: GET /health

### 1. Przegląd punktu końcowego

Lekka sonda żywotności/gotowości aplikacji backendowej. 
Zwraca bieżący status, wersję aplikacji oraz aktualny czas serwera w UTC. 
Brak uwierzytelniania i autoryzacji (zgodnie ze specyfikacją).

### 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Ścieżka URL**: `/health`
- **Parametry**:
  - **Wymagane**: brak
  - **Opcjonalne**: brak
- **Request Body**: brak

### 3. Wykorzystywane typy

- **DTO**: `HealthResponseDto` (`MemoWords.Api.Application.DTOs`)
  - Pola:
    - `Status: string` — stała wartość `"ok"`
    - `Time: DateTimeOffset` — czas w UTC
- **Modele Command**: nie dotyczy (brak treści żądania)

### 4. Szczegóły odpowiedzi

- **200 OK** — zawsze przy poprawnym działaniu punktu końcowego:
```json
{
  "status": "ok",
  "time": "2025-11-16T14:52:00Z"
}
```

- **500 Internal Server Error** — tylko w przypadku nieoczekiwanego błędu po stronie serwera.

Uwagi:

- `time` powinien być w UTC (`DateTimeOffset.UtcNow`).

### 5. Przepływ danych

1. Klient wywołuje `GET /health`.
2. Endpoint oblicza wartości:

   - `status` = `"ok"`
   - `time` = `DateTimeOffset.UtcNow`

3. Tworzony jest `HealthResponseDto` i zwracany z kodem 200.
4. W przypadku nieobsłużonego wyjątku — logowanie i odpowiedź 500.

### 6. Względy bezpieczeństwa

- **Uwierzytelnianie/Autoryzacja**: brak (zgodnie ze specyfikacją); endpoint nie ujawnia wrażliwych danych.
- **Zakres informacji**: zwracamy minimalny zestaw danych (status, wersja, czas), bez detali środowiskowych.
- **CORS**: jak w reszcie API (brak zmian specyficznych dla endpointu).
- **Rate limiting**: nie wymagany (niski koszt), ale zgodny z globalną konfiguracją (brak dedykowanej polityki).

### 7. Obsługa błędów

- **500 Internal Server Error**:
  - Przyczyna: nieoczekiwany wyjątek (np. błąd refleksji przy odczycie wersji).
  - Działanie: zlogować błąd przez `ILogger`; zwrócić 500 bez szczegółów implementacyjnych.
- Brak scenariuszy 400/401/404/429 dla tego endpointu (brak wejścia, brak auth, stała ścieżka).


### 9. Etapy wdrożenia

1. **Wykorzystaj istniejący DTO**:

   - `HealthResponseDto` już istnieje i zawiera oczekiwane pola.



3. **Alternatywa**: utwórz `HealthController` z atrybutem `[Route("/health")]` i akcją `[HttpGet]`, zwracającą `ActionResult<HealthResponseDto>`.
4. **Walidacja**: brak (brak danych wejściowych). Upewnij się, że  `time` jest w UTC.
5. **Logowanie błędów**: na poziomie globalnym (middleware/filters). Endpoint nie wymaga lokalnych bloków `try/catch`; ewentualny wyjątek przejdzie do standardowego mechanizmu.
6. **Swagger**:

   - Upewnij się, że endpoint widnieje w `/swagger` w DEV.
   - Dodaj opisy statusów 200 i 500.

