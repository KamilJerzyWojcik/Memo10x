docker build -t memo-words:latest \
  --build-arg PUBLIC_ENV_NAME=production \
    --build-arg VITE_API_BASE_URL="http://localhost:8080" \
    --build-arg VITE_SUPABASE_URL="" \
    --build-arg VITE_SUPABASE_ANON_KEY="" \
  .