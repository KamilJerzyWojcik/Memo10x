# MemoWords API

Backendowa część aplikacji MemoWords oparta na .NET 9.

## Konfiguracja OpenAI

Do działania funkcji tłumaczenia wymagany jest klucz API OpenAI.

### Metoda 1: .NET User Secrets (Zalecana dla developmentu)

Narzędzie User Secrets pozwala bezpiecznie przechowywać klucz lokalnie bez ryzyka wysłania go do repozytorium (klucz jest przechowywany poza folderem projektu).

1. Otwórz terminal i przejdź do katalogu projektu API:
   ```bash
   cd MemoWords.Api
   ```

2. Zainicjalizuj mechanizm sekretów (jeśli nie był używany):
   ```bash
   dotnet user-secrets init
   ```

3. Ustaw klucz API poleceniem:
   ```bash
   dotnet user-secrets set "OpenAI:ApiKey" "sk-proj-..."
   ```
   *(Zastąp `sk-proj-...` swoim rzeczywistym kluczem API)*

### Metoda 2: appsettings.json (Nie zalecane)

Możesz wpisać klucz bezpośrednio w sekcji `OpenAI` w pliku `appsettings.Development.json`. Pamiętaj jednak, by **nie commitować** tego pliku, jeśli zawiera prawdziwy klucz.

```json
"OpenAI": {
  "ApiKey": "sk-proj-...",
  "BaseUrl": "https://api.openai.com/v1",
  "ModelName": "gpt-4o-mini"
}
```

### Metoda 3: Zmienne środowiskowe (Produkcja)

W środowisku produkcyjnym (np. Azure App Service, Docker) skonfiguruj klucz za pomocą zmiennej środowiskowej:

- **Nazwa:** `OpenAI__ApiKey` (użyj podwójnego podkreślenia jako separatora)
- **Wartość:** Twój klucz API

