/**
 * app/poles/page.tsx
 * Pole list — server component.
 */

import { Suspense } from "react";
import PoleSearch from "@/components/PoleSearch";

export default function PolesPage() {
  return (
    <Suspense fallback="Loading...">
      <PoleSearch />
    </Suspense>
  );
}
