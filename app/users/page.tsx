import { getUsers } from "@/lib/customers";
import UserList from "@/components/UserList";

export default async function UsersPage() {
  const users = await getUsers();
  return <UserList />;
}
