FROM node:22-alpine AS FRONTEND_BUILDER

WORKDIR /app/frontend

COPY memo-words/package.json memo-words/package-lock.json* ./

RUN if [ -f "package-lock.json" ]; then \
      npm ci; \
    else \
      npm install; \
    fi

COPY memo-words/ .

# Build-time ARG i ENV dla frontendu (Vite)
ARG PUBLIC_ENV_NAME=production
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_PUBLIC_ENV_NAME=${PUBLIC_ENV_NAME} \
    VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

RUN npm run build


FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS BACKEND_BUILDER

WORKDIR /src

COPY MemoWords/MemoWords.Api/MemoWords.Api.csproj MemoWords/MemoWords.Api/

RUN dotnet restore MemoWords/MemoWords.Api/MemoWords.Api.csproj

COPY MemoWords/ MemoWords/

COPY --from=FRONTEND_BUILDER /app/frontend/dist ./MemoWords/MemoWords.Api/wwwroot

RUN dotnet publish MemoWords/MemoWords.Api/MemoWords.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS RUNTIME

LABEL org.opencontainers.image.title="memo-words" \
      org.opencontainers.image.description="MemoWords - ASP.NET 9 + React 19 (Vite) in a single container"

WORKDIR /app

COPY --from=BACKEND_BUILDER /app/publish ./

ENV ASPNETCORE_URLS="http://0.0.0.0:8080" \
    ASPNETCORE_ENVIRONMENT="Production"

EXPOSE 8080

RUN adduser -u 1001 -D appuser && \
    chown -R appuser:appuser /app

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

CMD ["dotnet", "MemoWords.Api.dll"]


