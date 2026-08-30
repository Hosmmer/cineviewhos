import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type { Actor, ActorFormData } from "@/features/movies/types/actor.types";

export async function fetchActors(): Promise<Actor[]> {
  const res = await djangoApi.get<PaginatedResponse<Actor>>("/actors/");
  return res.data.results;
}

export async function fetchAdminActors(): Promise<Actor[]> {
  const res = await djangoApi.get<PaginatedResponse<Actor>>("/admin/actors/");
  return res.data.results;
}

export async function createActor(data: ActorFormData): Promise<Actor> {
  const res = await djangoApi.post<Actor>("/admin/actors/", data);
  return res.data;
}

export async function updateActor(
  id: number,
  data: ActorFormData,
): Promise<Actor> {
  const res = await djangoApi.put<Actor>(`/admin/actors/${id}/`, data);
  return res.data;
}

export async function deleteActor(id: number): Promise<void> {
  await djangoApi.delete(`/admin/actors/${id}/`);
}
