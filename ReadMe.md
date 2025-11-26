
# Supabase

- npx supabase init
- npx supabase start
- npx supabase status -o env
- supabase status
RLS ustawiamy w supabase osobno na tabelach

- chmura polaczenie: connection string z session pooler dla .Net 
Session pooler
Only recommended as an alternative to Direct Connection, when connecting via an IPv4 network.

# React

dev: npm run dev
http://localhost:5173/

produkcja : npm run preview
http://localhost:4173/

# Backend
dotnet user-secrets set "OpenAI:ApiKey" "sk-proj-..."


Testy
https://playwright.dev/docs/pom


# Docker


#### 1. Zbuduj obraz Dockera

W katalogu głównym repo (`C:\Codes\Memo10x`):

```bash
docker build -t memo-words:latest --build-arg PUBLIC_ENV_NAME=dev .
```

przebudowa:
docker rm -f upbeat_newton
```bash
docker build -t memo-words:latest --build-arg PUBLIC_ENV_NAME=dev .
```

#### 2. Uruchom kontener z wymaganymi zmiennymi

budowanie:
docker-dev-run-example.sh

uruchomienie kontenera:
docker-dev-run-example.sh

#### 3. Sprawdź działanie aplikacji

- API / frontend: `http://localhost:8080`
- Health-check: `http://localhost:8080/health`  
  