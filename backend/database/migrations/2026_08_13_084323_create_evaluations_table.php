<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('evaluation_period_id')
                ->constrained('evaluation_periods')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->enum('status', [
                'draft',
                'submitted',
                'under_review',
                'reviewed',
                'approved',
                'rejected',
            ])->default('draft');

            $table->decimal('overall_rating', 5, 2)->nullable();

            $table->text('employee_comment')->nullable();

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();

            // One employee should have only one evaluation
            // for a particular evaluation period.
            $table->unique(
                ['employee_id', 'evaluation_period_id'],
                'unique_employee_evaluation_period'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};