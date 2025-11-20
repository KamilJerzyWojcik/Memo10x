<!-- 9bcae64c-7159-49f5-a9f6-3a65ff4ca8fc a4413b7e-f1d8-46f4-8023-36d4f780f09a -->
# Plan Implementacji Usługi OpenAI w MemoWords

Ten dokument opisuje plan wdrożenia usługi `OpenAiService` w projekcie MemoWords. Usługa ta będzie odpowiedzialna za komunikację z API OpenAI (lub kompatybilnym, np. OpenRouter) w celu dostarczania funkcji opartych na LLM, w tym tłumaczeń i konwersacji.

## 1. Opis Usługi

`OpenAiService` to serwis warstwy aplikacji (`Application/Services`), który kapsułkuje logikę komunikacji z zewnętrznym dostawcą AI. Jego głównym celem jest abstrakcja wywołań HTTP/SDK, zarządzanie konfiguracją (klucze, modele) oraz zapewnienie typowanych, ustrukturyzowanych odpowiedzi wymaganych przez aplikację.

Usługa zostanie zaimplementowana przy użyciu oficjalnej biblioteki NuGet **`OpenAI`** (wersja beta/preview wspierająca .NET 9 i najnowsze funkcje).

### Kluczowe cechy:

-   Wsparcie dla **Structured Outputs** (JSON Schema) zapewniające deterministyczne formaty odpowiedzi.
-   Centralna obsługa błędów i parametrów modelu.

## 2. Opis Konstruktora

Konstruktor serwisu będzie przyjmował konfigurację oraz fabrykę klienta/logger.

```csharp
public OpenAiService(
    IOptions<OpenAiSettings> settings,
    ILogger<OpenAiService> logger
)
```

**Zależności:**

-   `IOptions<OpenAiSettings>`: Obiekt zawierający `ApiKey`, `BaseUrl`, `ModelName` (np. `gpt-4o-mini`).
-   `ILogger<OpenAiService>`: Do logowania błędów, czasu wykonania i (opcjonalnie w trybie debug) treści zapytań.

**Inicjalizacja:**

-   Wewnątrz konstruktora nastąpi walidacja ustawień (czy klucz API nie jest pusty).
-   Zainicjalizowanie instancji `ChatClient` z biblioteki `OpenAI`.

## 3. Publiczne Metody i Pola

Główną metodą publiczną będzie uniwersalna metoda do generowania odpowiedzi, obsługująca zarówno zwykły tekst, jak i ustrukturyzowany JSON.

### Interfejs `IOpenAiService`

```csharp
public interface IOpenAiService
{
    // Metoda generyczna do zwracania ustrukturyzowanych danych
    Task<T> CompleteChatAsync<T>(
        string systemPrompt, 
        string userPrompt, 
        CancellationToken cancellationToken = default);
}
```

**Parametry:**

-   `systemPrompt`: Instrukcja systemowa definiująca zachowanie asystenta.
-   `userPrompt`: Właściwe zapytanie użytkownika.
-   `T`: Typ C#, na który ma zostać zmapowana odpowiedź JSON (musi być zgodny ze schematem).

## 4. Prywatne Metody i Pola

-   `private readonly ChatClient _chatClient;`: Instancja klienta z biblioteki OpenAI.
-   `private readonly OpenAiSettings _settings;`: Przechowywane ustawienia.
-   `private readonly ILogger _logger;`: Logger.

**Metody pomocnicze (wewnętrzne biblioteki OpenAI):**

-   Biblioteka `OpenAI` automatycznie obsługuje serializację/deserializację schematów JSON na podstawie typu `T`, więc ręczne budowanie JSON Schema może nie być konieczne, chyba że wymagana jest precyzyjna kontrola. W takim przypadku użyjemy `ChatResponseFormat.CreateJsonSchema`.

## 5. Obsługa Błędów

Usługa będzie przechwytywać wyjątki z biblioteki OpenAI i rzucać własne wyjątki domenowe lub zwracać puste wyniki/błędy w zależności od strategii.

**Scenariusze błędów:**

