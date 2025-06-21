<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Company;
use App\Models\Department;
use App\Models\Position;
use App\Models\User;
use App\Models\QrCode;
use App\Models\AttendanceMethod;
use App\Models\AttendanceRecord;
use App\Models\Holiday;
use App\Models\Shift;
use Illuminate\Support\Str;
use App\Exports\GenericExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Database\QueryException;

class PageViewController extends Controller
{
    protected function traducirClave(string $key): string
    {
        $traducciones = [
            'Qr-code' => 'Código QR',
            'Company' => 'Compañía',
            'Department' => 'Departamento',
            'Position' => 'Cargo',
            'User' => 'Usuario',
            'Attendance-method' => 'Método de marcado',
            'Attendance-record' => 'Registro de asistencia',
            'Holiday' => 'Feriado',
            'Shift' => 'Turno',
        ];

        $singular = Str::singular(ucwords($key));

        return $traducciones[$singular] ?? $singular;
    }

    protected function getPluralTraduccion(string $singular): string
    {
        $traduccionesPlural = [
            'Código QR' => 'códigos qr',
            'Compañía' => 'compañías',
            'Departamento' => 'departamentos',
            'Cargo' => 'cargos',
            'Usuario' => 'usuarios',
            'Método de marcado' => 'métodos de marcado',
            'Registro de asistencia' => 'registros de asistencia',
            'Feriado' => 'feriados',
            'Turno' => 'turnos',
        ];

        return $traduccionesPlural[$singular] ?? Str::plural($singular);
    }

    protected function validateFields(Request $request, string $key): array
    {
        $rules = [];
        $messages = [];
    
        $isUpdate = str_contains($request->route()->getName(), '.update');
        $id = $request->route('id');

        foreach ($this->getFieldsSchema($key) as $field) {
            if (isset($field['readonly']) && $field['readonly']) {
                continue;
            }
            
            $rule = [];
    
            if (! $field['required']) {
                $rule[] = 'nullable';
            }

            if ($field['required']) {
                $rule[] = 'required';
            }

            if ($field['type'] === 'text') {
                $rule[] = 'string';
            } elseif ($field['type'] === 'number') {
                $rule[] = 'numeric';
            } elseif ($field['type'] === 'checkbox') {
                $rule[] = 'boolean';
            }
    
            if ($key === 'companies' && $field['name'] === 'ruc') {
                $rule[] = 'digits:11';
            }

            if ($key === 'attendance-methods' && $field['name'] === 'clave') {
                $rule[] = 'unique:attendance_methods,clave';
                $messages['clave.unique'] = 'La clave ya está en uso.';
            }
            if ($key === 'users' && $field['name'] === 'email') {
                if ($isUpdate && $id) {
                    $rule[] = 'unique:users,email,' . $id;
                } else {
                    $rule[] = 'unique:users,email';
                }
                $messages['email.unique'] = 'El correo electrónico ya está en uso.';
            }

            $rules[$field['name']] = $rule;
        }

        return $request->validate($rules, $messages);
    }

