import djangoApi from "@/services/django";
import type { UserAdmin } from "@/features/system/types/system.types";

export async function fetchUsers(): Promise<UserAdmin[]> {
  const { data } = await djangoApi.get<{ results: UserAdmin[] }>("/admin/users/");
  return data.results;
}

export async function updateUserRoles(
  id: number,
  roles: number[],
): Promise<UserAdmin> {
  const { data } = await djangoApi.patch<UserAdmin>(`/admin/users/${id}/`, {
    roles,
  });
  return data;
}
