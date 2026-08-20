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

    Route::get(
        '/evaluation-periods/active',
        [EvaluationPeriodController::class, 'active']
    );

     // Evaluation Questions
        Route::apiResource(
            'evaluation-questions',
            EvaluationQuestionController::class
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
    // EVALUATIONS
    // ======================================

    // Employee can create evaluations
    Route::middleware('role:Employee')->group(function () {

       Route::post(
            '/evaluations',
            [EvaluationController::class, 'store']
        );

        Route::post(
            '/evaluations/{evaluation}/submit',
            [EvaluationController::class, 'submit']
        );

    });


    // Authenticated users can view evaluations
    Route::get(
        '/evaluations',
        [EvaluationController::class, 'index']
    );

    Route::get(
        '/evaluations/{evaluation}',
        [EvaluationController::class, 'show']
    );


    // ======================================
    // EVALUATION ANSWERS
    // ======================================

    // Employee can create/update answers
    Route::middleware('role:Employee')->group(function () {

        Route::post(
            '/evaluation-answers',
            [EvaluationAnswerController::class, 'store']
        );

        Route::put(
            '/evaluation-answers/{evaluationAnswer}',
            [EvaluationAnswerController::class, 'update']
        );
        Route::post(
            '/evaluations/{evaluation}/submit',
            [EvaluationController::class, 'submit']
        );

    });


    // Authenticated users can view answers
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

    // Manager + HR can review evaluations
    Route::middleware('role:Manager,HR')->group(function () {

        Route::get(
            '/evaluation-reviews',
            [EvaluationReviewController::class, 'index']
        );

        Route::get(
            '/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'show']
        );

        Route::post(
            '/evaluation-reviews',
            [EvaluationReviewController::class, 'store']
        );

        Route::put(
            '/evaluation-reviews/{evaluationReview}',
            [EvaluationReviewController::class, 'update']
        );

    });

});