<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_profiles', function (Blueprint $table) {

            $table->id();

            // User relationship
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            // =====================================================
            // Personal Information
            // =====================================================

            $table->string('profile_photo')->nullable();

            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();

            $table->date('date_of_birth')->nullable();

            $table->string('gender')->nullable();

            $table->string('blood_group')->nullable();

            $table->string('nationality')->nullable();

            $table->string('religion')->nullable();

            $table->string('marital_status')->nullable();

            $table->string('nid')->nullable();

            $table->string('passport_number')->nullable();

            $table->string('driving_license_number')->nullable();

            // =====================================================
            // Contact Information
            // =====================================================

            $table->string('personal_email')->nullable();

            $table->string('mobile_number')->nullable();

            $table->string('emergency_contact_number')->nullable();

            $table->string('emergency_contact_person')->nullable();

            $table->string('emergency_contact_relationship')->nullable();

            $table->text('present_address')->nullable();

            $table->text('permanent_address')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};