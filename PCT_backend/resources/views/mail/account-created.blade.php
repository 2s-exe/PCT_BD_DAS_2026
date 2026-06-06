@component('mail::message')
# Bienvenue sur PCT UVCI

Bonjour {{ $userName }},

Votre compte **{{ $roleLabel }}** sur la Plateforme de Calcul des Traitements (PCT UVCI) vient d'être créé avec succès.

## Vos identifiants

**Identifiant :** {{ $login }}

**Mot de passe temporaire :** {{ $password }}

@component('mail::button', ['url' => $frontendUrl . '/login'])
Se connecter
@endcomponent

⚠️ **Important :** Veuillez changer votre mot de passe lors de votre première connexion pour sécuriser votre compte.

Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe support.

@component('mail::footer')
© {{ date('Y') }} PCT UVCI — Université Virtuelle de Côte d'Ivoire
@endcomponent
@endcomponent
