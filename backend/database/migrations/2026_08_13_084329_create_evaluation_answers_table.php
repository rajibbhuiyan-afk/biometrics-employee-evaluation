<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_answers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('evaluation_id')
                ->constrained('evaluations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('question_id')
                ->constrained('evaluation_questions')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->integer('rating')->nullable();

            $table->text('answer')->nullable();

            $table->text('comment')->nullable();

            $table->timestamps();

            // One question can have only one answer
            // within a particular evaluation.
            $table->unique(
                ['evaluation_id', 'question_id'],
                'unique_evaluation_question'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_answers');
    }
};