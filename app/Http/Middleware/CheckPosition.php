<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckPosition
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->position) {
            $allowedPositions = ['Administrador', 'Gerente', 'Recursos Humanos'];

            if (!in_array($user->position->nombre, $allowedPositions)) {
                return redirect()->route('scann-attendance');
            }
        }

        return $next($request);
    }
}
