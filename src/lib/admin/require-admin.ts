import { getCurrentUser } from "@/lib/auth/current-user";

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin" || user.status !== "active") {
    return null;
  }

  return user;
}
