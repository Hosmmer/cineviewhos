import type { Funcion } from "@/features/bookings/types/funcion.types";

export function groupByDate(funciones: Funcion[]): Map<string, Funcion[]> {
  const groups = new Map<string, Funcion[]>();
  for (const f of funciones) {
    const day = new Date(f.start_time).toDateString();
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(f);
  }
  return groups;
}

export function groupByCine(funciones: Funcion[]): Map<string, Funcion[]> {
  const groups = new Map<string, Funcion[]>();
  for (const f of funciones) {
    const cine = f.cine_name || "Sin lugar";
    if (!groups.has(cine)) groups.set(cine, []);
    groups.get(cine)!.push(f);
  }
  return groups;
}

export function groupBySalaNumber(funciones: Funcion[]): Map<number, Funcion[]> {
  const groups = new Map<number, Funcion[]>();
  for (const f of funciones) {
    const n = f.sala_number ?? 0;
    if (!groups.has(n)) groups.set(n, []);
    groups.get(n)!.push(f);
  }
  return groups;
}

export interface FuncionTab {
  label: string;
  funciones: Funcion[];
}

export function buildFormatTabs(funciones: Funcion[]): FuncionTab[] {
  const groups = new Map<string, Funcion[]>();
  const sinFormato: Funcion[] = [];
  for (const f of funciones) {
    if (f.formats && f.formats.length > 0) {
      for (const fmt of f.formats) {
        if (!groups.has(fmt.name)) groups.set(fmt.name, []);
        groups.get(fmt.name)!.push(f);
      }
    } else {
      sinFormato.push(f);
    }
  }
  const tabs = Array.from(groups.entries()).map(([label, funciones]) => ({
    label,
    funciones,
  }));
  tabs.sort((a, b) => a.label.localeCompare(b.label));
  if (sinFormato.length > 0) {
    tabs.push({ label: "Sin formato", funciones: sinFormato });
  }
  return tabs;
}

export function buildFranjaTabs(funciones: Funcion[]): FuncionTab[] {
  const groups = new Map<string, Funcion[]>();
  for (const f of funciones) {
    const franja = f.franja || "Sin franja";
    if (!groups.has(franja)) groups.set(franja, []);
    groups.get(franja)!.push(f);
  }
  const tabs = Array.from(groups.entries()).map(([label, funciones]) => ({
    label,
    funciones,
  }));
  tabs.sort((a, b) => {
    if (a.label === "Sin franja") return 1;
    if (b.label === "Sin franja") return -1;
    const aMin = Math.min(
      ...a.funciones.map((f) => new Date(f.start_time).getTime()),
    );
    const bMin = Math.min(
      ...b.funciones.map((f) => new Date(f.start_time).getTime()),
    );
    return aMin - bMin;
  });
  return tabs;
}
