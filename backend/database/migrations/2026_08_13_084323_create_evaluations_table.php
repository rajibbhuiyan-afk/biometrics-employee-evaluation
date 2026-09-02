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


            /*
            |--------------------------------------------------------------------------
            | Employee
            |--------------------------------------------------------------------------
            */

            $table->foreignId('employee_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();


            /*
            |--------------------------------------------------------------------------
            | Evaluation Period
            |--------------------------------------------------------------------------
            */

            $table->foreignId('evaluation_period_id')
                ->constrained('evaluation_periods')
                ->cascadeOnUpdate()
                ->restrictOnDelete();


            /*
            |--------------------------------------------------------------------------
            | Evaluation Status
            |--------------------------------------------------------------------------
            |
            | Workflow:
            |
            | draft
            |   ↓
            | submitted
            |   ↓
            | manager_approved / manager_returned / manager_rejected
            |   ↓
            | hr_approved / hr_returned / hr_rejected
            |   ↓
            | management_approved / management_returned / management_rejected
            |   ↓
            | completed
            |
            */

            $table->enum('status', [
                'draft',
                'submitted',

                'manager_approved',
                'manager_returned',
                'manager_rejected',

                'hr_approved',
                'hr_returned',
                'hr_rejected',

                'management_approved',
                'management_returned',
                'management_rejected',

                'completed',
            ])->default('draft');


            /*
            |--------------------------------------------------------------------------
            | Overall Rating
            |--------------------------------------------------------------------------
            |
            | Employee's overall rating.
            | Scale: 0 - 10
            |
            */

            $table->decimal(
                'overall_rating',
                4,
                2
            )->nullable();


            /*
            |--------------------------------------------------------------------------
            | Manager Overall Rating
            |--------------------------------------------------------------------------
            */

            $table->decimal(
                'manager_overall_rating',
                4,
                2
            )->nullable();


            /*
            |--------------------------------------------------------------------------
            | HR Overall Rating
            |--------------------------------------------------------------------------
            */

            $table->decimal(
                'hr_overall_rating',
                4,
                2
            )->nullable();


            /*
            |--------------------------------------------------------------------------
            | Management Overall Rating
            |--------------------------------------------------------------------------
            */

            $table->decimal(
                'management_overall_rating',
                4,
                2
            )->nullable();


            /*
            |--------------------------------------------------------------------------
            | Employee Comment
            |--------------------------------------------------------------------------
            */

            $table->text('employee_comment')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | Employee Submission
            |--------------------------------------------------------------------------
            */

            $table->timestamp('submitted_at')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | Manager Review Timestamps
            |--------------------------------------------------------------------------
            */

            $table->timestamp('manager_reviewed_at')
                ->nullable();

            $table->timestamp('manager_approved_at')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | HR Review Timestamps
            |--------------------------------------------------------------------------
            */

            $table->timestamp('hr_reviewed_at')
                ->nullable();

            $table->timestamp('hr_approved_at')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | Management Review Timestamps
            |--------------------------------------------------------------------------
            */

            $table->timestamp('management_reviewed_at')
                ->nullable();

            $table->timestamp('management_approved_at')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | Final Approval
            |--------------------------------------------------------------------------
            */

            $table->timestamp('approved_at')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | Created / Updated
            |--------------------------------------------------------------------------
            */

            $table->timestamps();


            /*
            |--------------------------------------------------------------------------
            | One Evaluation Per Employee Per Period
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'employee_id',
                    'evaluation_period_id'
                ],
                'unique_employee_evaluation_period'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};