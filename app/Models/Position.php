<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
