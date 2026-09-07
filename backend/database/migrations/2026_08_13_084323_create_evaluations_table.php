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
            |
            | The employee who owns this evaluation.
            |
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
            | Dynamic Workflow:
            |
            | Employee submits
            |        ↓
            | submitted
            |        ↓
            | Employee / Manager / HR / Management
            | (based on employee.manager_id)
            |
            | If first reviewer is Employee:
            |        submitted
            |           ↓
            |     employee_approved
            |           ↓
            |          HR
            |           ↓
            |      hr_approved
            |           ↓
            |      Management
            |           ↓
            |       completed
            |
            | If first reviewer is Manager:
            |        submitted
            |           ↓
            |     manager_approved
            |           ↓
            |          HR
            |           ↓
            |      hr_approved
            |           ↓
            |      Management
            |           ↓
            |       completed
            |
            | If first reviewer is HR:
            |        submitted
            |           ↓
            |       hr_approved
            |           ↓
            |      Management
            |           ↓
            |       completed
            |
            | If first reviewer is Management:
            |        submitted
            |           ↓
            |       completed
            |
            |--------------------------------------------------------------------------
            | Rejection Workflow
            |--------------------------------------------------------------------------
            |
            | employee_rejected
            | manager_rejected
            | hr_rejected
            | management_rejected
            |        ↓
            | Employee edits evaluation
            |        ↓
            | Employee resubmits
            |        ↓
            | submitted
            |
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'draft',
                'submitted',

                'employee_approved',
                'employee_rejected',

                'manager_approved',
                'manager_rejected',

                'hr_approved',
                'hr_rejected',

                'management_rejected',

                'completed',
            ])->default('draft');


            /*
            |--------------------------------------------------------------------------
            | Employee Overall Rating
            |--------------------------------------------------------------------------
            |
            | Rating given by the employee for their own evaluation.
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
            | Direct Employee Reviewer Overall Rating
            |--------------------------------------------------------------------------
            |
            | Used when the employee's Reporting To user has role:
            |
            | Employee
            |
            */

            $table->decimal(
                'employee_overall_rating',
                4,
                2
            )->nullable();


            /*
            |--------------------------------------------------------------------------
            | Manager Overall Rating
            |--------------------------------------------------------------------------
            |
            | Used when the employee's Reporting To user has role:
            |
            | Manager
            |
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
            | Direct Employee Reviewer Timestamps
            |--------------------------------------------------------------------------
            |
            | Used when Reporting To user has role Employee.
            |
            */

            $table->timestamp('employee_reviewed_at')
                ->nullable();

            $table->timestamp('employee_approved_at')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | Manager Review Timestamps
            |--------------------------------------------------------------------------
            |
            | Used when Reporting To user has role Manager.
            |
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
            |
            | This is set when Management approves the evaluation.
            |
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
                    'evaluation_period_id',
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
