import djangoApi from "@/api/django";
import type { PaginatedResponse } from "@/types/movies";
import type {
  CreateReservaData,
  Format,
  FormatFormData,
  Funcion,
  FuncionDetail,
  FuncionFormData,
  Reserva,
  ReservaList,
  Sala,
  SalaDetail,
  SalaFormData,
  Seat,
} from "@/types/reservations";

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

export async function createReserva(data: CreateReservaData): Promise<Reserva> {
  const res = await djangoApi.post<Reserva>("/reservas/", data);
  return res.data;
}

export async function fetchMyReservas(): Promise<PaginatedResponse<ReservaList>> {
  const res = await djangoApi.get<PaginatedResponse<ReservaList>>("/reservas/");
  return res.data;
}

export async function anularReserva(reservaId: number): Promise<Reserva> {
  const res = await djangoApi.post<Reserva>(`/reservas/${reservaId}/anular/`);
  return res.data;
}

export async function fetchAdminSalas(): Promise<PaginatedResponse<SalaDetail>> {
  const res = await djangoApi.get<PaginatedResponse<SalaDetail>>("/admin/salas/");
  return res.data;
}

export async function fetchAdminSala(id: number): Promise<Sala> {
  const res = await djangoApi.get<Sala>(`/admin/salas/${id}/`);
  return res.data;
}

export async function createSala(data: SalaFormData): Promise<Sala> {
  const res = await djangoApi.post<Sala>("/admin/salas/", data);
  return res.data;
}

export async function updateSala(id: number, data: { name: string }): Promise<Sala> {
  const res = await djangoApi.patch<Sala>(`/admin/salas/${id}/`, data);
  return res.data;
}

export async function deleteSala(id: number): Promise<void> {
  await djangoApi.delete(`/admin/salas/${id}/`);
}

export async function fetchAdminFunciones(): Promise<PaginatedResponse<Funcion>> {
  const res = await djangoApi.get<PaginatedResponse<Funcion>>("/admin/funciones/");
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

export async function fetchAdminReservas(): Promise<PaginatedResponse<ReservaList>> {
  const res = await djangoApi.get<PaginatedResponse<ReservaList>>("/admin/reservas/");
  return res.data;
}

export async function adminAnularReserva(reservaId: number): Promise<Reserva> {
  const res = await djangoApi.post<Reserva>(`/admin/reservas/${reservaId}/anular/`);
  return res.data;
}

export async function fetchAdminFormats(): Promise<PaginatedResponse<Format>> {
  const res = await djangoApi.get<PaginatedResponse<Format>>("/admin/formats/");
  return res.data;
}

export async function fetchAdminFormat(id: number): Promise<Format> {
  const res = await djangoApi.get<Format>(`/admin/formats/${id}/`);
  return res.data;
}

export async function createFormat(data: FormatFormData): Promise<Format> {
  const res = await djangoApi.post<Format>("/admin/formats/", data);
  return res.data;
}

export async function updateFormat(id: number, data: FormatFormData): Promise<Format> {
  const res = await djangoApi.patch<Format>(`/admin/formats/${id}/`, data);
  return res.data;
}

export async function deleteFormat(id: number): Promise<void> {
  await djangoApi.delete(`/admin/formats/${id}/`);
}

export async function fetchFormats(): Promise<Format[]> {
  const res = await djangoApi.get<PaginatedResponse<Format>>("/formats/");
  return res.data.results;
}
