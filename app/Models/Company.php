<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'razon_social',
        'ruc',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
