<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'fecha',
        'nombre',
        'descripcion',
        'recurrente',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'recurrente' => 'boolean',
        'estado' => 'boolean',
    ];

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function attendanceRecord()
    {
        return $this->hasOne(AttendanceRecord::class);
    }
}
