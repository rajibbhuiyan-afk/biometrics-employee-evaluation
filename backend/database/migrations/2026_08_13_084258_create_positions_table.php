<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->string('title', 100);
            $table->string('code', 30)->unique();

            $table->foreignId('department_id')
                ->constrained('departments')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};