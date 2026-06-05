#!/bin/sh
set -e

echo "Waiting for database..."
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
  sleep 2
done
echo "Database is up."

if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force
fi

# Tente la migration normale (idempotente si déjà à jour)
set +e
php artisan migrate --force
MIGRATE_EXIT=$?
set -e

# Si des tables orphelines existent (volume sale d'un run précédent), reset propre
if [ "$MIGRATE_EXIT" -ne 0 ]; then
  echo "Migration conflict detected — resetting schema..."
  php artisan migrate:fresh --force
fi

# Publier la config spatie/activitylog si pas encore fait
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations" --no-interaction 2>/dev/null || true

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"