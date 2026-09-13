import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCreature, getCreatureNames } from "../api/creature.api";

export const creatureKeys = {
  all: ["creatures"] as const,
  list: () => [...creatureKeys.all, "list"] as const,
  detail: (name: string) => [...creatureKeys.all, "detail", name] as const,
};

export const creatureNamesOptions = () =>
  queryOptions({
    queryKey: creatureKeys.list(),
    queryFn: ({ signal }) => getCreatureNames(signal),
    staleTime: 10 * 60_000,
  });

export const creatureOptions = (name: string) =>
  queryOptions({
    queryKey: creatureKeys.detail(name),
    queryFn: ({ signal }) => getCreature(name, signal),
    staleTime: 10 * 60_000,
  });

export function useCreatureNames() {
  return useQuery(creatureNamesOptions());
}

export function useCreature(name: string | null) {
  return useQuery({
    ...creatureOptions(name ?? ""),
    enabled: Boolean(name),
  });
}
