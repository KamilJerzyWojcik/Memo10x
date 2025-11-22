---
globs: *.cs
alwaysApply: false
---
# Supabase Auth Integration with ASP.NET Core (.NET 9)

Use this guide to introduce authentication (sign-up & sign-in) in ASP.NET Core (.NET 9) applications with server-side rendering (MVC / Razor) or Web API.

## Before we start

**VERY IMPORTANT:** Ustal, które **kontrolery / endpointy / strony** mają być:

* publiczne (np. `/auth/login`, `/auth/register`, healthchecki itp.),
* chronione (np. `/account/**`, `/admin/**`, `/api/**`).

Dalsze kroki zakładają, że te ścieżki oznaczysz atrybutem `[Authorize]` lub własną polityką.

---

## Core Requirements

1. Używaj **C# clienta Supabase** (`Supabase` z NuGet), nie rób własnego ręcznego `HttpClient` do Auth, jeśli nie musisz. ([GitHub][1])
2. Używaj **wbudowanego mechanizmu ASP.NET Core Authentication**:

   * `JwtBearer` do walidowania Supabase JWT,
   * opcjonalnie cookie auth, jeśli robisz klasyczne SSR (Razor/MVC).
3. **Nie parsuj JWT "ręcznie" w kontrolerach** – wszystko powinno iść przez `AddAuthentication().AddJwtBearer(...)`.
4. Traktuj Supabase jako **źródło prawdy o użytkowniku**:

   * logowanie / rejestracja przez `supabase.Auth`,
   * autoryzacja przez `[Authorize]` + claims z Supabase JWT.
5. **Service key (`service_role`) używaj tylko po stronie serwera** – nigdy nie wystawiaj go do frontendu. ([GitHub][1])

---

## Installation

W projekcie ASP.NET (.NET 9):

```bash
dotnet add package Supabase
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

---

## Environment Variables / Configuration

### 1. appsettings.json (lub sekrety użytkownika)

```jsonc
{
  "Supabase": {
    "Url": "https://your-project-id.supabase.co",
    "AnonKey": "your_anon_public_key",
    "JwtSecret": "your_jwt_secret" // z Supabase Settings → API → JWT secret
  }
}
```

> `JwtSecret` to **JWT signing secret** z Supabase, NIE anon key. Będzie używany przez `JwtBearer` do lokalnej walidacji tokenów. ([Supabase][2])

Jeśli wolisz zmienne środowiskowe (np. w Dockerze):

```bash
SUPABASE__URL=...
SUPABASE__ANONKEY=...
SUPABASE__JWTSECRET=...
```

ASP.NET Core automatycznie je zmapuje na `Supabase:Url`, `Supabase:AnonKey`, `Supabase:JwtSecret`.

---

## Implementation Steps

### 1. Zarejestruj Supabase Client jako serwis

Utwórz np. `Services/SupabaseClientFactory.cs`:

```csharp
// Services/SupabaseClientFactory.cs
using Supabase;
using Microsoft.Extensions.Options;

public class SupabaseOptionsConfig
{
    public string Url { get; set; } = default!;
    public string AnonKey { get; set; } = default!;
}

public interface ISupabaseClientFactory
{
    Client Create();
}

public class SupabaseClientFactory : ISupabaseClientFactory
{
    private readonly SupabaseOptionsConfig _options;

    public SupabaseClientFactory(IOptions<SupabaseOptionsConfig> options)
    {
        _options = options.Value;
    }

    public Client Create()
    {
        var supabaseOptions = new SupabaseOptions
        {
            AutoConnectRealtime = false
        };

        return new Client(_options.Url, _options.AnonKey, supabaseOptions);
    }
}
```

W `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Bind config
builder.Services.Configure<SupabaseOptionsConfig>(
    builder.Configuration.GetSection("Supabase"));

// Register Supabase client factory
builder.Services.AddSingleton<ISupabaseClientFactory, SupabaseClientFactory>();

builder.Services.AddControllersWithViews(); // lub Minimal APIs
```

---

### 2. Konfiguracja JWT Bearer (Supabase Auth)

Supabase wydaje JWT dla użytkowników – możesz je **walidować lokalnie** w ASP.NET przez `JwtBearer`. ([Supabase][2])

W `Program.cs`:

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var supabaseSection = builder.Configuration.GetSection("Supabase");
var supabaseUrl = supabaseSection.GetValue<string>("Url")!;
var jwtSecret   = supabaseSection.GetValue<string>("JwtSecret")!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // issuer wg Supabase: https://<project_id>.supabase.co/auth/v1
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",

            ValidateAudience = true,
            ValidAudience = "authenticated", // default w Supabase JWT "aud" :contentReference[oaicite:4]{index=4}

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret)
            ),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
```

> `FallbackPolicy` oznacza, że *wszystkie* endpointy wymagają auth, chyba że jawnie ustawisz `[AllowAnonymous]` lub inną politykę. ([Microsoft Learn][3])

---

### 3. AuthController – logowanie / rejestracja / wylogowanie

Załóżmy klasyczny Web API + JWT, gdzie:

* front dostaje JWT i trzyma go w cookie/localStorage,
* ASP.NET weryfikuje token nagłówkiem `Authorization: Bearer`.

