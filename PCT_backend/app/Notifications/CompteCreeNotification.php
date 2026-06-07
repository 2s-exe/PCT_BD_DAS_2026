<?php
namespace App\Notifications;

use Illuminate\Notifications\Notification;
use App\Notifications\Channels\SmsChannel;
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
        return ['mail', SmsChannel::class];
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

    public function toSms(object $notifiable): string
    {
        $roleLabel = match ($this->role) {
            'admin' => 'Administrateur',
            'secretaire' => 'Secrétaire pédagogique',
            default => 'Enseignant',
        };

        return "Votre compte {$roleLabel} PCT UVCI a été créé. Identifiant : {$this->login}. Mot de passe temporaire : {$this->password}. Connectez-vous via : " . config('app.frontend_url', config('app.url')) . "/login";
    }
}
