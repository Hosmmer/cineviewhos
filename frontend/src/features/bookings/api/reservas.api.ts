import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Reserva,
  ReservaList,
  CreateReservaData,
} from "@/features/bookings/types/reserva.types";

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

export async function fetchAdminReservas(): Promise<
  PaginatedResponse<ReservaList>
> {
  const res = await djangoApi.get<PaginatedResponse<ReservaList>>(
    "/admin/reservas/",
  );
  return res.data;
}

export async function adminAnularReserva(reservaId: number): Promise<Reserva> {
  const res = await djangoApi.post<Reserva>(
    `/admin/reservas/${reservaId}/anular/`,
  );
  return res.data;
}

export async function createAdminReserva(
  data: CreateReservaData,
): Promise<Reserva> {
  const res = await djangoApi.post<Reserva>("/admin/reservas/", data);
  return res.data;
}
