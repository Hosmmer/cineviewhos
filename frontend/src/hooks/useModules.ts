import { useQuery } from "@tanstack/react-query";
import { fetchModules } from "@/services/moduleService";
import type { Module } from "@/types/modules";

export function useModules() {
  return useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: fetchModules,
    staleTime: 0,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
  });
}
