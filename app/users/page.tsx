import { getUsers } from "@/lib/customers";
import UserList from "@/components/UserList";
import { getSession } from "@/lib/auth";

export default async function UsersPage() {
  const session = await getSession();
  return <UserList sessionRole={session?.role ?? ""} />;
}
