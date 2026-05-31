<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TaskResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get the analytics summary for the user's dashboard.
     * Field names are aligned with the frontend DashboardSummary interface.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Task Counts
        $total = $user->tasks()->count();
        $done = $user->tasks()->where('status', 'done')->count();
        $pending = $user->tasks()->where('status', 'pending')->count();
        $inProgress = $user->tasks()->where('status', 'in_progress')->count();
        $cancelled = $user->tasks()->where('status', 'cancelled')->count();

        $overdue = $user->tasks()
            ->where('due_date', '<', now())
            ->where('status', '!=', 'done')
            ->count();

        $today = $user->tasks()
            ->whereDate('due_date', today())
            ->count();

        // 2. Completion rate
        $completionRate = $total > 0 ? round(($done / $total) * 100, 1) : 0;

        // 3. Priority breakdown
        $priorityCounts = $user->tasks()
            ->selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        $priorityBreakdown = array_merge([
            'low' => 0,
            'medium' => 0,
            'high' => 0,
            'urgent' => 0,
        ], $priorityCounts);

        // 4. Status breakdown
        $byStatus = [
            'pending' => $pending,
            'in_progress' => $inProgress,
            'done' => $done,
            'cancelled' => $cancelled,
        ];

        // 5. Category breakdown
        $categories = $user->categories()
            ->withCount('tasks')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'color' => $cat->color,
                    'icon' => $cat->icon,
                    'tasks_count' => $cat->tasks_count,
                ];
            });

        $uncategorizedCount = $user->tasks()->whereNull('category_id')->count();

        // 6. Productivity Trend - last 7 days (tasks completed per day)
        $productivityTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $completedCount = $user->tasks()
                ->where('status', 'done')
                ->whereDate('completed_at', $date->toDateString())
                ->count();

            $productivityTrend[] = [
                'date' => $date->format('d/m'),
                'completed' => $completedCount,
            ];
        }

        return response()->json([
            'message' => 'Dashboard summary retrieved successfully',
            'data' => [
                // Matched exactly to frontend DashboardSummary interface in api.ts
                'total_active_tasks' => $total - $done - $cancelled,
                'total_completed_tasks' => $done,
                'total_overdue_tasks' => $overdue,
                'completion_rate' => $completionRate,
                'by_priority' => $priorityBreakdown,
                'by_status' => $byStatus,
                'productivity_trend' => $productivityTrend,
                'due_today' => $today,
                'category_breakdown' => $categories,
                'uncategorized_tasks_count' => $uncategorizedCount,
            ]
        ]);
    }

    /**
     * Get tasks that are due today.
     */
    public function tasksToday(Request $request): JsonResponse
    {
        $tasks = $request->user()->tasks()
            ->with('category')
            ->whereDate('due_date', today())
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json([
            'message' => "Today's tasks retrieved successfully",
            'data' => TaskResource::collection($tasks)
        ]);
    }

    /**
     * Get tasks that are overdue.
     */
    public function tasksOverdue(Request $request): JsonResponse
    {
        $tasks = $request->user()->tasks()
            ->with('category')
            ->where('due_date', '<', now())
            ->where('status', '!=', 'done')
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json([
            'message' => 'Overdue tasks retrieved successfully',
            'data' => TaskResource::collection($tasks)
        ]);
    }
}
