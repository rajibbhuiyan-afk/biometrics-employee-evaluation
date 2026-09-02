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
            | Admin is NOT a reviewer.
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
            */

            $table->enum('review_result', [
                'okay',
                'not_okay',
            ])->nullable();


            /*
            |--------------------------------------------------------------------------
            | Rating
            |--------------------------------------------------------------------------
            |
            | Rating scale: 0 - 10
            |
            */

            $table->decimal('rating', 4, 2)->nullable();


            /*
            |--------------------------------------------------------------------------
            | Comment / Reason
            |--------------------------------------------------------------------------
            |
            | For question review:
            | not_okay → comment/reason required
            |
            */

            $table->text('comment')->nullable();


            /*
            |--------------------------------------------------------------------------
            | Overall Review Action
            |--------------------------------------------------------------------------
            |
            | This is mainly used for the stage-level review
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

            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_reviews');
    }
};