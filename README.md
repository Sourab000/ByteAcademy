# ⚡ ByteAcademy - The Elite AI-Powered Computer Science Workspace

ByteAcademy is a premium, production-grade cloud-backed SaaS learning platform designed for ambitious developers preparing for elite engineering positions. By combining visual Data Structures & Algorithms (DSA) roadmap checkpoints, structured programming languageTracks, spaced-repetition card decks, adaptive knowledge check quizzes, and high-pressure timed FAANG AI Mock Technical Interviews, the system provides a holistic computer science learning dashboard.

---

## 🎨 Platform Aesthetics

ByteAcademy is designed around an immersive, high-end developer dashboard aesthetic. Taking cues from modern, highly polished tools like **Linear**, **Vercel**, and **Raycast**, the workspace employs:
*   **Harsh Dark Mode Gradients**: Subtle, vibrant HSL glow boundaries over deep dark backdrops.
*   **Premium Glassmorphism**: High-blur (`backdrop-blur-xl`) popovers and switcher modules.
*   **Fluid Responsive Scaling**: Flawless widescreen grid layouts scaling elegantly up to 4K.
*   **Jitter-Free Easing**: Dynamic Framer Motion animations with custom spring-damping settings.

---

## 🚀 Core Features

1.  **Visual DSA Checkpoint Maps**: Complete learning checkpoint nodes covering arrays, stacks, queues, trees, and recursion with dynamic unlocking rules.
2.  **Dual-Mode Synchronized Persistency**: Runs seamlessly in unauthenticated Guest mode using persistent local storage identifiers mapped directly to PostgreSQL guest rows, and automatically merges offline progress when signing in via GitHub OAuth.
3.  **Adaptive AI Code Tutor**: Context-aware tutoring modes ("Explain Simply", "Hint Only", "Strict Mentor", "Teach with Analogies", and "Grill Me Mode") using streaming LLM text decoders.
4.  **Spaced-Repetition Review Queue**: Schedules daily recall metrics using the classic **SM-2 SuperMemo algorithm**, locking concept parameters based on user recall difficulty ratings (1-5 scale).
5.  **FAANG Technical Grader**: Timed interview editor panel logging completed code scripts, scores, and complete markdown code reviews in PostgreSQL.
6.  **Global Alert Overlays**: Animated status toasts for immediate, low-latency client status updates.
7.  **Crash Recovery Console**: Deeply integrated React Error Boundaries capturing unhandled component exceptions to prevent browser screen lockouts.

---

## ⚙️ Technology Stack

*   **Framework**: Next.js 16+ (App Router, Turbopack compiler)
*   **Database ORM**: Prisma Client (with normalized relational tables)
*   **Cloud Persistence**: Supabase (Database, Auth, and OAuth Provider modules)
*   **State Management**: Zustand (persisted state caches with partialize filtering)
*   **Styling & Motion**: Tailwind CSS + Custom HSL theme variables + Framer Motion
*   **Icons**: Lucide React

---

## 📸 Screenshots & UI Preview Placeholders

Below are architectural mockups illustrating the unified core developer interface:

### 1. Unified Coder Dashboard
```
+-----------------------------------------------------------------------------------+
|  [B] ByteAcademy  |  [Flame] 7 Days Streak  |  LVL 8  |  840/1000 XP               |
+-----------------------------------------------------------------------------------+
|  Tutor Personas   |  * Visual Heatmap Grid (365 days contribution)                |
|  DSA Roadmap      |  * Study Recommendations: Next Challenge: Heaps (+150 XP)     |
|  Language Tracks  |  * Achievements Shelf: Perfect Quiz 🧠 | Week on Fire 🔥       |
|  Settings         |  * Spaced-Repetition Cards Queue: 4 reviews due today         |
+-----------------------------------------------------------------------------------+
```

### 2. Timed Technical Mock Grader Editor
```
+-----------------------------------------------------------------------------------+
| [Left: Grader Problem Specs]             | [Right: Syntax Editor Playground]       |
| Time Remaining: 44:52                    | function twoSum(nums, target) {         |
| Grader Persona: Senior Grader [Strict]   |    // Optimizing O(N) Hash Table        |
|                                          | }                                       |
+-----------------------------------------------------------------------------------+
| [Bottom Panel: Stream Grader Feedback Console]                                    |
| Grader Verdict: O(N) Time complexity approved. Grader Review Score: 95/100         |
+-----------------------------------------------------------------------------------+
```

---

## 📂 Folder Structure Overview

