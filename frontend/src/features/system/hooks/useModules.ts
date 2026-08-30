import { useQuery } from "@tanstack/react-query";
import { fetchModules } from "@/features/system/api/modules.api";
import type { Module } from "@/features/system/types/system.types";

export function useModules() {
  return useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: fetchModules,
    staleTime: 0,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
