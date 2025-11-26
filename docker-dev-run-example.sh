docker run --rm -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__Default="XXX" \
  -e Supabase__Url="XXX" \
  -e Supabase__JwtSecret="XXX" \
  -e OpenAI__ApiKey="XXX" \
  memo-words:latest