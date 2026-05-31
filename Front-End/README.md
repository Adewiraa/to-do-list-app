# TaskFlow — Front-End

<div align="center">

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Premium%20Productivity%20App-334155?style=for-the-badge&logo=vercel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-DC2626?style=for-the-badge)

**A premium, calm-designed productivity dashboard built with Next.js 16, Zod, React Query, and Storybook.**

</div>

---

## ✨ Features

- 🔐 **Authentication** — JWT-based login & registration with Zod validation
- ✅ **Task Management** — Create, edit, delete (with confirmation), filter, sort, and mark tasks as done
- 📂 **Category Management** — Color-coded categories with icon labels
- 📊 **Dashboard** — Summary cards, weekly productivity chart, today's tasks, overdue tasks
- 🎨 **Calm Off-white Design** — Natural, distraction-free UI following a "Calm Workspace" design system
- 🧪 **Storybook** — Component stories for UI documentation and visual testing
- ⚡ **Optimistic Updates** — Instant UI response on task status changes with server sync
- 🔄 **Undo Delete** — Soft-delete with undo toast for task recovery

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Validation | Zod + React Hook Form |
| State / Data | TanStack React Query v5 |
| HTTP Client | Axios |
| Component Docs | Storybook v10 |
| Package Manager | pnpm |
| Font | Geist (Google Fonts) |
| Icons | Lucide React |
| Charts | Recharts |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Login page
│   ├── register/page.tsx     # Register page
│   ├── dashboard/page.tsx    # Dashboard
│   ├── tasks/page.tsx        # Task management
│   ├── categories/page.tsx   # Category management
│   └── layout.tsx            # Root layout
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── IconRenderer.tsx      # Dynamic icon resolver
│   └── Providers.tsx         # React Query + Auth providers
├── context/
│   └── AuthContext.tsx       # Global auth state
├── lib/
│   ├── api.ts                # Axios API service clients
│   ├── schemas.ts            # Zod validation schemas
│   └── utils.ts              # Utilities
└── stories/                  # Storybook stories
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Back-end API running (see `/back-end` folder)

### Installation

```bash
# Clone the repository
git clone https://github.com/Adewiraa/to-do-list-app.git
cd to-do-list-app/front-end

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL to your backend URL
```

### Running Locally

```bash
# Start development server
pnpm dev

# Open http://localhost:3000
```

### Storybook

```bash
# Start Storybook UI component explorer
pnpm storybook

# Open http://localhost:6006
```

### Production Build

```bash
pnpm build
pnpm start
```

---

## 🔗 Back-End API

This front-end connects to a **Laravel 12** REST API. See the [`/back-end`](../back-end/README.md) folder for setup instructions.

Default API base URL: `http://127.0.0.1:8000/api/v1`

---

## 🎨 Design System

This application follows the **Calm Off-white & Slate** design system:

| Token | Value |
|---|---|
| Background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Primary | `#334155` (Slate 700) |
| Text | `#0F172A` |
| Border | `#E2E8F0` |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Danger | `#DC2626` |

---

## 📋 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

---

## ⚖️ License

This project is **proprietary software**. All rights reserved by **Adewiraa**.

See [LICENSE](./LICENSE) for full terms. Unauthorized use, copying, or distribution is strictly prohibited.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Adewiraa">Adewiraa</a>
</div>
