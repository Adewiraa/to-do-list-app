<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::created(function ($task) {
            TaskActivity::create([
                'task_id' => $task->id,
                'user_id' => $task->user_id,
                'action' => 'created',
                'new_value' => json_encode($task->only(['title', 'status', 'priority', 'due_date', 'category_id'])),
            ]);
        });

        static::updating(function ($task) {
            if ($task->isDirty('status')) {
                if ($task->status === 'done') {
                    $task->completed_at = now();
                } else {
                    $task->completed_at = null;
                }
            }
        });

        static::updated(function ($task) {
            $changes = [];
            $original = [];
            foreach ($task->getChanges() as $key => $value) {
                if ($key === 'updated_at' || $key === 'completed_at') {
                    continue;
                }
                $changes[$key] = $value;
                $original[$key] = $task->getOriginal($key);
            }

            if (!empty($changes)) {
                $action = 'updated';
                if (array_key_exists('status', $changes)) {
                    $action = $changes['status'] === 'done' ? 'completed' : 'status_changed';
                }

                TaskActivity::create([
                    'task_id' => $task->id,
                    'user_id' => $task->user_id,
                    'action' => $action,
                    'old_value' => json_encode($original),
                    'new_value' => json_encode($changes),
                ]);
            }
        });

        static::deleted(function ($task) {
            TaskActivity::create([
                'task_id' => $task->id,
                'user_id' => $task->user_id,
                'action' => 'deleted',
            ]);
        });
    }

    /**
     * Get the user that owns the task.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category that the task belongs to.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the activities log for the task.
     */
    public function activities()
    {
        return $this->hasMany(TaskActivity::class);
    }
}