    protected function getFieldsSchema(string $key): array
    {
        $schemas = [
            'qr-codes' => [
                ['name' => 'qr_code', 'label' => 'Código QR', 'type' => 'text', 'required' => true],
            ],
            'companies' => [
                ['name' => 'razon_social', 'label' => 'Razón Social', 'type' => 'text', 'required' => true],
                ['name' => 'ruc', 'label' => 'RUC', 'type' => 'text', 'required' => true],
                ['name' => 'estado', 'label' => 'Activo', 'type' => 'checkbox', 'required' => false],
            ],
            'departments' => [
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text', 'required' => true],
                ['name' => 'codigo', 'label' => 'Código', 'type' => 'text', 'required' => true],
                ['name' => 'direccion', 'label' => 'Dirección', 'type' => 'text', 'required' => false],
                ['name' => 'descripcion', 'label' => 'Descripción', 'type' => 'text', 'required' => false],
                ['name' => 'estado', 'label' => 'Activo', 'type' => 'checkbox', 'required' => false],
                ['name' => 'parent_id', 'label' => 'Departamento Padre', 'type' => 'select', 'required' => false],
                ['name' => 'company_id', 'label' => 'Compañía', 'type' => 'select', 'required' => true],
            ],
            'positions' => [
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text', 'required' => true],
                ['name' => 'descripcion', 'label' => 'Descripción', 'type' => 'text', 'required' => false],
                ['name' => 'estado', 'label' => 'Activo', 'type' => 'checkbox', 'required' => false],
                ['name' => 'company_id', 'label' => 'Compañía', 'type' => 'select', 'required' => true],
                ['name' => 'department_id', 'label' => 'Departamento', 'type' => 'select', 'required' => false],
                ['name' => 'parent_id', 'label' => 'Cargo Padre', 'type' => 'select', 'required' => false],
            ],
            'users' => [
                ['name' => 'name', 'label' => 'Nombre', 'type' => 'text', 'required' => true],
                ['name' => 'email', 'label' => 'Email', 'type' => 'text', 'required' => true],
                ['name' => 'password', 'label' => 'Contraseña', 'type' => 'text', 'required' => false],
                ['name' => 'qr_code_id', 'label' => 'Código QR', 'type' => 'select', 'required' => false],
                ['name' => 'company_id', 'label' => 'Compañía', 'type' => 'select', 'required' => true],
                ['name' => 'department_id', 'label' => 'Departamento', 'type' => 'select', 'required' => true],
                ['name' => 'position_id', 'label' => 'Cargo', 'type' => 'select', 'required' => true],
                ['name' => 'fecha_ingreso', 'label' => 'Fecha de Ingreso', 'type' => 'date', 'required' => true],
                ['name' => 'fecha_retiro', 'label' => 'Fecha de Retiro', 'type' => 'date', 'required' => false],
                ['name' => 'fecha_cumpleanos', 'label' => 'Fecha de Cumpleaños', 'type' => 'date', 'required' => false],
                ['name' => 'device_uid', 'label' => 'ID único del dispositivo', 'type' => 'text', 'required' => false, 'readonly' => true],
                ['name' => 'firma_digital', 'label' => 'Firma Digital', 'type' => 'file', 'required' => false],
                ['name' => 'dni', 'label' => 'DNI', 'type' => 'text', 'required' => true, 'maxlength' => 8, 'pattern' => '[0-9]{8}'],
                ['name' => 'estado', 'label' => 'Activo', 'type' => 'checkbox', 'required' => false],
            ],
            'attendance-methods' => [
                ['name' => 'clave', 'label' => 'Clave', 'type' => 'text', 'required' => true],
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text', 'required' => true],
                ['name' => 'descripcion', 'label' => 'Descripción', 'type' => 'text', 'required' => false],
                ['name' => 'estado', 'label' => 'Activo', 'type' => 'checkbox', 'required' => false],
            ],
            'attendance-records' => [
                ['name' => 'user_id', 'label' => 'Usuario', 'type' => 'select', 'required' => true],
                ['name' => 'attendance_method_id', 'label' => 'Método de marcado', 'type' => 'select', 'required' => true],
                ['name' => 'timestamp', 'label' => 'Fecha y hora', 'type' => 'datetime-local', 'required' => true],
                ['name' => 'ip_address', 'label' => 'Dirección IP', 'type' => 'text', 'required' => false],
                ['name' => 'qr_token', 'label' => 'Token QR', 'type' => 'text', 'required' => false],
                ['name' => 'latitude', 'label' => 'Latitud', 'type' => 'number', 'required' => false],
                ['name' => 'longitude', 'label' => 'Longitud', 'type' => 'number', 'required' => false],
                ['name' => 'status', 'label' => 'Tipo de registro', 'type' => 'select', 'required' => true, 'options' => [
                    ['value' => 'Entrada', 'label' => 'Entrada'],
                    ['value' => 'Salida', 'label' => 'Salida']
                ]],
                ['name' => 'notas', 'label' => 'Notas', 'type' => 'text', 'required' => false],
                ['name' => 'estado', 'label' => 'Activo', 'type' => 'checkbox', 'required' => false],
            ],
            'holidays' => [
                ['name' => 'fecha', 'label' => 'Fecha', 'type' => 'date', 'required' => true],
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text', 'required' => true],
                ['name' => 'descripcion', 'label' => 'Descripción', 'type' => 'text', 'required' => false],
                ['name' => 'recurrente', 'label' => 'Recurrente', 'type' => 'checkbox', 'required' => false],
                ['name' => 'estado', 'label' => 'Activo', 'type' => 'checkbox', 'required' => false],
            ],
            'shifts' => [
                ['name' => 'nombre', 'label' => 'Nombre', 'type' => 'text', 'required' => true],
                ['name' => 'hora_inicio', 'label' => 'Hora de Inicio', 'type' => 'time', 'required' => true],
                ['name' => 'hora_fin', 'label' => 'Hora de Fin', 'type' => 'time', 'required' => true],
                ['name' => 'creado_por', 'label' => 'Creado por', 'type' => 'select', 'required' => true],
                ['name' => 'estado', 'label' => 'Activo', 'type' => 'checkbox', 'required' => false],
            ],
        ];

        return $schemas[$key] ?? [];
    }

