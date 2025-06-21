<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('fecha_cumpleanos')->nullable()->after('fecha_retiro');
            $table->string('imei_mac', 100)->nullable()->after('fecha_cumpleanos');
            $table->string('firma_digital')->nullable()->after('imei_mac');
            $table->string('dni', 20)->after('firma_digital');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['fecha_cumpleanos', 'imei_mac', 'firma_digital', 'dni']);
        });
    }
};
