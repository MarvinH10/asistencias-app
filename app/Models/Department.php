<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = [
        'nombre',
        'codigo',
        'direccion',
        'descripcion',
        'estado',
        'parent_id',
        'company_id',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function parent()
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    public function childrens()
    {
        return $this->hasMany(Department::class, 'parent_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