```
.
├── prisma/
│   └── schema.prisma        # Normalized PostgreSQL schema definitions
├── public/                  # Static assets and UI icons
├── src/
│   ├── app/
│   │   ├── api/             # Modular REST API Route Handlers
│   │   │   ├── sync/        # Transactional bulk-state syncing endpoint
│   │   │   ├── tutor/       # LLM streaming chat engines and status resolvers
│   │   │   └── ...          # Target api routes (profile, dsa, quiz, etc.)
│   │   ├── dashboard/       # Main stats and heatmaps page
│   │   ├── interviews/      # Technical interviewer simulator views
│   │   ├── languages/       # Code editor syllabus checkpoints
│   │   ├── quizzes/         # Adaptive syntax review panels
│   │   ├── settings/        # Preferences and account settings tab
│   │   ├── tutor/           # AI conversational chat panels
│   │   ├── layout.tsx       # Root layout and ErrorBoundary wrapper
│   │   └── page.tsx         # Entrance screen and OAuth landing gateway
│   ├── components/
│   │   └── shared/          # Shared components (Sidebar, Heatmap, ErrorBoundary)
│   ├── lib/
│   │   ├── auth.ts          # Centralized JWT & Guest identification handler
│   │   ├── prisma.ts        # Centralized Prisma Client Singleton
│   │   ├── supabase.ts      # Client Supabase connector
│   │   └── sync.ts          # Zustand syncing and data mappers
│   └── store/
│       └── index.ts         # Zustand State Store and toast triggers
```

---

## 🚀 Installation & Local Hosting

Developers self-hosting ByteAcademy locally should configure **their own isolated Supabase cloud databases** to persist tables correctly.

### Step 1: Clone and Install
Clone the project repository and install the standard dependencies:
```bash
git clone https://github.com/your-username/byteacademy.git
cd byteacademy
npm install
```

### Step 2: Configure Local Environment Variables
Create a local configuration file in the project root:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:
```env
# Supabase PostgreSQL Database Strings
# (pooled URL is used by next.js routes, direct URL is used by build-time migrations)
DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"

# Supabase Auth Public Keys
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."

# LLM Conversational Keys
GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk-..."
```

---

## 🗄️ Database Provisioning & Schema Push

Once `.env.local` contains your direct PostgreSQL credentials, provision the database tables using Prisma ORM:

### 1. Push Database Schematics
```bash
npx prisma db push
```

### 2. Generate Strongly-Typed Prisma Client
```bash
npx prisma generate
```

---

## 🐙 Supabase Auth & GitHub OAuth Setup

To enable automated social sign-ins and progress syncing:

1.  Navigate to your **GitHub Developer Settings** -> **OAuth Apps** -> **New OAuth App**.
2.  Set the **Homepage URL** to `http://localhost:3000` (or your live production domain).
3.  Set the **Authorization Callback URL** to:
    ```
    https://<your-supabase-project-id>.supabase.co/auth/v1/callback
    ```
4.  Generate a **Client Secret** and copy your **Client ID**.
5.  Go to your **Supabase Dashboard** -> **Authentication** -> **Providers** -> **GitHub**.
6.  Enable the provider, paste your Client ID and Client Secret, and save.

---

## 🏎️ Running Locally

Start the local Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the workspace interface. All unauthenticated sandbox sessions will automatically persist to the local PostgreSQL instance via anonymous guest identifiers!

---

## 📦 Production Deployment & Vercel Config

Hosted production deployments normally utilize a **single centralized database instance** supporting all web transactions:

1.  Create a new project inside the **Vercel Dashboard** and connect your repository.
2.  In the Vercel **Environment Variables** configuration area, add:
    *   `DATABASE_URL` (Supabase connection-pooled string)
    *   `DIRECT_URL` (Supabase direct string)
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `GROQ_API_KEY` (or chosen provider key)
3.  Trigger the deploy. Vercel will automatically run the build steps.

---

## 🏗️ Build Commands

To build, compile, and optimize the workspace bundle for live production:

```bash
npm run build
```

This trigger fires type checks, compiles static pages, generates page optimized bundles, and checks ESLint compliance.

---

## 🔒 Security Architecture

*   **Stateless Cryptographic Handshakes**: Client connections are authorized using standard JWT bearer handshakes (`Authorization: Bearer <token>`) decrypted dynamically by Supabase.
*   **Secure Environment Storage**: Database credentials and AI keys are strictly isolated in server environment variables.
*   **Relational Cascades**: All linked relational sub-items are automatically deleted when an account is deleted, leaving zero orphaned database rows.

---

## ⚡ Performance Optimizations

*   **Global Connection Pooling**: Uses PGBouncer connection pooling to avoid database connection exhaustion.
*   **Debounced Save Streams**: Saves Zustand state changes to PostgreSQL using a 1.5-second debounce loop, reducing DB load.
*   **Prerendered Layouts**: Dashboard layouts are rendered as static skeletons, using client-side hydration for responsive updates.

---

## ♿ Accessibility Notes

ByteAcademy is built with accessibility in mind, incorporating:
*   **Full Keyboard Focus Navigation**: Navigate all tabs, forms, and playground editors via the `Tab` key.
*   **ARIA Accessibility Tags**: Core modules feature semantic structures (`role="dialog"`, `aria-hidden="true"`, `aria-label`).
*   **Outfit/Inter Typography**: Sharp contrast and readable text scaling.

---

## 🗺️ Future Roadmap

*   **Multiplayer Code Playgrounds**: Pair-programming sandbox workspaces using WebSockets.
*   **Automated Resume Grader**: Real-time CV audits matched against target FAANG positions.
*   **Dynamic Sound Modules**: Dynamic synthesizers triggering code completion audio clips.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
