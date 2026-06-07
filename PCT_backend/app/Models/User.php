<?php

namespace App\Models;

use App\Models\Enseignant;
use App\Models\Secretaire;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'login', 'email', 'password', 'role', 'actif', 'enseignant_id', 'secretaire_id'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'actif'    => 'boolean',
        ];
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function secretaire()
    {
        return $this->belongsTo(Secretaire::class);
    }

    public function routeNotificationForSms(): ?string
    {
        return $this->secretaire?->telephone ?? $this->enseignant?->telephone;
    }
}
