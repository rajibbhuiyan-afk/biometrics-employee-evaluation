<?php

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

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AdminDashboardController;


// ==========================================
// PUBLIC ROUTES
// ==========================================

Route::post('/login', [AuthController::class, 'login']);


// ==========================================
// AUTHENTICATED ROUTES
// ==========================================

Route::middleware('auth:sanctum')->group(function () {


    // ======================================
    // AUTHENTICATION
    // ======================================

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'me']);


    // ======================================
    // ACTIVE EVALUATION PERIOD
    // ======================================

    Route::get(
        '/evaluation-periods/active',
        [EvaluationPeriodController::class, 'active']
    );


    // ======================================
    // ADMIN ONLY
    // ======================================

    Route::middleware('role:Admin')->group(function () {

        // Roles
        Route::apiResource(
            'roles',
            RoleController::class
        );

        // Users
        Route::apiResource(
            'users',
            UserController::class
        );
         // Admin Dashboard
        Route::get(
            '/admin/dashboard',
            [AdminDashboardController::class, 'index']
        );
    });


    // ======================================
    // ADMIN + HR
    // ======================================

    Route::middleware('role:Admin,HR')->group(function () {

        // Departments
        Route::apiResource(
            'departments',
            DepartmentController::class
        );

        // Positions
        Route::apiResource(
            'positions',
            PositionController::class
        );

        // Evaluation Periods
        Route::apiResource(
            'evaluation-periods',
            EvaluationPeriodController::class
        );

        // Evaluation Categories
        Route::apiResource(
            'evaluation-categories',
            EvaluationCategoryController::class
        );
    });


    // ======================================
    // EVALUATION QUESTIONS
    // ======================================

    /*
    |--------------------------------------------------------------------------
    | VIEW QUESTIONS
    |--------------------------------------------------------------------------
    |
    | Employee যখন evaluation form খুলবে,
    | তখন questions দেখতে পারবে।
    |
    | তাই GET routes শুধু auth:sanctum-এর মধ্যে থাকবে।
    |
    */

    Route::get(
        '/evaluation-questions',
        [EvaluationQuestionController::class, 'index']
    );

    Route::get(
        '/evaluation-questions/{evaluationQuestion}',
        [EvaluationQuestionController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | MANAGE QUESTIONS
    |--------------------------------------------------------------------------
    |
    | Question create/update/delete শুধুমাত্র
    | Admin এবং HR করতে পারবে।
    |
    */

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


    // ======================================
    // EMPLOYEE EVALUATIONS
    // ======================================

    Route::middleware('role:Employee')->group(function () {

        // Create evaluation
        Route::post(
            '/evaluations',
            [EvaluationController::class, 'store']
        );

        // Update draft / returned / rejected evaluation
        Route::put(
            '/evaluations/{evaluation}',
            [EvaluationController::class, 'update']
        );

        // Submit / Resubmit evaluation
        Route::post(
            '/evaluations/{evaluation}/submit',
            [EvaluationController::class, 'submit']
        );
    });


    // ======================================
    // EMPLOYEE ANSWERS
    // ======================================

    Route::middleware('role:Employee')->group(function () {

        // Create / save answer
        Route::post(
            '/evaluation-answers',
            [EvaluationAnswerController::class, 'store']
        );

        // Update answer
        Route::put(
            '/evaluation-answers/{evaluationAnswer}',
            [EvaluationAnswerController::class, 'update']
        );
    });


    // ======================================
    // EVALUATIONS - VIEW
    // ======================================

    /*
    |--------------------------------------------------------------------------
    | All authenticated users can view evaluations.
    |--------------------------------------------------------------------------
    |
    | EvaluationController@index() এবং show() এর ভিতরে
    | প্রয়োজনীয় business/ownership logic থাকবে।
    |
    */

    Route::get(
        '/evaluations',
        [EvaluationController::class, 'index']
    );

    Route::get(
        '/evaluations/{evaluation}',
        [EvaluationController::class, 'show']
    );


    // ======================================
    // EVALUATION ANSWERS - VIEW
    // ======================================

    Route::get(
        '/evaluation-answers',
        [EvaluationAnswerController::class, 'index']
    );

    Route::get(
        '/evaluation-answers/{evaluationAnswer}',
        [EvaluationAnswerController::class, 'show']
    );


    // ======================================
    // EVALUATION REVIEWS
    // ======================================

    Route::middleware('role:Manager,HR')->group(function () {

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

        // Create review
        //
        // Actions:
        // reviewed
        // approved
        // rejected
        // returned
        //
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