# 📝 To-Do List App

A full-stack task management application built with a **Laravel REST API** backend and a **Next.js** frontend. This monorepo contains both projects under one repository.

---

## 📁 Repository Structure

```
to-do-list-app/
├── Back-end/       # Laravel 13 REST API
└── Front-End/      # Next.js 16 Application
```

---

## 🚀 Tech Stack

### Backend (`Back-end/`)
| Technology | Version | Purpose |
|---|---|---|
| PHP | ^8.3 | Runtime |
| Laravel | ^13.8 | Framework |
| Laravel Sanctum | ^4.3 | API Authentication (Token-based) |
| MySQL | - | Database |
| PHPUnit | ^12 | Testing |

### Frontend (`Front-End/`)
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.6 | React Framework (App Router) |
| React | 19.2.4 | UI Library |
| TypeScript | ^5 | Type Safety |
| Tailwind CSS | ^4 | Styling |
| TanStack Query | ^5 | Server State Management |
| React Hook Form | ^7 | Form Handling |
| Zod | ^4 | Schema Validation |
| Axios | ^1 | HTTP Client |
| Recharts | ^3 | Data Visualization |
| Lucide React | ^1 | Icon Library |
| Storybook | ^10 | UI Component Development |
| Vitest | ^4 | Unit Testing |

---

## ✨ Features

- 🔐 **Authentication** — Register, Login, Logout via token-based auth (Sanctum)
- ✅ **Task Management** — Create, read, update, delete tasks with soft-delete support
- 🏷️ **Categories** — Organize tasks by custom categories
- 📊 **Dashboard** — Real-time summary of task statistics and productivity trends
- 🔔 **Task Reminders** — Scheduled command for task reminder notifications
- 📖 **Storybook** — Isolated UI component development and documentation
- 🛡️ **Form Validation** — Client-side validation with Zod + server-side with Laravel Form Requests

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:
- **PHP** >= 8.3
- **Composer**
- **Node.js** >= 18
- **pnpm** >= 9
- **MySQL** (or Laragon / XAMPP)

---

### 🔧 Backend Setup

```bash
# 1. Navigate to the backend directory
cd Back-end

# 2. Install PHP dependencies
composer install

# 3. Copy environment file and configure it
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Configure your database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=todo_list
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Run database migrations
php artisan migrate

# 7. Start the development server
php artisan serve
```

The API will be available at: `http://localhost:8000`

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd Front-End

# 2. Install dependencies
pnpm install

# 3. Copy environment file and configure it
cp .env.example .env.local

# 4. Set the API base URL in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# 5. Start the development server
pnpm dev
```

The app will be available at: `http://localhost:3000`

---

### 📖 Storybook (UI Components)

```bash
cd Front-End
pnpm storybook
```

Storybook will be available at: `http://localhost:6006`

---

## 🗂️ API Endpoints

Base URL: `http://localhost:8000/api/v1`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Login and receive token |
| `POST` | `/logout` | Logout (revoke token) |

### Tasks *(requires auth)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | List all tasks |
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks/{id}` | Get a task |
| `PUT` | `/tasks/{id}` | Update a task |
| `DELETE` | `/tasks/{id}` | Soft-delete a task |
| `PATCH` | `/tasks/{id}/toggle` | Toggle task completion |
| `POST` | `/tasks/{id}/restore` | Restore deleted task |

### Categories *(requires auth)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create a new category |
| `PUT` | `/categories/{id}` | Update a category |
| `DELETE` | `/categories/{id}` | Delete a category |

### Dashboard *(requires auth)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Get task summary & statistics |

---

## 🗃️ Database Schema

```
users
├── id, name, email, password, timestamps

categories
├── id, user_id (FK), name, color, timestamps, deleted_at

tasks
├── id, user_id (FK), category_id (FK)
├── title, description, priority (low/medium/high)
├── status (pending/in_progress/completed)
├── due_date, is_completed
├── timestamps, deleted_at

task_activities
├── id, task_id (FK), user_id (FK)
├── activity_type, description, timestamps
```

---

## 🧪 Running Tests

### Backend
```bash
cd Back-end
php artisan test
```

### Frontend
```bash
cd Front-End
pnpm vitest
```

---

## 📦 Project Scripts

### Backend
| Command | Description |
|---|---|
| `php artisan serve` | Start dev server |
| `php artisan migrate` | Run migrations |
| `php artisan migrate:fresh` | Reset & re-run all migrations |
| `php artisan test` | Run tests |

### Frontend
| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build for production |
| `pnpm storybook` | Start Storybook |
| `pnpm vitest` | Run unit tests |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](Back-end/LICENSE) file for details.

---

> Built with ❤️ by [Adewiraa](https://github.com/Adewiraa)
