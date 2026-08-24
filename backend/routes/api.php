<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EvaluationPeriodController;
use App\Http\Controllers\EvaluationCategoryController;
use App\Http\Controllers\EvaluationQuestionController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationAnswerController;
use App\Http\Controllers\EvaluationReviewController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\ProbationPeriodController;


// ==========================================================================
// PUBLIC ROUTES
// ==========================================================================

Route::post('/login', [
    AuthController::class,
    'login'
]);


// ==========================================================================
// AUTHENTICATED ROUTES
// ==========================================================================

Route::middleware('auth:sanctum')->group(function () {


    // ======================================================================
    // AUTHENTICATION
    // ======================================================================

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);

    Route::get('/me', [
        AuthController::class,
        'me'
    ]);


    // ======================================================================
    // CHANGE PASSWORD
    // All authenticated users
    // ======================================================================

    Route::post('/change-password', [
        UserController::class,
        'changePassword'
    ]);


    // ======================================================================
    // ACTIVE EVALUATION PERIOD
    // All authenticated users
    // ======================================================================

    Route::get(
        '/evaluation-periods/active',
        [EvaluationPeriodController::class, 'active']
    );


    // ======================================================================
    // ADMIN ONLY
    // ======================================================================

    Route::middleware('role:Admin')->group(function () {

        // --------------------------------------------------------------
        // Admin Dashboard
        // --------------------------------------------------------------

        Route::get(
            '/admin/dashboard',
            [AdminDashboardController::class, 'index']
        );

    });


    // ======================================================================
    // ADMIN + HR
    // ======================================================================

    Route::middleware('role:Admin,HR')->group(function () {

        // --------------------------------------------------------------
        // Roles
        // --------------------------------------------------------------

        Route::apiResource(
            'roles',
            RoleController::class
        );


        // --------------------------------------------------------------
        // Users
        // --------------------------------------------------------------

        Route::get(
            '/users/managers',
            [UserController::class, 'managers']
        );

        Route::apiResource(
            'users',
            UserController::class
        );


        // --------------------------------------------------------------
        // Departments
        // --------------------------------------------------------------

        Route::apiResource(
            'departments',
            DepartmentController::class
        );


        // --------------------------------------------------------------
        // Positions
        // --------------------------------------------------------------

        Route::apiResource(
            'positions',
            PositionController::class
        );


        // --------------------------------------------------------------
        // Evaluation Periods
        // --------------------------------------------------------------

        Route::apiResource(
            'evaluation-periods',
            EvaluationPeriodController::class
        );


        // --------------------------------------------------------------
        // Evaluation Categories
        // --------------------------------------------------------------

        Route::apiResource(
            'evaluation-categories',
            EvaluationCategoryController::class
        );


        // --------------------------------------------------------------
        // Probation Periods
        // --------------------------------------------------------------

        Route::get(
            '/probation-periods/active',
            [ProbationPeriodController::class, 'active']
        );

        Route::apiResource(
            'probation-periods',
            ProbationPeriodController::class
        );

    });


    // ======================================================================
    // EVALUATION QUESTIONS
    // ======================================================================

    // ----------------------------------------------------------------------
    // View Questions
    // All authenticated users
    // ----------------------------------------------------------------------

    Route::get(
        '/evaluation-questions',
        [EvaluationQuestionController::class, 'index']
    );

    Route::get(
        '/evaluation-questions/{evaluationQuestion}',
        [EvaluationQuestionController::class, 'show']
    );


    // ----------------------------------------------------------------------
    // Manage Questions
    // Admin + HR
    // ----------------------------------------------------------------------

    Route::middleware('role:Admin,HR')->group(function () {

        Route::post(
            '/evaluation-questions',
            [EvaluationQuestionController::class, 'store']
        );

        Route::put(
            '/evaluation-questions/{evaluationQuestion}',
            [EvaluationQuestionController::class, 'update']
        );

        Route::patch(
            '/evaluation-questions/{evaluationQuestion}',
            [EvaluationQuestionController::class, 'update']
        );

        Route::delete(
            '/evaluation-questions/{evaluationQuestion}',
            [EvaluationQuestionController::class, 'destroy']
        );

    });


    // ======================================================================
    // EMPLOYEE EVALUATIONS
    // ======================================================================

    Route::middleware('role:Employee')->group(function () {

        // --------------------------------------------------------------
        // Create Evaluation
        // --------------------------------------------------------------

        Route::post(
            '/evaluations',
            [EvaluationController::class, 'store']
        );


        // --------------------------------------------------------------
        // Update Evaluation
        // Draft / Returned / Rejected
        // --------------------------------------------------------------

        Route::put(
            '/evaluations/{evaluation}',
            [EvaluationController::class, 'update']
        );


        // --------------------------------------------------------------
        // Submit / Resubmit Evaluation
        // --------------------------------------------------------------

        Route::post(
            '/evaluations/{evaluation}/submit',
            [EvaluationController::class, 'submit']
        );

    });


    // ======================================================================
    // EMPLOYEE ANSWERS
    // ======================================================================

    Route::middleware('role:Employee')->group(function () {

        // Create / Save Answer
        Route::post(
            '/evaluation-answers',
            [EvaluationAnswerController::class, 'store']
        );


        // Update Answer
        Route::put(
            '/evaluation-answers/{evaluationAnswer}',
            [EvaluationAnswerController::class, 'update']
        );

    });


    // ======================================================================
    // EVALUATIONS - VIEW
    // ======================================================================

    // All authenticated users
    // Controller handles ownership/access rules

    Route::get(
        '/evaluations',
        [EvaluationController::class, 'index']
    );

    Route::get(
        '/evaluations/{evaluation}',
        [EvaluationController::class, 'show']
    );


    // ======================================================================
    // EVALUATION ANSWERS - VIEW
    // ======================================================================

    Route::get(
        '/evaluation-answers',
        [EvaluationAnswerController::class, 'index']
    );

    Route::get(
        '/evaluation-answers/{evaluationAnswer}',
        [EvaluationAnswerController::class, 'show']
    );


    // ======================================================================
    // MANAGER REVIEW
    // ======================================================================

    /*
    |--------------------------------------------------------------------------
    | Manager can:
    |
    | submitted -> reviewed
    | submitted -> returned
    | submitted -> rejected
    |
    | Manager CANNOT give final approval.
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:Manager')->group(function () {

        Route::get(
            '/manager/evaluation-reviews',
            [EvaluationReviewController::class, 'index']
        );

        Route::get(
            '/manager/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'show']
        );

        Route::post(
            '/manager/evaluation-reviews',
            [EvaluationReviewController::class, 'store']
        );

        Route::put(
            '/manager/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'update']
        );

        Route::delete(
            '/manager/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'destroy']
        );

    });


    // ======================================================================
    // ADMIN FINAL APPROVAL
    // ======================================================================

    /*
    |--------------------------------------------------------------------------
    | Admin can:
    |
    | reviewed -> approved
    | reviewed -> returned
    | reviewed -> rejected
    |
    | This is the FINAL approval stage.
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:Admin')->group(function () {

        Route::get(
            '/admin/evaluation-reviews',
            [EvaluationReviewController::class, 'index']
        );

        Route::get(
            '/admin/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'show']
        );

        Route::post(
            '/admin/evaluation-reviews',
            [EvaluationReviewController::class, 'store']
        );

        Route::put(
            '/admin/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'update']
        );

        Route::delete(
            '/admin/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'destroy']
        );

    });

    // ==========================================
    // EVALUATION REVIEWS
    // ==========================================

    Route::middleware('role:Manager,HR,Admin')->group(function () {

        // Review history
        Route::get(
            '/evaluation-reviews',
            [EvaluationReviewController::class, 'index']
        );

        // Single review
        Route::get(
            '/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'show']
        );

        // Create Manager/Admin review
        Route::post(
            '/evaluation-reviews',
            [EvaluationReviewController::class, 'store']
        );

        // Update review
        Route::put(
            '/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'update']
        );

        // Delete review
        Route::delete(
            '/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'destroy']
        );
    });

});