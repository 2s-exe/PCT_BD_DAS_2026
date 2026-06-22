<?php

namespace App\Providers;

use App\Models\Enseignant;
use App\Observers\EnseignantObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Enseignant::observe(EnseignantObserver::class);
    }
}
