import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  // console.log("Home page session:", session);
  redirect(session?.role === "Customer Admin" ? "/projects" : "/customers");
}
