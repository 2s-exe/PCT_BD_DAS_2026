# Configuration des Mailers - PCT UVCI

## Vue d'ensemble
Le système de mailers est configuré pour envoyer des emails après la création de comptes enseignants et secrétaires.

## Structure mise en place

### 1. **Mailable** (`app/Mail/AccountCreatedMail.php`)
- Classe responsable de la construction de l'email
- Détermine le format, le sujet et les données à envoyer
- Utilise un template Markdown

### 2. **Template Email** (`resources/mail/account-created.blade.php`)
- Template Markdown Bootstrap pour le rendu HTML
- Inclut le rôle utilisateur, identifiants et lien de connexion
- Stylisé automatiquement par Laravel Mailables

### 3. **Configuration**
Fichier : `config/mail.php`
- **Mailer par défaut** : `smtp` (configurable via `.env`)
- **Paramètres SMTP** :
  - `MAIL_HOST` : hôte SMTP
  - `MAIL_PORT` : port SMTP
  - `MAIL_USERNAME` : identifiant
  - `MAIL_PASSWORD` : mot de passe
  - `MAIL_FROM_ADDRESS` : adresse expéditrice
  - `MAIL_FROM_NAME` : nom expéditeur

### 4. **Utilisation dans les Controllers**

```php
use Illuminate\Support\Facades\Mail;
use App\Mail\AccountCreatedMail;

// Lors de la création d'un compte
Mail::to($user->email)->send(
    new AccountCreatedMail($login, $password, 'enseignant', $user->name)
);
```

## Configuration .env

### Développement (Logs)
```
MAIL_MAILER=log
MAIL_LOG_CHANNEL=stack
```

### Production (SMTP)
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-email@uvci.edu.ci
MAIL_PASSWORD=your-password
MAIL_FROM_ADDRESS=pct@uvci.edu.ci
MAIL_FROM_NAME="PCT UVCI"
```

### Alternative : Mailgun
```
MAIL_MAILER=mailgun
```

### Alternative : Services externes
- **SendGrid**
- **Amazon SES**
- **Postmark**

## Fichiers impactés

- `config/mail.php` - Configuration mailer par défaut changée de "log" à "smtp"
- `app/Mail/AccountCreatedMail.php` - **NOUVEAU** Mailable
- `resources/mail/account-created.blade.php` - **NOUVEAU** Template email
- `app/Http/Controllers/Api/EnseignantController.php` - Intégration Mailable
- `app/Http/Controllers/Api/SecretaireController.php` - Intégration Mailable
- `.env` - Configuration MAIL_MAILER changée à "smtp"

## Événements de envoi d'email

✅ **Création d'enseignant** (`EnseignantController@store`)
- Login : email de l'enseignant
- Mot de passe : généré ou fourni
- Rôle : "enseignant"

✅ **Import CSV enseignants** (`EnseignantController@importCsv`)
- Mot de passe par défaut : "Pct@" + année actuelle

✅ **Création de secrétaire** (`SecretaireController@store`)
- Login : email de la secrétaire
- Mot de passe : généré ou fourni
- Rôle : "secretaire"

## Points importants

1. **Pas de blocage sur erreur** : L'application continue même si l'envoi échoue
2. **Adresse expéditrice** : Configure `MAIL_FROM_ADDRESS` = `pct@uvci.edu.ci`
3. **Frontend URL** : Configure `FRONTEND_URL` pour le lien de connexion dans l'email
4. **Template réutilisable** : Peut être utilisé pour d'autres rôles (admin, etc.)

## Test en local

```bash
# Afficher les emails dans les logs (développement)
MAIL_MAILER=log php artisan tinker
Mail::to('test@example.com')->send(new \App\Mail\AccountCreatedMail('login', 'password123', 'enseignant', 'John Doe'));
```

Vérifier `storage/logs/laravel.log`
