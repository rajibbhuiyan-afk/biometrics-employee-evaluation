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

            $table->foreignId('evaluation_id')
                ->constrained('evaluations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('reviewer_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->decimal('rating', 5, 2)->nullable();

            $table->text('comment')->nullable();

            $table->enum('action', [
                'reviewed',
                'approved',
                'rejected',
                'returned',
            ]);

            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_reviews');
    }
};