    protected $modelMap = [
        'qr-codes' => QrCode::class,
        'companies' => Company::class,
        'departments' => Department::class,
        'positions' => Position::class,
        'users' => User::class,
        'attendance-methods' => AttendanceMethod::class,
        'attendance-records' => AttendanceRecord::class,
        'holidays' => Holiday::class,
        'shifts' => Shift::class,
    ];

    protected $modelRelations = [
        'departments' => ['company', 'parent'],
        'users' => ['company', 'department', 'position'],
        'attendance-records' => ['user', 'attendanceMethod'],
        'shifts' => ['createdBy', 'users'],
    ];

    public function index(Request $request)
    {
        $page = $request->route()->getName();

        $data = [];

        if (isset($this->modelMap[$page])) {
            $model = $this->modelMap[$page];
            $relations = $this->modelRelations[$page] ?? [];
            $key = Str::camel($page);

            if ($page === 'qr-codes') {
                $data['qrCode'] = $model::first();
            } else {
                $data[$key] = !empty($relations)
                ? $model::with($relations)->get()
                : $model::all();
            }
        }

        return Inertia::render($page, $data);
    }

    public function create(Request $request)
    {
        $key = Str::before($request->route()->getName(), '.create');
        $page = $key;

        $attendanceMethodsQuery = AttendanceMethod::where('estado', true);

        if ($key === 'attendance-records') {
            $attendanceMethodsQuery->where('clave', 'MANUAL');
        }

        return Inertia::render("{$page}/create", [
            'title' => $this->traducirClave($key),
            'urlView' => "/{$key}",
            'breadcrumb' => $this->traducirClave($key) . ' / Crear',
            'fields' => $this->getFieldsSchema($key),
            'companies' => Company::where('estado', true)->select('id', 'razon_social')->get(),
            'parents' => Department::where('estado', true)->select('id', 'nombre')->get(),
            'positions' => Position::where('estado', true)->select('id', 'nombre')->get(),
            'departments' => Department::where('estado', true)->select('id', 'nombre')->get(),
            'attendanceMethods' => $attendanceMethodsQuery->select('id', 'nombre', 'clave')->get(),
            'users' => User::where('estado', true)->select('id', 'name')->get(),
            'shifts' => Shift::where('estado', true)->select('id', 'nombre')->get(),
            'qrCodes' => QrCode::select('id', 'qr_code')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $key = Str::before($request->route()->getName(), '.store');

        if (!isset($this->modelMap[$key])) {
            abort(404);
        }

        $validated = $this->validateFields($request, $key);
        $model = $this->modelMap[$key];
        
        try {
            $model::create($validated);
        } catch (QueryException $e) {
            return redirect()->back()->with('error', 'Un error de base de datos impidió la creación del registro.');
        }

        return redirect("/$key")->with('success', $this->traducirClave($key) . ' creado exitosamente.');
    }

    public function edit(Request $request, $id)
    {
        $key = Str::before($request->route()->getName(), '.edit');
        $model = $this->modelMap[$key];
        $record = $model::findOrFail($id);

        $usersQuery = User::where('estado', true);
        if ($key === 'attendance-records' && isset($record->user_id)) {
            $usersQuery->orWhere('id', $record->user_id);
        }
        if ($key === 'shifts' && isset($record->creado_por)) {
            $usersQuery->orWhere('id', $record->creado_por);
        }

        return Inertia::render("{$key}/edit", [
            'id' => $id,
            'title' => $this->traducirClave($key),
            'urlView' => "/{$key}",
            'breadcrumb' => $this->traducirClave($key) . ' / Editar',
            'fields' => $this->getFieldsSchema($key),
            'initialData' => $record,
            'companies' => Company::where('estado', true)->when($record->company_id, fn($q, $id) => $q->orWhere('id', $id))->select('id', 'razon_social')->get(),
            'parents' => Department::where('estado', true)->when($record->parent_id, fn($q, $id) => $q->orWhere('id', 'id'))->select('id', 'nombre')->get(),
            'positions' => Position::where('estado', true)->when($record->position_id, fn($q, $id) => $q->orWhere('id', $id))->select('id', 'nombre')->get(),
            'departments' => Department::where('estado', true)->when($record->department_id, fn($q, $id) => $q->orWhere('id', $id))->select('id', 'nombre')->get(),
            'attendanceMethods' => AttendanceMethod::where('estado', true)->when($record->attendance_method_id, fn($q, $id) => $q->orWhere('id', $id))->select('id', 'nombre', 'clave')->get(),
            'users' => $usersQuery->select('id', 'name')->get(),
            'shifts' => Shift::where('estado', true)->select('id', 'nombre')->get(),
            'qrCodes' => QrCode::select('id', 'qr_code')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $key = Str::before($request->route()->getName(), '.update');

        if (!isset($this->modelMap[$key])) {
            abort(404);
        }

        $validated = $this->validateFields($request, $key);
        $model = $this->modelMap[$key];
        $record = $model::findOrFail($id);
        
        try {
            $record->update($validated);
        } catch (QueryException $e) {
            return redirect()->back()->with('error', 'Un error de base de datos impidió la actualización del registro.');
        }

        return redirect("/$key");
    }

    public function delete(Request $request)
    {
        $page = str_replace(['.delete', '.bulk-delete'], '', $request->route()->getName());
        $ids = $request->input('ids', []);

        if (empty($ids) && $request->route('id')) {
            $ids = [$request->route('id')];
        }

        if (empty($ids)) {
            return redirect()->back()->with('error', 'No se han seleccionado elementos para eliminar.');
        }
        
        if (isset($this->modelMap[$page])) {
            $modelClass = $this->modelMap[$page];

            try {
                $deletedCount = $modelClass::whereIn('id', $ids)->delete();
            } catch (QueryException $e) {
                if ($e->getCode() === '23000') {
                    $singular = $this->traducirClave($page);
                    $plural = $this->getPluralTraduccion($singular);
                    
                    return redirect()->back()->with('error', "No se puede eliminar. Al menos uno de los {$plural} seleccionados está en uso.");
                }

                return redirect()->back()->with('error', 'Un error de base de datos impidió la eliminación.');
            }

            if ($deletedCount > 0) {
                $singular = $this->traducirClave($page);
                if ($deletedCount === 1) {
                    $successMessage = "{$singular} eliminado exitosamente.";
                } else {
                    $plural = $this->getPluralTraduccion($singular);
                    $successMessage = "{$deletedCount} {$plural} eliminados exitosamente.";
                }
                return redirect("/$page")->with('success', $successMessage);
            }
            
            return redirect("/$page")->with('error', 'No se eliminó ningún registro.');
        }

        abort(404);
    }

    public function duplicate(Request $request)
    {
        $key = Str::before($request->route()->getName(), '.duplicate');

        if (!isset($this->modelMap[$key])) {
            abort(404);
        }

        $modelClass = $this->modelMap[$key];
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return redirect()->back()->with('error', 'No se seleccionaron registros para duplicar.');
        }

        $records = $modelClass::whereIn('id', $ids)->get();
        $newCount = 0;

        foreach ($records as $record) {
            $clone = $record->replicate();

            if ($key === 'departments' && isset($clone->codigo)) {
                $baseCodigo = $clone->codigo;
                $newCodigo = "{$baseCodigo}_copy";
                $counter = 1;

                while ($modelClass::where('codigo', $newCodigo)->exists()) {
                    $newCodigo = "{$baseCodigo}_copy_{$counter}";
                    $counter++;

                    if (strlen($newCodigo) > 20) {
                        $newCodigo = substr($baseCodigo, 0, 10) . '_' . time() . rand(10, 99);
                        break;
                    }
                }

                $clone->codigo = $newCodigo;
                $clone->nombre = "{$record->nombre} (Copia)";
                $clone->direccion = $record->direccion ? "{$record->direccion} (Copia)" : null;
                $clone->descripcion = $record->descripcion ? "{$record->descripcion} (Copia)" : null;
            }

            if ($key === 'companies' && isset($clone->ruc)) {
                $clone->razon_social = "{$record->razon_social} (Copia)";
                $clone->ruc = $record->ruc;
            }

            if ($key === 'positions') {
                $clone->nombre = "{$record->nombre} (Copia)";
                $clone->descripcion = $record->descripcion ? "{$record->descripcion} (Copia)" : null;
            }

            if ($key === 'users') {
                $clone->name = "{$record->name} (Copia)";
                $clone->email = "{$record->email} (Copia)";
                $clone->password = $record->password;
                $clone->qr_code_id = $record->qr_code_id;
                $clone->company_id = $record->company_id;
                $clone->department_id = $record->department_id;
                $clone->position_id = $record->position_id;
                $clone->fecha_ingreso = $record->fecha_ingreso;
                $clone->fecha_retiro = $record->fecha_retiro;
                $clone->estado = $record->estado;
            }

            if ($key === 'attendance-methods') {
                $clone->clave = "{$record->clave} (Copia)";
                $clone->nombre = "{$record->nombre} (Copia)";
                $clone->descripcion = $record->descripcion ? "{$record->descripcion} (Copia)" : null;
                $clone->estado = $record->estado;
            }

            if ($key === 'attendance-records') {
                $clone->user_id = $record->user_id;
                $clone->attendance_method_id = $record->attendance_method_id;
                $clone->timestamp = $record->timestamp;
                $clone->ip_address = $record->ip_address;
                $clone->qr_token = $record->qr_token;
                $clone->latitude = $record->latitude;
                $clone->longitude = $record->longitude;
                $clone->status = $record->status;
                $clone->notas = $record->notas;
                $clone->estado = $record->estado;
            }

            if ($key === 'holidays') {
                $clone->fecha = $record->fecha;
                $clone->nombre = "{$record->nombre} (Copia)";
                $clone->descripcion = $record->descripcion ? "{$record->descripcion} (Copia)" : null;
                $clone->recurrente = $record->recurrente;
                $clone->estado = $record->estado;
            }

            if ($key === 'shifts') {
                $clone->nombre = "{$record->nombre} (Copia)";
                $clone->hora_inicio = $record->hora_inicio;
                $clone->hora_fin = $record->hora_fin;
                $clone->creado_por = $record->creado_por;
                $clone->estado = $record->estado;
            }

            $clone->save();
            $newCount++;
        }

        if ($newCount > 0) {
            $singular = $this->traducirClave($key);
            if ($newCount === 1) {
                $successMessage = "{$singular} duplicado correctamente.";
            } else {
                $plural = $this->getPluralTraduccion($singular);
                $successMessage = "{$newCount} {$plural} duplicados correctamente.";
            }
            return redirect()->back()->with('success', $successMessage);
        }

        return redirect()->back()
            ->with('error', 'No se duplicó ningún registro.');
    }

    public function export(Request $request)
    {
        $page = $request->route()->getName();
        $key = str_replace('.export', '', $page);

        if (!isset($this->modelMap[$key])) {
            abort(404);
        }

        $model = $this->modelMap[$key];
        $ids = $request->input('ids', []);
        $query = $model::query();

        if (!empty($ids)) {
            $query->whereIn('id', $ids);
        }

        $data = $query->get();

        $fieldsSchema = $this->getFieldsSchema($key);
        $columns = collect($fieldsSchema)->pluck('name')->toArray();
        $headings = collect($fieldsSchema)->pluck('label')->toArray();

        array_unshift($columns, 'id');
        array_unshift($headings, 'ID');
        $columns[] = 'created_at';
        $headings[] = 'Fecha de Creación';

        $exportData = $data->map(function ($item) use ($columns) {
            return collect($columns)->map(function ($col) use ($item) {
                return $item[$col];
            });
        });

        return Excel::download(
            new GenericExport($exportData, $headings),
            "{$key}_" . now()->format('Y-m-d_H-i-s') . ".xlsx"
        );
    }
}
