<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        $to = $notifiable->routeNotificationFor('sms', $notification);
        if (empty($to)) {
            return;
        }

        $message = $notification->toSms($notifiable);
        if (empty($message)) {
            return;
        }

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');

        if (empty($sid) || empty($token) || empty($from)) {
            Log::warning('Twilio SMS not sent: missing Twilio configuration.');
            return;
        }

        try {
            Http::asForm()
                ->withBasicAuth($sid, $token)
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                    'From' => $from,
                    'To' => $this->formatPhoneNumber($to),
                    'Body' => $message,
                ]);
        } catch (\Exception $exception) {
            Log::warning('Twilio SMS send failed: ' . $exception->getMessage());
        }
    }

    private function formatPhoneNumber(string $phone): string
    {
        $clean = preg_replace('/[^0-9+]/', '', $phone);

        if (str_starts_with($clean, '00')) {
            return '+' . substr($clean, 2);
        }

        return $clean;
    }
}
