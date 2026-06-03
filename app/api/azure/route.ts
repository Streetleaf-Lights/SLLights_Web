/**
 * app/api/azure/route.ts
 *
 * Server-side proxy that:
 *  1. Reads the subscription key from env (never exposed to browser)
 *  2. Forwards the request to your Azure APIM base URL + endpoint
 *  3. Returns JSON to the client
 *
 * Usage from the client:
 *   GET /api/azure?endpoint=/your/api/path
 *   POST /api/azure?endpoint=/your/api/path  (body: JSON)
 */

import { NextRequest, NextResponse } from "next/server";
import { azureFetch, azurePost } from "@/lib/azure-auth";

function buildUrl(endpoint: string): string {
  const base = process.env.AZURE_APIM_BASE_URL ?? "";
  if (!base) {
    throw new Error("Missing AZURE_APIM_BASE_URL in .env.local");
  }
  return `${base.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

export async function GET(req: NextRequest) {
  const endpoint = new URL(req.url).searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json({ error: "Missing ?endpoint= parameter" }, { status: 400 });
  }

  try {
    const data = await azureFetch(buildUrl(endpoint));
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const endpoint = new URL(req.url).searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json({ error: "Missing ?endpoint= parameter" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = await azurePost(buildUrl(endpoint), body);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
