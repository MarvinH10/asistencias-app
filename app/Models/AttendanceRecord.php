<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    protected $fillable = [
        'user_id',
        'attendance_method_id',
        'timestamp',
        'ip_address',
        'qr_token',
        'latitude',
        'longitude',
        'status',
        'notas',
        'estado',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'estado' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attendanceMethod()
    {
        return $this->belongsTo(AttendanceMethod::class);
    }

    public function holiday()
    {
        return $this->belongsTo(Holiday::class);
    }
}
