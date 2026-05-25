# ⚠️ ByteAcademy Known Issues & Tech Debt Log

This document tracks known architectural characteristics, potential scaling edge cases, and tech debt considerations under investigation for **ByteAcademy**.

---

## 🗄️ 1. Database Connection pooling limits
*   **Context**: In high-traffic serverless deployment models (like Vercel serverless functions), each serverless function call can spin up a new database connection.
*   **Implication**: If standard direct database URLs are utilized instead of connection pool proxies, database connection limits can be easily exhausted.
*   **Resolution**: Always connect the application routes via the Supabase pooled connection string (`DATABASE_URL` with port `6543` and `?pgbouncer=true` parameter), reserving the direct string (`DIRECT_URL`) for developer migration pipelines.

---

## 🔐 2. OAuth First-Time Session Link Merges
*   **Context**: When an anonymous user accumulates progress in unauthenticated Guest mode, their achievements are stored under their `guest_<uuid>@byteacademy.com` profile. If they subsequently sign in using GitHub OAuth, a brand new user profile is created under their GitHub email address.
*   **Implication**: In rare instances of concurrent sign-ins from different tabs, the first-time lossless merge sequence in `syncFromCloud` might run into timing conflicts.
*   **Resolution**: We have implemented atomic transactional validations in `/api/sync` GET/POST controllers. However, developers should monitor first-time OAuth redirects to ensure no guest rows are left orphaned.

---

## 🏎️ 3. LLM API Rate Throttling
*   **Context**: The intelligent AI tutor persona streams responses using fast-access Groq, OpenAI, or OpenRouter keys.
*   **Implication**: Under extensive concurrent interview drilling sessions or high-pressure Grill-me simulations, client API keys might encounter rate limits.
*   **Resolution**: The tutoring routes contain graceful connection checks, catching HTTP `429` rate limit errors and outputting warning details directly inside the tutoring thread bubbles rather than crashing the client.

---

## 📱 4. Mobile Keyboard Height Adjustments
*   **Context**: On smaller mobile displays (e.g. iPhone SE model viewports), opening the native software keyboard inside the AI Tutor chat input panel shifts the chat area vertically.
*   **Implication**: Can cause brief overflow layout scroll clipping if viewport boundaries are locked.
*   **Resolution**: We use fluid CSS layout structures (`h-[calc(100vh-100px)]`) and dynamic scrolling triggers (`scrollIntoView({ behavior: 'smooth' })`) to ensure the active typing bubble remains centered and readable.
