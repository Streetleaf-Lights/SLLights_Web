/**
 * app/poles/page.tsx
 * Pole list — server component.
 */

import { Suspense } from "react";
import { getDevices } from "@/lib/customers";
import PoleSearch from "@/components/PoleSearch";

export default async function PolesPage() {
  const devices = await getDevices();
  return (
    <Suspense fallback="Loading...">
      <PoleSearch devices={devices} />
    </Suspense>
  );
}
