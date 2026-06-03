/**
 * lib/types.ts
 * Shared data types — adjust field names to match your APIM response shape.
 */

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "at_risk";
  description?: string;
  startDate?: string;
  endDate?: string;
  lead?: string;
}

export interface Customer {
  id: string;
  name: string;
  industry?: string;
  region?: string;
  tier?: "enterprise" | "growth" | "starter";
  since?: string;
  website?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  contacts: ContactInfo[];
  projects: Project[];
}
