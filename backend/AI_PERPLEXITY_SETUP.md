# AI Doubt Solver (Perplexity) Setup

The AI Help Chat for **Student** and **Teacher** dashboards uses the **Perplexity AI** API (Sonar Pro). Follow these steps to enable it.

## 1. Get a Perplexity API Key

1. Go to [Perplexity API](https://www.perplexity.ai/settings/api) (or [docs.perplexity.ai](https://docs.perplexity.ai)).
2. Sign in or create an account.
3. Create an API key from the API / Developer section.
4. Copy the key (it looks like `pplx-xxxxxxxxxxxx`).

## 2. Add to Backend Environment

In your backend root, copy `env.example` to `.env` (if you haven’t already), then set:

```env
PERPLEXITY_API_KEY=pplx-your-actual-key-here
PERPLEXITY_MODEL=sonar-pro
PERPLEXITY_TIMEOUT=60000
```

- **PERPLEXITY_API_KEY** (required): Your Perplexity API key.
- **PERPLEXITY_MODEL** (optional): Model name. Default is `sonar-pro`.
- **PERPLEXITY_TIMEOUT** (optional): Request timeout in ms. Default is `60000` (60 seconds).

## 3. Restart the Backend

After saving `.env`, restart the Node server so it picks up the new variables.

## 4. Verify

- Log in as **Student** or **Teacher**.
- Open **AI Help** from the sidebar (`/student/ai-help` or `/teacher/ai-help`).
- Send a message. If the API key is valid, you should get an AI reply.

If the key is missing or invalid, the app will still respond with:  
*“AI is busy right now, please try again in a moment.”*

## API Usage

- **POST /api/ai/chat** — Send a message and get an AI response (JWT required; STUDENT or TEACHER).
- **GET /api/ai/history** — Get the last 20 AI chats for the logged-in user (JWT required).

Rate limit: **20 AI messages per user per hour**.
