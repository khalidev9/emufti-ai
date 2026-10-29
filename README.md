# EMufti AI — Authentic AI Islamic Assistant Platform

EMufti AI is a production-ready, responsive Islamic knowledge web application inspired by the usability and layout of ChatGPT, with its own unique identity, Islamic design elements (emerald green & muted gold), and rigorous religious-answering integrity.

---

## 🌟 Key Features

1. **ChatGPT-Style Three-Part Layout**:
   - Collapsible left sidebar with conversation search, grouped date history, pinned inquiries, and Islamic topic shortcuts.
   - Main conversational workspace with welcoming cards ("Ask. Learn. Understand Islam.") and bottom-anchored composer.
   - Contextual right-side **Reference Inspector** to inspect Quranic Surahs/Ayahs, Hadith collections, and verification metadata.

2. **Strict Religious Accuracy & Humility**:
   - System prompts instruct the AI to distinguish Quran verses, authentic Hadiths, scholarly consensus, and general explanations.
   - **Four Madhhabs Comparative Fiqh (Ikhtilaf)**: Explains differences among Hanafi, Maliki, Shafi'i, and Hanbali schools respectfully.
   - Explicit "Not a Human Mufti" boundaries with recommendations to consult living scholars for personal fatwas.
   - Report modal for users to flag inaccurate verses or unverified citations.

3. **Multilingual Support**:
   - **English**: Clear, structured modern English with transliterations.
   - **Soomaali**: Natural Somali using customary terminology (Salaad, Soon, Sakada, Tiirarka Islaamka).
   - **العربية (Arabic)**: Classical eloquent Arabic with full RTL styling and Amiri font rendering.

4. **Supabase PostgreSQL & Security**:
   - Complete schema migration with 10 tables: `profiles`, `conversations`, `messages`, `plans`, `subscriptions`, `usage_records`, `saved_items`, `response_feedback`, `reports`, `admin_audit_logs`.
   - Row Level Security (RLS) policies guaranteeing privacy.
   - Server-side daily usage quota tracking function (`check_daily_usage`).

5. **Server-Side Google Gemini AI**:
   - Production Supabase Edge Function (`supabase/functions/chat-gemini/index.ts`) calling Google Gemini securely.
   - API keys are kept server-side and never leaked to the client.

6. **Payment Provider Abstraction**:
   - Clean abstraction (`PaymentProvider`) supporting Stripe and development sandbox modes.

7. **Admin Dashboard**:
   - Protected route `/admin` for administrators to review operational metrics, user status, plans, and user-submitted religious reports.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project URL and anon key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Migration
In your Supabase Dashboard SQL Editor, run the migration script:
[`supabase/migrations/20261014_init_emufti_schema.sql`](file:///c:/Users/MOHAMUD/Desktop/chatbot/supabase/migrations/20261014_init_emufti_schema.sql)

### 4. Deploy Gemini Edge Function (Optional)
To use the secure server-side Gemini function:
```bash
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase functions deploy chat-gemini
```

### 5. Launch Development Server
```bash
npm run dev
```

---

## 📄 License
Educational Islamic Assistant Platform. Dedicated to spreading authentic Islamic knowledge with humility and transparency.
