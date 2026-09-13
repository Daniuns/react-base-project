import { z } from "zod";

export const repositorySchema = z
  .object({
    id: z.number(),
    full_name: z.string(),
    description: z.string().nullable(),
    stargazers_count: z.number(),
    html_url: z.url(),
  })
  .transform((repository) => ({
    id: repository.id,
    fullName: repository.full_name,
    description: repository.description,
    stars: repository.stargazers_count,
    url: repository.html_url,
  }));

export type Repository = z.infer<typeof repositorySchema>;

export const updateRepositorySchema = z.object({
  description: z.string().max(350).optional(),
});

export type UpdateRepositoryInput = z.infer<typeof updateRepositorySchema>;
