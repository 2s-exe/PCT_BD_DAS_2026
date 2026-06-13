#!/bin/sh
set -e

# ── Attente DB avec timeout (évite la boucle infinie sur Render/cloud) ─────────
MAX_TRIES=30
TRIES=0
echo "[entrypoint] Waiting for database..."
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT:-18191};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}', [PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false]);" 2>/dev/null; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge "$MAX_TRIES" ]; then
    echo "[entrypoint] FATAL: database unreachable after ${MAX_TRIES} attempts — aborting."
    exit 1
  fi
  echo "[entrypoint] DB not ready (attempt ${TRIES}/${MAX_TRIES}) — retrying in 2s..."
  sleep 2
done
echo "[entrypoint] Database is up."

# ── APP_KEY (premier démarrage sans .env injecté) ───────────────────────────────
if [ -z "$APP_KEY" ]; then
  echo "[entrypoint] APP_KEY missing — generating..."
  php artisan key:generate --force
fi

# ── Migrations (idempotent) ─────────────────────────────────────────────────────
echo "[entrypoint] Running migrations..."
php artisan migrate --force
echo "[entrypoint] Migrations OK."

# ── Seed initial ────────────────────────────────────────────────────────────────
if [ "${APP_ENV}" = "local" ]; then
  echo "[entrypoint] ENV=local — seeding test data (DevSeeder)..."
  php artisan db:seed --class=DevSeeder --force 2>/dev/null || true
else
  echo "[entrypoint] ENV=${APP_ENV} — seeding production data (DatabaseSeeder)..."
  php artisan db:seed --class=DatabaseSeeder --force 2>/dev/null || true
fi

# ── Documentation Swagger ───────────────────────────────────────────────────────
php artisan l5-swagger:generate 2>/dev/null || true

# ── Caches Laravel ─────────────────────────────────────────────────────────────
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "[entrypoint] Starting server on port ${PORT:-8000}..."
exec "$@"
