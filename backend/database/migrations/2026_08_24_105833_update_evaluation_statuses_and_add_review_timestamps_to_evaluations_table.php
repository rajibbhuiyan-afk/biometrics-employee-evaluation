<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | STEP 1
        | Add temporary support for both old and new statuses
        |--------------------------------------------------------------------------
        */

        DB::statement("
            ALTER TABLE evaluations
            MODIFY status ENUM(
                'draft',
                'submitted',
                'under_review',
                'reviewed',
                'approved',
                'rejected',
                'returned',

                'manager_approved',
                'manager_rejected',
                'manager_returned',

                'admin_approved',
                'admin_rejected',
                'admin_returned'
            )
            NOT NULL DEFAULT 'draft'
        ");


        /*
        |--------------------------------------------------------------------------
        | STEP 2
        | Convert old statuses to the new workflow
        |--------------------------------------------------------------------------
        */

        // Old "under_review" / "reviewed"
        // means manager is reviewing the submitted evaluation.
        DB::table('evaluations')
            ->whereIn('status', [
                'under_review',
                'reviewed',
            ])
            ->update([
                'status' => 'submitted',
            ]);


        /*
        |--------------------------------------------------------------------------
        | Old "approved"
        |--------------------------------------------------------------------------
        |
        | Existing approved evaluations are assumed to have already
        | passed the manager review stage.
        |
        | Since we cannot know whether the old approval was by Manager
        | or Admin, we keep them as admin_approved.
        |
        */

        DB::table('evaluations')
            ->where('status', 'approved')
            ->update([
                'status' => 'admin_approved',
            ]);


        /*
        |--------------------------------------------------------------------------
        | Old rejected / returned
        |--------------------------------------------------------------------------
        |
        | These were previously generic statuses.
        | We map them to manager-level results because the old system
        | did not distinguish Manager vs Admin.
        |
        */

        DB::table('evaluations')
            ->where('status', 'rejected')
            ->update([
                'status' => 'manager_rejected',
            ]);

        DB::table('evaluations')
            ->where('status', 'returned')
            ->update([
                'status' => 'manager_returned',
            ]);


        /*
        |--------------------------------------------------------------------------
        | STEP 3
        | Change status column to the new workflow
        |--------------------------------------------------------------------------
        */

        DB::statement("
            ALTER TABLE evaluations
            MODIFY status ENUM(
                'draft',
                'submitted',

                'manager_approved',
                'manager_rejected',
                'manager_returned',

                'admin_approved',
                'admin_rejected',
                'admin_returned'
            )
            NOT NULL DEFAULT 'draft'
        ");


        /*
        |--------------------------------------------------------------------------
        | STEP 4
        | Add Manager/Admin review timestamps
        |--------------------------------------------------------------------------
        */

        Schema::table('evaluations', function (Blueprint $table) {

            $table->timestamp('manager_reviewed_at')
                ->nullable()
                ->after('reviewed_at');

            $table->timestamp('manager_approved_at')
                ->nullable()
                ->after('manager_reviewed_at');

            $table->timestamp('admin_reviewed_at')
                ->nullable()
                ->after('manager_approved_at');

            $table->timestamp('admin_approved_at')
                ->nullable()
                ->after('admin_reviewed_at');
        });
    }


    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Remove new timestamp columns
        |--------------------------------------------------------------------------
        */

        Schema::table('evaluations', function (Blueprint $table) {

            $table->dropColumn([
                'manager_reviewed_at',
                'manager_approved_at',
                'admin_reviewed_at',
                'admin_approved_at',
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Restore old status values
        |--------------------------------------------------------------------------
        */

        DB::statement("
            ALTER TABLE evaluations
            MODIFY status ENUM(
                'draft',
                'submitted',
                'under_review',
                'reviewed',
                'approved',
                'rejected',
                'returned'
            )
            NOT NULL DEFAULT 'draft'
        ");


        /*
        |--------------------------------------------------------------------------
        | Convert new statuses back to old statuses
        |--------------------------------------------------------------------------
        */

        DB::table('evaluations')
            ->whereIn('status', [
                'manager_approved',
                'admin_approved',
            ])
            ->update([
                'status' => 'approved',
            ]);

        DB::table('evaluations')
            ->whereIn('status', [
                'manager_rejected',
                'admin_rejected',
            ])
            ->update([
                'status' => 'rejected',
            ]);

        DB::table('evaluations')
            ->whereIn('status', [
                'manager_returned',
                'admin_returned',
            ])
            ->update([
                'status' => 'returned',
            ]);
    }
};