<?php

namespace App\Providers;

use App\Services\Auth\EGATAuthService;
use App\Services\User\UserManagementService;
use App\Services\Census\CensusDataService;
use App\Services\Department\DepartmentChangeService;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(EGATAuthService::class);
        $this->app->singleton(CensusDataService::class);
        $this->app->singleton(DepartmentChangeService::class);
        $this->app->singleton(UserManagementService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
