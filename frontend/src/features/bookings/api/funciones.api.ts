import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Funcion,
  FuncionDetail,
  FuncionFormData,
} from "@/features/bookings/types/funcion.types";
import type { Seat } from "@/features/bookings/types/seat.types";

export async function fetchFunciones(
  movieId: number,
): Promise<PaginatedResponse<Funcion>> {
  const res = await djangoApi.get<PaginatedResponse<Funcion>>("/funciones/", {
    params: { movie: movieId },
  });
  return res.data;
}

export async function fetchFuncionDetail(id: number): Promise<FuncionDetail> {
  const res = await djangoApi.get<FuncionDetail>(`/funciones/${id}/`);
  return res.data;
}

export async function fetchSeats(
  funcionId: number,
): Promise<PaginatedResponse<Seat>> {
  const res = await djangoApi.get<PaginatedResponse<Seat>>("/asientos/", {
    params: { funcion: funcionId },
  });
  return res.data;
}

export async function fetchAdminFunciones(): Promise<PaginatedResponse<Funcion>> {
  const res = await djangoApi.get<PaginatedResponse<Funcion>>(
    "/admin/funciones/",
  );
  return res.data;
}

export async function fetchAdminFuncion(id: number): Promise<Funcion> {
  const res = await djangoApi.get<Funcion>(`/admin/funciones/${id}/`);
  return res.data;
}

export async function createFuncion(data: FuncionFormData): Promise<Funcion> {
  const res = await djangoApi.post<Funcion>("/admin/funciones/", data);
  return res.data;
}

export async function updateFuncion(
  id: number,
  data: FuncionFormData,
): Promise<Funcion> {
  const res = await djangoApi.patch<Funcion>(`/admin/funciones/${id}/`, data);
  return res.data;
}

export async function deleteFuncion(id: number): Promise<void> {
  await djangoApi.delete(`/admin/funciones/${id}/`);
}
