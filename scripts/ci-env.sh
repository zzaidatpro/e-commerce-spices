#!/usr/bin/env bash
set -euo pipefail

# Lit les clés de la base locale démarrée par supabase start, sans les afficher
STATUS="$(pnpm exec supabase status -o env)"

lire() {
  printf '%s\n' "$STATUS" | grep "^$1=" | cut -d= -f2- | tr -d '"'
}

ANON="$(lire ANON_KEY)"
SERVICE="$(lire SERVICE_ROLE_KEY)"
API="$(lire API_URL)"

if [ -z "$ANON" ] || [ -z "$SERVICE" ] || [ -z "$API" ]; then
  echo "Clés locales introuvables : supabase start a-t-il réussi ?" >&2
  exit 1
fi

# Garde-fou : on n'écrit des clés de test que pour la base locale
case "$API" in
  http://127.0.0.1:*|http://localhost:*) ;;
  *) echo "API_URL non locale, refus d'écrire .env.test" >&2; exit 1 ;;
esac

mkdir -p apps/admin
{
  echo "SUPABASE_URL=$API"
  echo "SUPABASE_ANON_KEY=$ANON"
  echo "SUPABASE_SERVICE_ROLE_KEY=$SERVICE"
  echo "NEXT_PUBLIC_SUPABASE_URL=$API"
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON"
} > apps/admin/.env.test

echo "apps/admin/.env.test écrit pour la base locale ($API)"