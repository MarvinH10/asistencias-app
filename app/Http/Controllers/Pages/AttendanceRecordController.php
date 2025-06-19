<?php

namespace App\Http\Controllers\Pages;

use App\Models\AttendanceRecord;
use App\Models\AttendanceMethod;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AttendanceRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $attendanceRecords = AttendanceRecord::with(['user', 'attendanceMethod'])->get();
        return Inertia::render('attendance-records', [
            'attendanceRecords' => $attendanceRecords
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('attendance-records/create', array_merge([
        ], self::getAttendanceRecordFormOptions()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'attendance_method_id' => 'required|exists:attendance_methods,id',
            'user_id' => 'required|exists:users,id',
            'timestamp' => 'required|date_format:Y-m-d H:i:s',
            'ip_address' => 'nullable|string|max:255',
            'qr_token' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'required|in:Entrada,Salida',
            'notas' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ]);

        AttendanceRecord::create($validated);

        return redirect()->route('attendance-records.index')->with('success', 'Registro de asistencia creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AttendanceRecord $attendanceRecord)
    {
        return Inertia::render('attendance-records/show', [
            'attendanceRecord' => $attendanceRecord
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AttendanceRecord $attendanceRecord)
    {
        return Inertia::render('attendance-records/edit', array_merge([
            'attendanceRecord' => $attendanceRecord->load(['user', 'attendanceMethod']),
        ], self::getAttendanceRecordFormOptions($attendanceRecord->id)));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AttendanceRecord $attendanceRecord)
    {
        $validated = $request->validate([
            'attendance_method_id' => 'required|exists:attendance_methods,id',
            'user_id' => 'required|exists:users,id',
            'timestamp' => 'required|date',
            'ip_address' => 'nullable|string|max:255',
            'qr_token' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'required|in:Entrada,Salida',
            'notas' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ]);

        $attendanceRecord->update($validated);

        return redirect()->route('attendance-records.index')->with('success', 'Registro de asistencia actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttendanceRecord $attendanceRecord)
    {
        $attendanceRecord->delete();

        return redirect()->route('attendance-records.index')
            ->with('success', 'Registro de asistencia eliminado exitosamente.');
    }

    /**
     * Duplicate attendance records
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron registros de asistencia para duplicar.');
        }

        $attendanceRecords = AttendanceRecord::whereIn('id', $ids)->get();

        foreach ($attendanceRecords as $attendanceRecord) {
            $newAttendanceRecord = $attendanceRecord->replicate();

            $baseTimestamp = $attendanceRecord->timestamp;
            $newTimestamp = $baseTimestamp . '_copy';
            $counter = 1;

            while (AttendanceRecord::where('timestamp', $newTimestamp)->exists()) {
                $newTimestamp = $baseTimestamp . '_copy_' . $counter;
                $counter++;

                if (strlen($newTimestamp) > 20) {
                    $newTimestamp = substr($baseTimestamp, 0, 10) . '_' . time() . rand(10, 99);
                    break;
                }
            }

            $newAttendanceRecord->timestamp = $newTimestamp;
            $newAttendanceRecord->qr_token = $newAttendanceRecord->qr_token . '_copy';
            $newAttendanceRecord->ip_address = $newAttendanceRecord->ip_address . '_copy';
            $newAttendanceRecord->latitude = $newAttendanceRecord->latitude . '_copy';
            $newAttendanceRecord->longitude = $newAttendanceRecord->longitude . '_copy';
            $newAttendanceRecord->status = $newAttendanceRecord->status . '_copy';
            $newAttendanceRecord->notas = $newAttendanceRecord->notas . '_copy';
            $newAttendanceRecord->estado = $newAttendanceRecord->estado . '_copy';

            $newAttendanceRecord->save();
        }

        return back()->with('success', 'Registros de asistencia duplicados exitosamente.');
    }

    /**
     * Bulk delete attendance records
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron registros de asistencia para eliminar.');
        }

        AttendanceRecord::whereIn('id', $ids)->delete();

        return back()->with('success', 'Registros de asistencia eliminados exitosamente.');
    }

    public static function getAttendanceRecordFormOptions($excludeId = null)
    {
        $attendanceMethods = AttendanceMethod::select('id', 'nombre');
        $users = User::select('id', 'name');

        if ($excludeId) {
            $attendanceMethods->where('id', '!=', $excludeId);
        }
        if ($excludeId) {
            $users->where('id', '!=', $excludeId);
        }

        $attendanceMethods = $attendanceMethods->get();
        $users = $users->get();

        return [
            'attendanceMethods' => $attendanceMethods,
            'users' => $users,
        ];
    }
}
