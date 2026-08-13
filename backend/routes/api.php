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
// PROTECTED ROUTES
// ==========================================

Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);


    // Roles
    Route::apiResource('roles', RoleController::class);


    // Departments
    Route::apiResource('departments', DepartmentController::class);


    // Positions
    Route::apiResource('positions', PositionController::class);


    // Users
    Route::apiResource('users', UserController::class);


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


    // Evaluation Questions
    Route::apiResource(
        'evaluation-questions',
        EvaluationQuestionController::class
    );


    // Evaluations
    Route::apiResource(
        'evaluations',
        EvaluationController::class
    );


    // Evaluation Answers
    Route::apiResource(
        'evaluation-answers',
        EvaluationAnswerController::class
    );


    // Evaluation Reviews
    Route::apiResource(
        'evaluation-reviews',
        EvaluationReviewController::class
    );

});