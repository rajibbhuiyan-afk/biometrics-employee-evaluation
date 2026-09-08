<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_questions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('category_id')
                ->constrained('evaluation_categories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('position_id')
                ->nullable()
                ->constrained('positions')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->text('question');

            $table->enum('question_type', [
                'rating',
                'text',
                'yes_no',
            ])->default('rating');

            $table->integer('max_rating')
                ->default(5);

            $table->unsignedInteger('max_answer_words')
                ->default(30);

            $table->decimal('weight', 5, 2)
                ->default(1.00);

            $table->boolean('is_required')
                ->default(true);

            $table->integer('sort_order')
                ->default(0);

            $table->boolean('status')
                ->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_questions');
    }
};
