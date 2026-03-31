# AI Coach Setup

This project now uses a free-friendly AI coach backend path:

- Frontend: React app in this repo
- Backend: Cloudflare Worker in `ai-worker/`
- Model: Gemini API

## 1. Get a Gemini API key

Create one in Google AI Studio:

- https://aistudio.google.com/app/apikey

## 2. Add the key locally

Inside `ai-worker/`, create a file named `.dev.vars` and paste:

```bash
GEMINI_API_KEY=your_real_gemini_key_here
```

You can copy from:

- `ai-worker/.dev.vars.example`

## 3. Run the worker locally

```bash
npm install --prefix ai-worker
npm run dev --prefix ai-worker
```

By default this starts a local worker on `http://localhost:8787`.

## 4. Frontend endpoint

In the root `.env`, set:

```bash
VITE_AI_COACH_ENDPOINT=http://localhost:8787/chat
```

For local development, the worker handles the `/chat` POST route.

## 5. If you deploy the worker

Update:

```bash
VITE_AI_COACH_ENDPOINT=https://your-worker-domain/chat
```

Then redeploy your frontend.

## Notes

- Do not place the Gemini key in the frontend `.env`.
- The frontend key location is only for the worker URL.
- If you deploy to Cloudflare, store the Gemini key as a Worker secret instead of `.dev.vars`.

Example:

```bash
wrangler secret put GEMINI_API_KEY
```
