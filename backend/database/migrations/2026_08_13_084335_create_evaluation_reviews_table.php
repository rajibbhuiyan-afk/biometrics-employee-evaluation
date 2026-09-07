<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_reviews', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Evaluation
            |--------------------------------------------------------------------------
            */

            $table->foreignId('evaluation_id')
                ->constrained('evaluations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();


            /*
            |--------------------------------------------------------------------------
            | Question
            |--------------------------------------------------------------------------
            |
            | question_id = specific question review
            | null        = overall/stage review
            |
            */

            $table->foreignId('question_id')
                ->nullable()
                ->constrained('evaluation_questions')
                ->cascadeOnUpdate()
                ->restrictOnDelete();


            /*
            |--------------------------------------------------------------------------
            | Reviewer
            |--------------------------------------------------------------------------
            */

            $table->foreignId('reviewer_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();


            /*
            |--------------------------------------------------------------------------
            | Reviewer Role
            |--------------------------------------------------------------------------
            |
            | Workflow:
            | Manager → HR → Management
            |
            */

            $table->enum('reviewer_role', [
                'Manager',
                'HR',
                'Management',
            ]);


            /*
            |--------------------------------------------------------------------------
            | Question Review Result
            |--------------------------------------------------------------------------
            |
            | okay     = Accept
            | not_okay = Reject
            | ignore   = Ignore
            |
            | nullable because stage-level review has question_id = NULL
            |
            */

            $table->enum('review_result', [
                'okay',
                'not_okay',
                'ignore',
            ])->nullable();


            /*
            |--------------------------------------------------------------------------
            | Rating
            |--------------------------------------------------------------------------
            |
            | Rating is required only for "okay" at validation level.
            | Database column must be nullable because:
            |
            | not_okay → rating = NULL
            | ignore   → rating = NULL
            | stage review → rating can be overall rating
            |
            */

            $table->decimal('rating', 4, 2)
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | Comment / Reason
            |--------------------------------------------------------------------------
            |
            | not_okay → comment required at validation level
            | okay      → comment optional
            | ignore    → comment NULL
            |
            */

            $table->text('comment')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | Overall Review Action
            |--------------------------------------------------------------------------
            |
            | Used mainly for stage-level review
            | where question_id is NULL.
            |
            */

            $table->enum('action', [
                'approved',
                'rejected',
                'returned',
            ])->nullable();


            /*
            |--------------------------------------------------------------------------
            | Review Date
            |--------------------------------------------------------------------------
            */

            $table->timestamp('reviewed_at')
                ->nullable();


            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_reviews');
    }
};