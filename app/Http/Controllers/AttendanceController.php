<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AttendanceRecord;
use App\Models\QrCode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    /**
     * Registrar asistencia mediante QR
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'qr_code' => 'required|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
        ]);
        
        $qrCode = QrCode::where('qr_code', $validated['qr_code'])->first();
        
        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'error' => 'Código QR no válido. Por favor, verifica el código e intenta nuevamente.'
            ], 404);
        }
        
        $user = User::where('qr_code_id', $qrCode->id)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'No se encontró un usuario asociado a este código QR. Por favor, contacta al administrador.'
            ], 404);
        }

        // Verificar si ya existe un registro reciente (últimos 30 segundos)
        // $recentRecord = AttendanceRecord::where('user_id', $user->id)
        //     ->where('qr_token', $validated['qr_code'])
        //     ->where('created_at', '>=', now()->subSeconds(30))
        //     ->first();

        // if ($recentRecord) {
        //     return response()->json([
        //         'success' => false,
        //         'error' => 'Ya se registró una asistencia recientemente. Espera unos segundos antes de intentar nuevamente.'
        //     ], 409);
        // }

        // Verificar si hay un registro del mismo tipo en los últimos 5 minutos
        // $recentSameType = AttendanceRecord::where('user_id', $user->id)
        //     ->where('status', $validated['type'])
        //     ->where('created_at', '>=', now()->subMinutes(5))
        //     ->first();

        // if ($recentSameType) {
        //     return response()->json([
        //         'success' => false,
        //         'error' => "Ya existe un registro de {$validated['type']} en los últimos 5 minutos."
        //     ], 409);
        // }

        $locationWarning = $this->validateLocation($validated, $user);
        
        try {
            $lastRecord = AttendanceRecord::where('user_id', $user->id)
                ->whereDate('created_at', now()->toDateString())
                ->orderBy('created_at', 'desc')
                ->first();

            $status = $lastRecord ? ($lastRecord->status === 'Entrada' ? 'Salida' : 'Entrada') : 'Entrada';

            $attendanceRecord = AttendanceRecord::create([
                'user_id' => $user->id,
                'attendance_method_id' => 1,
                'timestamp' => now(),
                'status' => $status,
                'ip_address' => $request->ip(),
                'qr_token' => $validated['qr_code'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'estado' => true,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al registrar asistencia: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Ocurrió un error inesperado al registrar la asistencia. Intenta nuevamente o contacta al administrador.'
            ], 500);
        }
        
        $response = [
            'success' => true,
            'message' => "¡Asistencia registrada exitosamente como {$status}!",
            'user_name' => $user->name,
            'timestamp' => $attendanceRecord->timestamp
        ];

        if ($locationWarning) {
            $response['warning'] = $locationWarning;
        }
        
        return response()->json($response);
    }

    /**
     * Validar ubicación y coordenadas
     */
    private function validateLocation(array $validated, User $user): ?string
    {
        if (!$validated['latitude'] || !$validated['longitude']) {
            return null;
        }

        $lat = (float) $validated['latitude'];
        $lng = (float) $validated['longitude'];

        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return 'Las coordenadas de ubicación no son válidas.';
        }

        if ($lat < -18.5 || $lat > -0.1 || $lng < -81.3 || $lng > -68.7) {
            return "Advertencia: Las coordenadas están fuera del rango esperado para Perú. Verifica tu ubicación.";
        }

        $lastRecord = AttendanceRecord::where('user_id', $user->id)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($lastRecord && $lastRecord->latitude && $lastRecord->longitude) {
            $distance = $this->calculateDistance(
                (float) $lastRecord->latitude,
                (float) $lastRecord->longitude,
                $lat,
                $lng
            );

            if ($distance > 100) {
                return "Advertencia: La ubicación actual está a " . round($distance) . " metros de la ubicación anterior. Verifica que estés en el lugar correcto.";
            }
        }

        return null;
    }

    /**
     * Calcular distancia entre dos puntos usando la fórmula de Haversine
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000;
        
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
} 