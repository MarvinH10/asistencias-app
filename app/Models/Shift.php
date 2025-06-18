<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = [
        'nombre',
        'hora_inicio',
        'hora_fin',
        'creado_por',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'shift_user', 'shift_id', 'user_id');
    }
}
