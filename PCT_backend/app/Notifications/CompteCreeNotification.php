<?php
namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CompteCreeNotification extends Notification
{
    public function __construct(
        private readonly string $login,
        private readonly string $password,
        private readonly string $role,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', config('app.url'));
        $roleLabel   = match ($this->role) {
            'admin'      => 'Administrateur',
            'secretaire' => 'Secrétaire pédagogique',
            default      => 'Enseignant',
        };

        return (new MailMessage)
            ->subject('Votre compte PCT UVCI a été créé')
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre compte **{$roleLabel}** sur la Plateforme de Calcul des Traitements (PCT UVCI) vient d'être créé.")
            ->line("**Identifiant :** {$this->login}")
            ->line("**Mot de passe temporaire :** {$this->password}")
            ->action('Se connecter', $frontendUrl . '/login')
            ->line('Veuillez changer votre mot de passe lors de votre première connexion.')
            ->salutation('L\'équipe PCT UVCI');
    }
}
