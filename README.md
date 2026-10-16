# Workout Batch — CA Guru

Standalone copy of the `/workout-batch` landing page from FOCAS-Edu-Website.
The enrollment form posts straight to a **Zoho Flow** incoming webhook (no lead server).

## Setup

```bash
npm install
cp .env.example .env   # paste your Zoho Flow webhook URL
npm run dev            # http://localhost:8080
npm run build          # output in dist/
```

Routes: `/` and `/workout-batch` (landing page), `/workout-batch-success` (thank-you page).
The host must rewrite every path to `index.html` (SPA fallback).

## Zoho Flow

Create a flow with a **Webhook** trigger and use **Form data** as the payload format.
Each submission sends these fields:

| Field | Example |
|---|---|
| `first_name`, `last_name` | Priya, Kumar |
| `dial_code`, `phone`, `full_phone` | +91, 9876543210, +919876543210 |
| `ca_status` | Intermediate (always) |
| `attempt` | Group 1 / Group 2 / Both Groups / Unit 2D |
| `state`, `city`, `location` | Tamil Nadu, Chennai, "Chennai, Tamil Nadu" |
| `lead_source` | value of `VITE_LEAD_SOURCE` (default `workout-batch-caguru`) |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | first-touch UTMs |
| `landing_url`, `referrer`, `page_url`, `submitted_at` | tracking |

Zoho Flow returns no CORS headers, so the browser sends the request with `mode: "no-cors"`.
The page cannot read Flow's response. Check the flow's **History** tab to confirm leads arrive.
# workout-batch-caguru
