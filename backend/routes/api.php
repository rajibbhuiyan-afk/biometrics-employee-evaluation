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
use App\Http\Controllers\EmployeeProfileController;
use App\Http\Controllers\EmployeeEducationController;


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
    // MY PROFILE
    // ======================================================================

    Route::get('/profile', [
        EmployeeProfileController::class,
        'show'
    ]);

    Route::put('/profile', [
        EmployeeProfileController::class,
        'update'
    ]);

    Route::patch('/profile', [
        EmployeeProfileController::class,
        'update'
    ]);


    // ======================================================================
    // MY EDUCATION
    // ======================================================================

    Route::get('/profile/educations', [
        EmployeeEducationController::class,
        'index'
    ]);

    Route::post('/profile/educations', [
        EmployeeEducationController::class,
        'store'
    ]);

    Route::get('/profile/educations/{education}', [
        EmployeeEducationController::class,
        'show'
    ]);

    Route::put('/profile/educations/{education}', [
        EmployeeEducationController::class,
        'update'
    ]);

    Route::patch('/profile/educations/{education}', [
        EmployeeEducationController::class,
        'update'
    ]);

    Route::delete('/profile/educations/{education}', [
        EmployeeEducationController::class,
        'destroy'
    ]);


    // ======================================================================
    // VIEW ANOTHER EMPLOYEE PROFILE
    // ======================================================================

    Route::middleware('role:HR,Manager,Admin')->group(function () {

        Route::get(
            '/employees/{user}/profile',
            [EmployeeProfileController::class, 'showEmployee']
        );

    });


    // ======================================================================
    // CHANGE PASSWORD
    // ======================================================================

    Route::post('/change-password', [
        UserController::class,
        'changePassword'
    ]);


    // ======================================================================
    // ACTIVE EVALUATION PERIOD
    // ======================================================================

    Route::get(
        '/evaluation-periods/active',
        [EvaluationPeriodController::class, 'active']
    );


    // ======================================================================
    // ADMIN ONLY
    // ======================================================================

    Route::middleware('role:Admin')->group(function () {

        // Admin Dashboard
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


        // --------------------------------------------------------------
        // Create / Save Answer
        // --------------------------------------------------------------

        Route::post(
            '/evaluation-answers',
            [EvaluationAnswerController::class, 'store']
        );


        // --------------------------------------------------------------
        // Update Answer
        // --------------------------------------------------------------

        Route::put(
            '/evaluation-answers/{evaluationAnswer}',
            [EvaluationAnswerController::class, 'update']
        );

    });


    // ======================================================================
    // EVALUATIONS - VIEW
    // ======================================================================
    //
    // Controller handles:
    // Employee ownership
    // Manager assignment
    // HR access
    // Management access
    // Admin access
    //
    // ======================================================================

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
    // EVALUATION REVIEWS
    // ======================================================================
    //
    // Workflow:
    //
    // Employee
    //     ↓
    // Manager
    //     ↓
    // HR
    //     ↓
    // Management
    //     ↓
    // Completed
    //
    // Admin is NOT a reviewer.
    //
    // Controller handles stage-specific authorization.
    //
    // ======================================================================

    Route::middleware('role:Manager,HR,Management')->group(function () {

        // --------------------------------------------------------------
        // Review History
        // --------------------------------------------------------------

        Route::get(
            '/evaluation-reviews',
            [EvaluationReviewController::class, 'index']
        );


        // --------------------------------------------------------------
        // Single Review
        // --------------------------------------------------------------

        Route::get(
            '/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'show']
        );


        // --------------------------------------------------------------
        // Create Review
        // --------------------------------------------------------------

        Route::post(
            '/evaluation-reviews',
            [EvaluationReviewController::class, 'store']
        );

    });

});