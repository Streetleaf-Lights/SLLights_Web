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

export interface DeviceStatus {
  poleNumber: string;
  readingDate: string;
  readingTime: number;
  lastUpload: string;
  currentPanelPercentage?: number;
  currentBatteryPercentage?: number;
  currentLightRatio?: number;
}

export interface Device {
  id: string;
  poleNumber: string | number;
  customerId: string;
  customer?: Customer;
  projectId: string;
  project?: Project;
  isOnline: boolean;
  isWorking: number;
  installDate?: string;
  lat?: number;
  long?: number;
  locationCoordinates?: string;
  batteryPercentage?: number;
  panelPercentage?: number;
  lightRatio?: number;
  batteryVoltage1?: number;
  batteryVoltage2?: number;
  lastStatusUpdate?: string;
  systemStatus?: string;
}

export interface Project {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "at_risk";
  description?: string;
  startDate?: string;
  endDate?: string;
  lead?: string;
  devices?: Device[];
  lightsUnderContract?: number;
  deviceCount?: number;
  isWorkingCount?: number;
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