```csharp
// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Supabase;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ISupabaseClientFactory _clientFactory;

    public AuthController(ISupabaseClientFactory clientFactory)
    {
        _clientFactory = clientFactory;
    }

    public record AuthRequest(string Email, string Password);

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] AuthRequest request)
    {
        var supabase = _clientFactory.Create();

        var session = await supabase.Auth.SignIn(request.Email, request.Password); // :contentReference[oaicite:6]{index=6}

        if (session == null || session.AccessToken == null)
            return BadRequest(new { error = "Invalid credentials" });

        // Możesz:
        // 1) zwrócić JWT w JSON → FE trzyma w pamięci / localStorage
        // 2) ustawić HttpOnly cookie (rekomendowane dla aplikacji web)
        Response.Cookies.Append(
            "sb-access-token",
            session.AccessToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });

        if (!string.IsNullOrEmpty(session.RefreshToken))
        {
            Response.Cookies.Append(
                "sb-refresh-token",
                session.RefreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Path = "/"
                });
        }

        return Ok(new
        {
            token = session.AccessToken,
            userId = session.User?.Id,
            email = session.User?.Email
        });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] AuthRequest request)
    {
        var supabase = _clientFactory.Create();

        var session = await supabase.Auth.SignUp(request.Email, request.Password); // :contentReference[oaicite:7]{index=7}

        if (session == null || session.User == null)
            return BadRequest(new { error = "Registration failed" });

        // W zależności od konfiguracji Confirm email w Supabase
        // session.Session może być null, a user = not confirmed yet.
        return Ok(new
        {
            userId = session.User.Id,
            email = session.User.Email,
            requiresEmailConfirmation = session.AccessToken == null
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var supabase = _clientFactory.Create();

        // Opcjonalnie poinformuj Supabase o wylogowaniu
        await supabase.Auth.SignOut();

        Response.Cookies.Delete("sb-access-token");
        Response.Cookies.Delete("sb-refresh-token");

        return Ok();
    }
}
```

> W praktyce możesz dodać osobny endpoint `refresh` wykorzystujący `RefreshSession`/`RefreshAccessToken` z klienta Supabase, jeśli chcesz automatycznie odświeżać JWT. ([nuget.org][4])

---

### 4. Middleware / HttpContext.User

Dzięki `JwtBearer` każdy request z poprawnym Supabase JWT w nagłówku:

```http
Authorization: Bearer <supabase_jwt>
```

będzie miał wypełnione `HttpContext.User` (claims). Możesz dodać cienki middleware, który np. zapisze podstawowe dane usera w `HttpContext.Items`:

```csharp
// Middleware/UserContextMiddleware.cs
public class UserContextMiddleware
{
    private readonly RequestDelegate _next;

    public UserContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            var userId = context.User.FindFirst("sub")?.Value; // Supabase user id :contentReference[oaicite:9]{index=9}
            var email  = context.User.FindFirst("email")?.Value;

            context.Items["User"] = new
            {
                Id = userId,
                Email = email
            };
        }

        await _next(context);
    }
}
```

Rejestracja w `Program.cs`:

```csharp
app.UseAuthentication();
app.UseMiddleware<UserContextMiddleware>();
app.UseAuthorization();
```

---

### 5. Protect Routes

#### Web API

```csharp
[ApiController]
[Route("api/protected")]
[Authorize] // only authenticated Supabase users
public class ProtectedController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var email = User.FindFirst("email")?.Value;
        return Ok(new { message = $"Hello {email}, this is a protected endpoint." });
    }
}
```

#### Razor / MVC

```csharp
[Authorize]
public class AccountController : Controller
{
    public IActionResult Index()
    {
        var email = User.FindFirst("email")?.Value;
        ViewBag.Email = email;
        return View();
    }
}
```

---

### 6. (Opcjonalnie) SSR + Cookies

Jeśli masz **Razor Pages / MVC** i chcesz, żeby użytkownik był traktowany jak "zalogowany" bez ręcznego wkładania JWT w każdy request z frontu:

* nadal możesz użyć `JwtBearer`, a token ładować z cookie (`sb-access-token`) → nadpisując `OnMessageReceived` w `AddJwtBearer`,
* lub przekonwertować Supabase JWT na własny **cookie auth** ticket (bardziej klasycznie w ASP.NET).

Przykład z odczytem cookie w `JwtBearer`:

```csharp
.AddJwtBearer(options =>
{
    // ... TokenValidationParameters jak wyżej

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // jeśli nagłówka brak, spróbuj z HttpOnly cookie
            if (string.IsNullOrEmpty(context.Token) &&
                context.HttpContext.Request.Cookies.TryGetValue("sb-access-token", out var token))
            {
                context.Token = token;
            }

            return Task.CompletedTask;
        }
    };
});
```

---

## Security Best Practices

* Używaj **HttpOnly + Secure + SameSite=Lax/Strict** dla cookies z tokenami.
* `service_role` trzymaj **tylko w backendzie**, nigdy nie wysyłaj go do przeglądarki. ([GitHub][1])
* Waliduj **każdy** request przez `JwtBearer`, zamiast ręcznie parsować JWT.
* RLS w Supabase konfiguruj tak, aby ufać JWT (`sub`, `aud`, `role`), jeśli klient łączy się bezpośrednio z Supabase.
* Loguj błędy auth oraz nietypowe sytuacje (np. expired token, brak audience, złe issuer).

---

## Common Pitfalls (dla ASP.NET + Supabase)

1. **Nie waliduj JWT "ręcznie" w kontrolerach** – zawsze przez `AddAuthentication().AddJwtBearer(...)`.
2. **Nie używaj anon key jako JWT secret** – to inne wartości.
3. **Nie mieszaj service_role i user tokenów** w jednym kliencie Supabase – jeśli potrzebujesz obu, użyj dwóch osobnych instancji `Client`. ([GitHub][1])
4. **Nie polegaj na claims bez walidacji** – issuer, audience, signature muszą zostać sprawdzone.
5. Pamiętaj o **odświeżaniu tokenów** – Supabase ma mechanizmy refresh tokenów; możesz:

   * odświeżać token po stronie frontend + wysyłać nowy do API,
   * albo dodać endpoint `/api/auth/refresh` korzystający z `RefreshAccessToken`.