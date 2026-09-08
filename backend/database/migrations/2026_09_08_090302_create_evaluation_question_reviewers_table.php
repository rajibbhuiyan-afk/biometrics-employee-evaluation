<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_question_reviewers', function (Blueprint $table) {

            $table->id();

            $table->foreignId('evaluation_question_id')
                ->constrained('evaluation_questions')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('role_id')
                ->constrained('roles')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(
                [
                    'evaluation_question_id',
                    'role_id',
                ],
                'eqr_question_role_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'evaluation_question_reviewers'
        );
    }
};
