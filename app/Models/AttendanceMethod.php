<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceMethod extends Model
{
    protected $fillable = [
        'clave',
        'nombre',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
