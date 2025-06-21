<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        $user->load('position');

        if ($user) {
            $this->handleDeviceIdentification($user, $request);

            if ($user->position) {
                $allowedPositions = ['Administrador', 'Gerente', 'Recursos Humanos'];
                if (in_array($user->position->nombre, $allowedPositions)) {
                    return redirect()->intended(route('dashboard', absolute: false));
                }
            }
        }

        return redirect()->route('scann-attendance');
    }

    /**
     * Handle device identification for the user
     */
    private function handleDeviceIdentification($user, $request): void
    {
        $deviceId = $request->input('device_id');

        if (!$deviceId) {
            Log::warning('Device ID not provided during login', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            return;
        }

        if (empty($user->device_uid)) {
            $user->update(['device_uid' => $deviceId]);

            Log::info('Device ID stored for user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'device_id' => $deviceId,
                'ip' => $request->ip()
            ]);
        } elseif ($user->device_uid !== $deviceId) {
            Log::warning('Different device detected for user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'stored_device_id' => $user->device_uid,
                'current_device_id' => $deviceId,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        }
    }

    /**
     * Send security notification for different device login
     */
    private function sendSecurityNotification($user, $request): void
    {
        // Implementar notificación por email o sistema de notificaciones
        // Por ejemplo, usando Laravel Notifications

        /*
        $user->notify(new \App\Notifications\NewDeviceLogin([
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]));
        */
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
