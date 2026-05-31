<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreTaskRequest;
use App\Http\Requests\Api\V1\UpdateTaskRequest;
use App\Http\Resources\Api\V1\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource with searching, filtering, and sorting.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tasks()->with('category');

        // 1. Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        // 2. Filters
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->has('category_id')) {
            $catId = $request->input('category_id');
            if ($catId === 'null' || $catId === '') {
                $query->whereNull('category_id');
            } else {
                $query->where('category_id', $catId);
            }
        }

        if ($request->filled('due')) {
            $dueFilter = $request->input('due');
            if ($dueFilter === 'today') {
                $query->whereDate('due_date', today());
            } elseif ($dueFilter === 'overdue') {
                $query->where('due_date', '<', now())
                    ->where('status', '!=', 'done');
            }
        }

        // 3. Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        $allowedSorts = ['created_at', 'due_date', 'priority', 'title'];
        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'priority') {
                // Sort by priority rank: urgent -> high -> medium -> low
                $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low') " . ($sortOrder === 'asc' ? 'DESC' : 'ASC'));
            } else {
                $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // 4. Pagination
        $perPage = $request->integer('per_page', 15);
        $tasks = $query->paginate($perPage);

        return response()->json([
            'message' => 'Tasks retrieved successfully',
            'data' => TaskResource::collection($tasks)->response()->getData(true)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $task = $request->user()->tasks()->create($validated);

        return response()->json([
            'message' => 'Task created successfully',
            'data' => new TaskResource($task->load('category'))
        ], 201);
    }

    /**
     * Display the specified resource with full activity history.
     */
    public function show(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        // Load category and historical activities log
        $task->load(['category', 'activities' => function($q) {
            $q->orderBy('created_at', 'desc');
        }]);

        return response()->json([
            'message' => 'Task details retrieved successfully',
            'data' => new TaskResource($task)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $validated = $request->validated();
        $task->update($validated);

        return response()->json([
            'message' => 'Task updated successfully',
            'data' => new TaskResource($task->load('category'))
        ]);
    }

    /**
     * Custom lightweight endpoint to fast patch a task's status.
     */
    public function patchStatus(Request $request, Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $request->validate([
            'status' => ['required', 'string', 'in:pending,in_progress,done,cancelled'],
        ]);

        $task->update([
            'status' => $request->input('status')
        ]);

        return response()->json([
            'message' => "Task status updated to '{$task->status}' successfully",
            'data' => new TaskResource($task->load('category'))
        ]);
    }

    /**
     * Remove the specified resource from storage (Soft Delete).
     */
    public function destroy(Task $task): JsonResponse
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully (moved to trash)'
        ]);
    }

    /**
     * Restore a soft-deleted task.
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        // Find soft-deleted task
        $task = Task::onlyTrashed()->where('user_id', $request->user()->id)->findOrFail($id);
        
        $task->restore();

        return response()->json([
            'message' => 'Task restored successfully',
            'data' => new TaskResource($task->load('category'))
        ]);
    }
}
