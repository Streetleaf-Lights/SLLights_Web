import { getSession } from "@/lib/auth";
import SiteNavClient from "./SiteNavClient";

export default async function SiteNav() {
  const session = await getSession();
  return <SiteNavClient isSignedIn={!!session} />;
}