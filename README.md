# Azure Dashboard

A self-hosted internal dashboard for Azure resources, built with Next.js 14 (App Router).  
All Azure credentials stay server-side — never exposed to the browser.

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Azure REST API** via client credentials (no Azure SDK dependency)
- **Recharts** for data visualization
- Deploy anywhere: **Vercel**, Docker, VPS, on-prem

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `AZURE_APIM_BASE_URL` | Your APIM gateway URL, e.g. `https://my-company.azure-api.net` |
| `AZURE_APIM_SUBSCRIPTION_KEY` | APIM Portal → Products → Subscriptions → Show key |

### 3. Where to find your subscription key

```
Azure Portal → API Management → APIs → your API
→ Products → Subscriptions → click "..." → Show/hide keys
```

Or via the Developer Portal if your organization uses it.

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set the same environment variables in the Vercel dashboard under  
**Project → Settings → Environment Variables**.

> `AZURE_CLIENT_SECRET` and other non-public vars are automatically treated as server-only in Next.js — they won't be bundled to the client.

---

## Project structure

```
├── app/
│   ├── api/azure/route.ts   ← Server-side Azure proxy (keeps secrets safe)
│   ├── dashboard/page.tsx   ← Server component: fetches resource groups
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── DashboardClient.tsx  ← Interactive client UI
│   └── DashboardClient.module.css
├── lib/
│   └── azure-auth.ts        ← Token fetching + caching (server only)
├── .env.example
└── README.md
```

---

## Extending

**Call any endpoint behind your APIM gateway:**

```ts
import { azureFetch, azurePost } from "@/lib/azure-auth";

// GET
const data = await azureFetch("https://your-apim.azure-api.net/deployments/status");

// POST
const result = await azurePost("https://your-apim.azure-api.net/deployments/trigger", {
  workweek: "2024-W12",
});
```

**From the client (browser → Next.js proxy → APIM):**

```ts
// GET
const res = await fetch("/api/azure?endpoint=/deployments/status");

// POST
const res = await fetch("/api/azure?endpoint=/deployments/trigger", {
  method: "POST",
  body: JSON.stringify({ workweek: "2024-W12" }),
});
```
