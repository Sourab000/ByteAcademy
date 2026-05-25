# 🗃️ ByteAcademy Database Flow & Persistence Documentation

This document describes the flow of data, transaction handling, API endpoints, schema architectures, and caching strategies that govern the **ByteAcademy** database persistence system.

---

## 🔄 Overall Data Flow Architecture

The data lifecycle of ByteAcademy is designed around a **Reactive Synchronized Architecture**. Rather than saving state only to local storage caches, the application is connected to a production **PostgreSQL database (via Supabase)** using **Prisma client ORM**.

```
[User Action] ---> [Zustand Store (Instant Local Update)]
                         |
                 (1500ms Debounce)
                         |
                         v
     [Client syncToCloud Hook / sync.ts]
                         |
           (Includes JWT Token or Guest ID)
                         |
                         v
  [Next.js App Router POST /api/sync Route Handler]
                         |
            (authenticateUser Handshake)
                         |
                         v
     [Prisma Transaction / prisma.$transaction]
                         |
                         v
       [PostgreSQL DB (Supabase Cloud)]
```

---

## 🔀 Onboarding, Guest, & Authentication Bootstrap Flows

To support a seamless cloud-backed experience for all users—whether authenticated, anonymous, or unconfigured—ByteAcademy employs a three-tiered authentication and session routing model:

### 1. Zero-Auth Setup Fallback (Seeded Demo Mode)
*   **Trigger**: If no local guest tokens exist and no Supabase credentials are configured in the environment settings.
*   **Result**: The server automatically routes transactions to a default seeded database profile under the email `demo@byteacademy.com`. This ensures the application is immediately testable without configuration.

### 2. Persistent Unauthenticated Flow (Guest Mode)
*   **Trigger**: When Supabase is not configured or the active visitor is logged out.
*   **Result**: The client automatically generates a persistent random guest token (e.g. `guest_xyz123`) and saves it to `localStorage`.
*   **Database Mapping**: This token is passed in the bearer header. The API automatically maps this identifier to a unique database record: `guest_xyz123@byteacademy.com`.
*   **Persistence**: All XP, completed DSA roadmaps, language progress milestones, and tutor chat memory threads are permanently saved in PostgreSQL under this guest profile.

### 3. Authenticated Social Sync Flow (Supabase + GitHub OAuth)
*   **Trigger**: The user clicks "Sign in with GitHub" and authenticates.
*   **Zustand Merging Protocol**: To prevent progress loss during first-time sign-ins, `syncFromCloud` executes a lossless relational merge:
    $$\text{DSA Solves} = \text{Local DSA} \cup \text{Cloud DSA}$$
    $$\text{XP Earned} = \max(\text{Local XP}, \text{Cloud XP})$$
    $$\text{Preferences} = \text{Cloud Prefs} \lor \text{Local Prefs}$$
*   **Database Persistence**: Pushes the merged data slice to the cloud database securely, linking the user's permanent GitHub email profile.

---

## 🔗 Centralized Prisma Client Singleton

To prevent database connection pooling exhaustion in serverless environments, Prisma client is instantiated as a global singleton under `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 📡 REST-like Subsystem API Endpoints

ByteAcademy exposes both a bulk transaction sync API and targeted modular API route handlers under `/src/app/api`:

### 1. Transactional Bulk Sync: `/api/sync`
*   `GET`: Pulls the complete user state (profile details, roadmap checkpoints, syntax tracks, flashcards, tutor conversations, and visual configurations) for bulk hydration.
*   `POST`: Upserts the complete Zustand client state slice to PostgreSQL inside a single ACID-compliant transactional scope (`prisma.$transaction`).

### 2. Modular API Route Handlers

| Endpoint | Method | Description | Payloads / Params |
| :--- | :---: | :--- | :--- |
| `/api/profile` | `GET` | Fetches core profile handle and avatar metrics. | None |
| `/api/profile` | `POST` | Updates profile handle and custom avatar symbols. | `{ name, avatarUrl }` |
| `/api/xp` | `POST` | Increments XP values and recalculates level bounds. | `{ amount: number }` |
| `/api/streak` | `POST` | Checks last active timestamp and shifts streak counts. | None |
| `/api/dsa` | `GET` | Pulls topic checkpoint statuses and mastery scores. | None |
| `/api/dsa` | `POST` | Marks questions complete, awards XP, and schedules review. | `{ topicId, questionId, xpReward }` |
| `/api/languages` | `GET` | Fetches progress states for syntax tracks. | None |
| `/api/languages` | `POST` | Flags lesson complete, advances indexes, awards XP. | `{ languageId, lessonId, xpReward }` |
| `/api/tutor/chat-history` | `GET` | Fetches conversation threads for tutor modes. | None |
| `/api/tutor/chat-history` | `POST` | Appends a chat message to PostgreSQL conversation log. | `{ mode, sender, text }` |
| `/api/tutor/chat-history` | `DELETE` | Purges message logs for a specific tutoring persona. | Query param: `?mode=persona` |
| `/api/quiz` | `GET` | Pulls score history logs for standard quizzes. | None |
| `/api/quiz` | `POST` | Saves quiz results and awards dynamic target XP. | `{ quizId, topicId, score, maxScore, xpEarned }` |
| `/api/achievements` | `GET` | Loads unlocked badges and trophy shelf items. | None |
| `/api/achievements` | `POST` | Validates completion targets and unlocks badges. | `{ achievementId, title, description, icon }` |
| `/api/interviews` | `GET` | Retrieves full timed mock interview history records. | None |
| `/api/interviews` | `POST` | Logs code grader feedback and saves session scores. | `{ title, difficulty, codeSnippet, language, feedback, score, durationSeconds }` |
| `/api/settings` | `GET` | Loads theme, font size, physics, and reminder preferences. | None |
| `/api/settings` | `POST` | Updates active theme and sound effect configurations. | `{ theme, fontSize, motionPhysics, soundEffects, dailyReminder }` |

---

## 🏎️ Caching & Performance Optimization

1.  **Zustand Reactive Caching**: Client components read state directly from Zustand (instant responsive updates). Mutations are performed optimistically locally, masking API network latency.
2.  **1500ms Save Debouncing**: Rather than firing requests on every keystroke, streak tick, or XP change, state pushes are debounced to 1.5 seconds.
3.  **Connection Pooling**: Uses database connection pools to manage simultaneous queries in serverless Next.js edge workers.

---

## 🚀 Production Deployment & Scaling Guidelines

1.  **Pooled vs Direct URLs**: 
    *   Set `DATABASE_URL` to your pooled transaction connection (e.g. port `6543` with `?pgbouncer=true` or equivalent connection pool manager) inside your cloud platform (e.g., Vercel, Supabase).
    *   Set `DIRECT_URL` to your direct database connection (port `5432`) to enable schema migrations (`npx prisma db push`).
2.  **Prisma Client Generation**: Ensure `npx prisma generate` is executed during build hooks before compile checks to guarantee type safety in production pipelines.
3.  **Edge Routing Constraints**: When deploying in Vercel Edge functions, verify database connections do not exhaust cloud limits.
