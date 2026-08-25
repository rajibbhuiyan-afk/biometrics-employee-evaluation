<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_educations', function (Blueprint $table) {

            $table->id();

            // =====================================================
            // Employee
            // =====================================================

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // =====================================================
            // Education Information
            // =====================================================

            $table->string('degree');

            $table->string('institution_name');

            $table->string('subject')->nullable();

            $table->string('board_university')->nullable();

            $table->year('passing_year')->nullable();

            $table->string('result')->nullable();

            $table->string('certificate_number')->nullable();

            $table->text('achievement')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_educations');
    }
};