<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a default Test User
        $user = User::create([
            'name' => 'Adewira',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        // 2. Create default categories
        $work = Category::create([
            'user_id' => $user->id,
            'name' => 'Work & Career',
            'color' => '#3b82f6', // Premium Blue
            'icon' => 'Briefcase',
        ]);

        $personal = Category::create([
            'user_id' => $user->id,
            'name' => 'Personal Life',
            'color' => '#10b981', // Emerald Green
            'icon' => 'User',
        ]);

        $shopping = Category::create([
            'user_id' => $user->id,
            'name' => 'Shopping List',
            'color' => '#f59e0b', // Amber Orange
            'icon' => 'ShoppingCart',
        ]);

        $health = Category::create([
            'user_id' => $user->id,
            'name' => 'Health & Fitness',
            'color' => '#ef4444', // Coral Red
            'icon' => 'Activity',
        ]);

        // 3. Create mock tasks (various status, priority, and due dates)
        
        // --- TODAY'S TASKS ---
        Task::create([
            'user_id' => $user->id,
            'category_id' => $work->id,
            'title' => 'Slicing To Do List Landing Page',
            'description' => 'Complete UI design conversion for landing page, make sure all responsive queries match the layouts.',
            'status' => 'in_progress',
            'priority' => 'high',
            'due_date' => now()->startOfDay()->addHours(17), // 5 PM today
        ]);

        Task::create([
            'user_id' => $user->id,
            'category_id' => $shopping->id,
            'title' => 'Buy Groceries & Fresh Fruits',
            'description' => 'Need apples, bananas, whole milk, eggs, sourdough bread, and fresh spinach.',
            'status' => 'pending',
            'priority' => 'medium',
            'due_date' => now()->startOfDay()->addHours(19), // 7 PM today
        ]);

        Task::create([
            'user_id' => $user->id,
            'category_id' => $personal->id,
            'title' => 'Read 10 pages of Atomic Habits',
            'description' => 'Consistency is key. Focus on chapter 3 about making habits attractive.',
            'status' => 'done',
            'priority' => 'low',
            'due_date' => now()->startOfDay()->addHours(22), // 10 PM today
        ]);

        // --- OVERDUE TASKS ---
        Task::create([
            'user_id' => $user->id,
            'category_id' => $work->id,
            'title' => 'Submit Monolith Modularization PR',
            'description' => 'This is delayed. Need to push the modules/DipaCore branch to GitHub and request architectural review.',
            'status' => 'pending',
            'priority' => 'urgent',
            'due_date' => now()->subDays(2)->startOfDay()->addHours(12), // 2 days ago
        ]);

        Task::create([
            'user_id' => $user->id,
            'category_id' => $health->id,
            'title' => 'Renew Gym Membership Plan',
            'description' => 'Overdue. Call the trainer or gym reception to extend the package.',
            'status' => 'pending',
            'priority' => 'high',
            'due_date' => now()->subDays(5)->startOfDay()->addHours(18), // 5 days ago
        ]);

        // --- FUTURE TASKS ---
        Task::create([
            'user_id' => $user->id,
            'category_id' => $work->id,
            'title' => 'Setup Next.js Frontend with Tailwind & Lucide',
            'description' => 'Initialize clean directory, set up HSL tailwind palette, add authentication store (Zustand) and API interceptors.',
            'status' => 'pending',
            'priority' => 'urgent',
            'due_date' => now()->addDays(1)->startOfDay()->addHours(9), // 9 AM tomorrow
        ]);

        Task::create([
            'user_id' => $user->id,
            'category_id' => $personal->id,
            'title' => 'Call Mom on Sunday',
            'description' => 'Catch up with parents and share updates about skripsi development.',
            'status' => 'pending',
            'priority' => 'medium',
            'due_date' => now()->addDays(4)->startOfDay()->addHours(10), // 4 days later
        ]);

        Task::create([
            'user_id' => $user->id,
            'category_id' => $health->id,
            'title' => 'Morning Routine Workout & Stretch',
            'description' => 'Completed morning HIIT workout and flexibility stretches in the yard.',
            'status' => 'done',
            'priority' => 'low',
            'due_date' => now()->subDays(1)->startOfDay()->addHours(7), // Done yesterday morning
        ]);
    }
}
