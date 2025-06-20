<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's route middleware.
     *
     * These middleware may be assigned to groups or used individually.
     *
     * @var array<string, class-string|string>
     */
    protected $routeMiddleware = [
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'throttle:api' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
        'check.position' => \App\Http\Middleware\CheckPosition::class,
    ];

    /**
     * The priority-sorted list of middleware.
     *
     * This list contains the middleware that will be executed in the order they are listed.
     *
     * @var array<string, int|class-string|string>
     */
    protected $middlewarePriority = [
        // Add your middleware priorities here
    ];
} 