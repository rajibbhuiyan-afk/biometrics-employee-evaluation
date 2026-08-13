<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_periods', function (Blueprint $table) {
            $table->id();

            $table->string('name', 100);

            $table->date('start_date');
            $table->date('end_date');

            $table->date('submission_start_date');
            $table->date('submission_end_date');

            $table->enum('status', [
                'draft',
                'active',
                'closed',
            ])->default('draft');

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_periods');
    }
};