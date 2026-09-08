<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_workflow_steps', function (Blueprint $table) {

            $table->id();

            $table->foreignId('evaluation_id')
                ->constrained('evaluations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->unsignedInteger('step_order');

            $table->foreignId('reviewer_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('reviewer_role', 50);

            $table->enum('status', [
                'pending',
                'current',
                'approved',
                'rejected',
            ])->default('pending');

            $table->timestamp('started_at')
                ->nullable();

            $table->timestamp('completed_at')
                ->nullable();

            $table->timestamps();

            $table->unique([
                'evaluation_id',
                'step_order',
            ]);

            $table->index([
                'evaluation_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'evaluation_workflow_steps'
        );
    }
};