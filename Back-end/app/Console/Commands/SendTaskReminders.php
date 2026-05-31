<?php

namespace App\Console\Commands;

use App\Models\Task;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

#[Signature('app:send-task-reminders')]
#[Description('Scan database and send email/notification reminders for tasks due soon or overdue.')]
class SendTaskReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting task reminder scan...');
        Log::info('Task reminder scan started.');

        // 1. Scan for Tasks approaching due date in next 24 hours
        $approachingTasks = Task::with('user')
            ->where('status', '!=', 'done')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('due_date', [now(), now()->addHours(24)])
            ->get();

        $this->info("Found {$approachingTasks->count()} tasks due within the next 24 hours.");

        foreach ($approachingTasks as $task) {
            $user = $task->user;
            $message = "REMINDER: Task '{$task->title}' is due soon at {$task->due_date}!";
            
            // Simulating email dispatch
            $this->line(" -> Simulating EMAIL sent to {$user->email}: [{$message}]");
            Log::info("Sent approaching reminder for task ID {$task->id} to {$user->email}.");
        }

        // 2. Scan for Overdue Tasks
        $overdueTasks = Task::with('user')
            ->where('status', '!=', 'done')
            ->where('status', '!=', 'cancelled')
            ->where('due_date', '<', now())
            ->get();

        $this->info("Found {$overdueTasks->count()} overdue tasks.");

        foreach ($overdueTasks as $task) {
            $user = $task->user;
            $message = "WARNING: Task '{$task->title}' is OVERDUE (Due date: {$task->due_date})!";
            
            // Simulating email dispatch
            $this->error(" -> Simulating EMAIL sent to {$user->email}: [{$message}]");
            Log::warning("Sent overdue warning for task ID {$task->id} to {$user->email}.");
        }

        $this->info('Task reminder scan complete.');
        Log::info('Task reminder scan completed successfully.');

        return Command::SUCCESS;
    }
}
