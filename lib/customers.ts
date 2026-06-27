/**
 * lib/customers.ts
 * Server-side data fetching for customers via Azure APIM.
 *
 * Expected APIM endpoints:
 *   POST /customers         body: { name: string } → { value: Customer[] } | Customer[]
 *   GET  /customers/{id}    → Customer
 *   POST /GetProjectData    body: { projectId: string } → Partial<Project>
 */

import { azureFetch, azurePost } from "./azure-auth";
import type { Customer, Device, DeviceStatus, Project, User } from "./types";

const BASE = process.env.AZURE_APIM_BASE_URL ?? "";

export function apimUrl(path: string) {
  return `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function getUsers(): Promise<User[]> {
  try {
    const data = await azurePost(apimUrl("/GetUsers"), {}) as { value?: User[] } | User[];
    if (Array.isArray(data)) return data;
    return (data as { value?: User[] }).value ?? [];
  } catch (e) {
    console.error("getUsers error:", e);
    return [];
  }
}

export async function postUser(
  name: string,
  email: string,
  role: string,
  customerId?: string,
  customerName?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/azure/post-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, customerId, customerName }),
    });
    if (res.status === 409) {
      const data = await res.json();
      return { success: false, error: data.error ?? "A user with this email already exists." };
    }
    if (!res.ok) throw new Error(`post-user error ${res.status}`);
    return { success: true };
  } catch (e) {
    console.error("postUser error:", e);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/azure/delete-user?id=${id}`, {
      method: "DELETE",
    });
    if (res.status === 404) {
      const data = await res.json();
      return { success: false, error: data.error ?? "User not found." };
    }
    if (!res.ok) throw new Error(`delete-user error ${res.status}`);
    return { success: true };
  } catch (e) {
    console.error("deleteUser error:", e);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const data = await azurePost(apimUrl("/GetCustomers2"), { }) as { value?: Customer[] } | Customer[];
    if (Array.isArray(data)) return data;
    return (data as { value?: Customer[] }).value ?? [];
  } catch (e) {
    console.error("getCustomers error:", e);
    return [];
  }
}

export async function getCustomerData(customerId: string): Promise<Customer & Record<string, unknown>> {
  try {
    const res = await fetch("/api/azure/customer-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    if (!res.ok) throw new Error(`customer-data error ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("getCustomerData error:", e);
    return {} as Customer & Record<string, unknown>;
  }
}

export async function getProjectData(projectId: string): Promise<Partial<Project> & { deviceCount?: number }> {
  try {
    const res = await fetch("/api/azure/project-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    if (!res.ok) throw new Error(`project-data error ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("getProjectData error:", e);
    return {};
  }
}

export async function getDevices(): Promise<Device[]> {
  try {
    const data = await azurePost(apimUrl("/GetDevices2"), {}, { cache: "no-store" }) as { value?: Device[] } | Device[];
    const devices = Array.isArray(data) ? data : (data as { value?: Device[] }).value ?? [];
    return devices;
  } catch (e) {
    console.error("getDevices error:", e);
    return [];
  }
}

export async function getDeviceData(deviceId: string): Promise<Device & Record<string, unknown>> {
  try {
    const res = await fetch("/api/azure/device-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    if (!res.ok) throw new Error(`device-data error ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("getDeviceData error:", e);
    return {} as Device & Record<string, unknown>;
  }
}

export async function getDeviceStatuses(deviceId: string): Promise<DeviceStatus & Record<string, unknown>> {
  try {
    const res = await fetch("/api/azure/device-statuses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    if (!res.ok) throw new Error(`device-statuses error ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("getDeviceStatuses error:", e);
    return {} as DeviceStatus & Record<string, unknown>;
  }
}
