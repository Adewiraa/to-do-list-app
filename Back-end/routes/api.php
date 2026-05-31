<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->middleware('throttle:api')->group(function () {

    // Public Auth routes (strict throttle: 5 requests per minute)
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    // Protected routes (Sanctum SPA/Token)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth profile & logout
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Categories CRUD
        Route::apiResource('categories', CategoryController::class);

        // Tasks CRUD & custom endpoints
        Route::patch('tasks/{task}/status', [TaskController::class, 'patchStatus']);
        Route::post('tasks/{id}/restore', [TaskController::class, 'restore']);
        Route::apiResource('tasks', TaskController::class);

        // Dashboard statistics
        Route::get('dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('dashboard/tasks/today', [DashboardController::class, 'tasksToday']);
        Route::get('dashboard/tasks/overdue', [DashboardController::class, 'tasksOverdue']);
    });

});
