<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('probation_periods', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->date('start_date');
            $table->date('end_date');

            $table->enum('status', [
                'active',
                'completed',
                'extended',
                'terminated',
            ])->default('active');

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('probation_periods');
    }
};