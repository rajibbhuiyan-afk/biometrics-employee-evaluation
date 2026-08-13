<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('employee_id', 50)->unique();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('google_id', 255)->nullable()->unique();
            $table->text('profile_photo')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('password');
            
            $table->foreignId('role_id')
                ->constrained('roles')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('department_id')
                ->constrained('departments')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('position_id')
                ->constrained('positions')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('manager_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->date('joining_date')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamp('last_login_at')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};