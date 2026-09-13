import {
  repositorySchema,
  type UpdateRepositoryInput,
} from "./repository.schemas";
import api from "@/services/api";
import exampleApi from "@/services/exampleApi";

function repositoryPath(owner: string, name: string) {
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
}

export async function getRepository(
  owner: string,
  name: string,
  signal?: AbortSignal,
) {
  const response = await exampleApi.get(repositoryPath(owner, name), {
    signal,
  });
  return repositorySchema.parse(response.data);
}

export async function updateRepository(
  owner: string,
  name: string,
  input: UpdateRepositoryInput,
) {
  const response = await api.patch(repositoryPath(owner, name), input);
  return repositorySchema.parse(response.data);
}
