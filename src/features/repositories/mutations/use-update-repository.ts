import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRepository } from "../api/repository.api";
import type { UpdateRepositoryInput } from "../api/repository.schemas";
import { repositoryKeys } from "../queries/repository.queries";

export function useUpdateRepository(owner: string, name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRepositoryInput) =>
      updateRepository(owner, name, input),
    onSuccess: (repository) => {
      queryClient.setQueryData(repositoryKeys.detail(owner, name), repository);
    },
  });
}
