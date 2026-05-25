# 📋 ByteAcademy Production Deployment Checklist

This checklist contains all necessary steps and configuration overrides to deploy the **ByteAcademy** platform securely into a production cloud environment (such as Vercel, AWS, or Supabase Cloud).

---

## 🔐 1. Environment Secrets Matrix

Ensure the following variables are defined in your production deployment dashboard:

### Database Persistency (Prisma ORM)
- [ ] **`DATABASE_URL`**: Set to the pooled transaction connection string (e.g. Supabase connection pooled string with port `6543` and `?pgbouncer=true`).
- [ ] **`DIRECT_URL`**: Set to the direct database connection string (e.g. direct database connection port `5432`) to enable build-time migrations.

### Supabase Cloud Services
- [ ] **`NEXT_PUBLIC_SUPABASE_URL`**: Set to the live production Supabase project API endpoint.
- [ ] **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Set to the production anonymous public API key.

### Adaptive LLM API Engines (Optional)
- [ ] **`GROQ_API_KEY`**: Set to your production Groq API secret (Blazing-fast default).
- [ ] **`OPENAI_API_KEY`**: Set to your production OpenAI API secret.
- [ ] **`OPENROUTER_API_KEY`**: Set to your OpenRouter production key.
- [ ] **`AI_PROVIDER`**: Optional override string (Select from `"groq"`, `"openai"`, or `"openrouter"`).

---

## 🗃️ 2. Database Migrations & Provisioning

- [ ] Run build-time Prisma pushes to keep the database aligned:
  ```bash
  npx prisma db push
  ```
- [ ] Generate modern strongly typed Prisma client bundles before compiling the Next.js pages:
  ```bash
  npx prisma generate
  ```

---

## 🐙 3. GitHub Social OAuth Callback Links

- [ ] Confirm your GitHub Developer Settings contain the correct production authorization callback link:
  ```
  https://<your-supabase-project-id>.supabase.co/auth/v1/callback
  ```
- [ ] Update Homepage URL in the GitHub Developer console to your custom production domain (e.g., `https://byteacademy.app`).

---

## 🏎️ 4. Build-Time Audits & Telemetry

- [ ] Confirm your build script includes the standard TypeScript compile checks:
  ```bash
  npm run build
  ```
- [ ] Validate that all dynamic endpoints use the `force-dynamic` flag to prevent incorrect serverless caching during database pulls.
- [ ] Test the global Toast notification overlays on various page transitions.
- [ ] Confirm all unauthenticated sessions generate guest persistent ID keys inside the `localStorage` cache.