1.  **Błąd uwierzytelnienia (401):** Nieprawidłowy klucz API. -> Logowanie `Critical`, rzucenie `AiConfigurationException`.
2.  **Limit zapytań (429):** Rate limiting. -> Logowanie `Warning`, opcjonalnie Retry Policy (Polly), rzucenie `AiServiceBusyException`.
3.  **Błąd serwera (5xx) / Timeout:** Problemy po stronie OpenAI/OpenRouter. -> Logowanie `Error`, rzucenie `AiServiceUnavailableException`.
4.  **Błąd walidacji (400):** Zbyt długi prompt lub nieprawidłowy format. -> Logowanie `Error`, rzucenie `AiValidationException`.
5.  **Błąd parsowania JSON:** Model zwrócił format niezgodny ze schematem (rzadkie przy `strict: true`). -> Logowanie treści odpowiedzi, rzucenie wyjątku.

## 6. Kwestie Bezpieczeństwa

1.  **Przechowywanie Kluczy:** Klucz API **NIGDY** nie może być w kodzie źródłowym.

    -   Development: `dotnet user-secrets` (opisz jak dodac w readme backendu).
    -   Produkcja: Zmienne środowiskowe (Azure App Service Settings).

2.  **Logowanie:** Nigdy nie loguj pełnego klucza API. Przy logowaniu treści zapytań upewnij się, że nie zawierają one PII (danych osobowych), chyba że jest to niezbędne i zgodne z RODO.
3.  **Walidacja danych wejściowych:** Sprawdzanie długości promptu przed wysłaniem, aby uniknąć nadmiernych kosztów.

## 7. Plan Wdrożenia Krok po Kroku

### Krok 1: Instalacja Zależności

Zainstaluj oficjalną bibliotekę klienta OpenAI dla .NET.

```bash
dotnet add MemoWords.Api/MemoWords.Api.csproj package OpenAI
```


### Krok 2: Konfiguracja (DTO)

Utwórz klasę ustawień w `MemoWords.Api/Infrastructure/Configuration/OpenAiSettings.cs`:

```csharp
public class OpenAiSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.openai.com/v1";
    public string ModelName { get; set; } = "gpt-4o-mini"; // Kosztowo efektywny model
}
```

Dodaj sekcję do `appsettings.json` (i `secrets.json` dla klucza):

```json
"OpenAI": {
  "BaseUrl": "https://api.openai.com/v1",
  "ModelName": "gpt-4o-mini"
}
```

### Krok 3: Implementacja Interfejsu i Serwisu

1.  Utwórz `IOpenAiService` w `MemoWords.Api/Application/Services`.
2.  Utwórz `OpenAiService` implementujący interfejs.

**Kluczowy fragment implementacji (Structured Output):**

```csharp
// Wewnątrz metody CompleteChatAsync<T>
ChatCompletionOptions options = new()
{
    ResponseFormat = ChatResponseFormat.CreateJsonSchema(
        jsonSchemaFormatName: typeof(T).Name,
        jsonSchema: BinaryData.FromObjectAsJson(GenerateSchemaForType<T>()), // Helper lub wbudowany mechanizm
        jsonSchemaIsStrict: true
    )
};
```

*Alternatywnie, biblioteka OpenAI dla .NET posiada generyczne rozszerzenia, które upraszczają ten proces.*

### Krok 4: Rejestracja w Kontenerze DI

W pliku `Program.cs`:

```csharp
// Konfiguracja
builder.Services.Configure<OpenAiSettings>(builder.Configuration.GetSection("OpenAI"));

// Rejestracja serwisu
builder.Services.AddScoped<IOpenAiService, OpenAiService>();

// builder.Services.AddScoped<IAiTranslationService, AiTranslationServiceAdapter>();
```

### Krok 5: Utworzenie Modeli Odpowiedzi

Zdefiniuj klasy DTO dla oczekiwanych odpowiedzi JSON, np. dla tłumaczeń:

```csharp
public class TranslationResponse
{
    public string TranslatedText { get; set; }
    public string ExampleSentence { get; set; }
    public List<string> Synonyms { get; set; }
}
```


### To-dos

- [ ] Zainstaluj pakiet NuGet OpenAI w projekcie API
- [ ] Utwórz klasę OpenAiSettings i dodaj konfigurację do appsettings.json
- [ ] Zdefiniuj interfejs IOpenAiService w warstwie aplikacji
- [ ] Zaimplementuj OpenAiService z obsługą structured outputs i błędów
- [ ] Zarejestruj serwis w kontenerze DI w Program.cs