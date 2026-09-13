import { queryOptions, useQuery } from "@tanstack/react-query";
import { getRepository } from "../api/repository.api";

export const repositoryKeys = {
  all: ["repositories"] as const,
  detail: (owner: string, name: string) =>
    [...repositoryKeys.all, owner, name] as const,
};

export const repositoryOptions = (owner: string, name: string) =>
  queryOptions({
    queryKey: repositoryKeys.detail(owner, name),
    queryFn: ({ signal }) => getRepository(owner, name, signal),
    staleTime: 60_000,
  });

export function useRepository(owner: string, name: string) {
  return useQuery(repositoryOptions(owner, name));
}
