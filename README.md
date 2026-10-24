# Recruiter Reach — Gemma 4 Job Application Assistant

A simple, fast web application for job seekers. Paste any job posting, and Gemma 4 will craft a tailored **Cover Letter**, a high-converting **Recruiter Email**, and key **Interview Talking Points**.

---

## 1. What It Does

- **Input:** Any job description (plus optional details like your name, target company, and past achievements).
- **Output:**
  1. **Full Cover Letter:** 3-4 paragraphs tailored to the employer's exact requirements.
  2. **Recruiter Outreach Email:** A punchy cold email with a compelling subject line.
  3. **Key Matching Strengths:** Quick bullet points of your strongest matching skills to prepare for interviews.
- **AI Powered by Gemma 4:**
  - Works with **Google AI Studio API** (model `gemma-4-26b-a4b-it` or `gemma-4-31b-it`).
  - Works offline with **Ollama** (model `gemma4:e2b`).
  - Switch between them anytime using one simple setting (`PROVIDER=api` or `PROVIDER=local`).

---

## 2. Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your settings:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

---

## 3. How to Run with Google AI Studio (Recommended)

1. Make sure your `.env` file contains:
   ```env
   PROVIDER=api
   GEMINI_API_KEY=your_actual_api_key_here
   GEMMA_MODEL=gemma-4-26b-a4b-it
   ```
   *(Note: In Google AI Studio, `GEMINI_API_KEY` is provided automatically).*

2. Start the app:
   ```bash
   npm run dev
   ```

3. Open your browser at:
   `http://localhost:3000`

---

## 4. How to Run with Local Ollama (Offline Mode)

If you have [Ollama](https://ollama.ai) installed on your computer:

1. Download and run Gemma 4 in your terminal:
   ```bash
   ollama run gemma4:e2b
   ```

2. In your `.env` file, change `PROVIDER` to `local`:
   ```env
   PROVIDER=local
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=gemma4:e2b
   ```

3. Start the app:
   ```bash
   npm run dev
   ```

---

## 5. How to Run the Smoke Test

We built an automated test that sends a realistic job posting through the active provider and verifies everything works end-to-end.

Run this command:
```bash
npm run test:smoke
```

- If everything works, it prints:
  ```text
  ========================================
  PASS
  ========================================
  ```
- If anything is missing or fails, it explains why and prints `FAIL`.

---

## 6. Project Structure

- `server.ts` — Server that handles API requests, keeps your API key safe, and runs the web app.
- `src/server/generator.ts` — Unified AI logic for Gemma 4 (both Google AI Studio and Ollama).
- `src/App.tsx` — Clean, single-page web interface for job seekers.
- `smoke-test.ts` — Test script that validates Gemma 4 generation.
- `.env.example` — Template showing all available settings.
