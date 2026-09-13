import { z } from "zod";

const absolutePathSchema = z.string().startsWith("/");
const urlOrAbsolutePathSchema = z.union([z.url(), absolutePathSchema]);

const settingsSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_EXAMPLE_API_URL: z.url().default("https://api.github.com"),
  VITE_TIBIA_WIKI_API_URL: urlOrAbsolutePathSchema.default("/tibiawiki-api"),
  VITE_AUTH_LOGIN_PATH: absolutePathSchema.default("/auth/login"),
  VITE_AUTH_REFRESH_PATH: absolutePathSchema.default("/auth/refresh"),
});

const result = settingsSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error(
    `Invalid environment configuration: ${z.prettifyError(result.error)}`,
  );
}

export const settings = Object.freeze({
  apiUrl: result.data.VITE_API_URL,
  exampleApiUrl: result.data.VITE_EXAMPLE_API_URL,
  tibiaWikiApiUrl: result.data.VITE_TIBIA_WIKI_API_URL,
  authLoginPath: result.data.VITE_AUTH_LOGIN_PATH,
  authRefreshPath: result.data.VITE_AUTH_REFRESH_PATH,
});

export const API_URL = settings.apiUrl;
