<?php
namespace App\Notifications;

use App\Models\VolumeHoraire;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class VolumeValideNotification extends Notification
{
    public function __construct(private readonly VolumeHoraire $volume) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $statut   = $this->volume->validation?->statut_validation;
        $isValide = $statut === 'valide';
        $annee    = $this->volume->annee?->libelle_annee ?? '';
        $obs      = $this->volume->validation?->observations;

        $mail = (new MailMessage)
            ->subject($isValide ? "Volume horaire validé — {$annee}" : "Volume horaire rejeté — {$annee}")
            ->greeting("Bonjour {$notifiable->name},");

        if ($isValide) {
            $mail->line("Votre volume horaire pour l'année **{$annee}** a été **validé**.")
                 ->line("Heures réalisées : **{$this->volume->heures_realisees} h**");
        } else {
            $mail->line("Votre volume horaire pour l'année **{$annee}** a été **rejeté**.")
                 ->line("Merci de prendre connaissance des observations ci-dessous et de contacter votre secrétaire pédagogique.");
        }

        if ($obs) {
            $mail->line("**Observations :** {$obs}");
        }

        return $mail
            ->action('Voir mon espace', config('app.frontend_url', config('app.url')) . '/enseignant')
            ->salutation('L\'équipe PCT UVCI');
    }
}
