<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $login,
        public readonly string $password,
        public readonly string $userRole,
        public readonly string $userName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: env('MAIL_FROM_ADDRESS', 'noreply@uvci.edu.ci'),
            subject: 'Votre compte PCT UVCI a été créé',
        );
    }

    public function content(): Content
    {
        $roleLabel = match ($this->userRole) {
            'admin' => 'Administrateur',
            'secretaire' => 'Secrétaire pédagogique',
            default => 'Enseignant',
        };

        return new Content(
            markdown: 'mail.account-created',
            with: [
                'userName' => $this->userName,
                'login' => $this->login,
                'password' => $this->password,
                'roleLabel' => $roleLabel,
                'frontendUrl' => config('app.frontend_url', config('app.url')),
            ],
        );
    }
}
