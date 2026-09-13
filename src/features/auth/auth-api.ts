import { z } from "zod";
import type { TokenPair } from "./auth-token-storage";
import noAuthApi from "@/services/noAuthApi";
import { settings } from "@/settings";

export const loginCredentialsSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z
    .string()
    .min(8, { error: "Password must contain at least 8 characters." })
    .max(128),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
});

export async function login(credentials: LoginCredentials): Promise<TokenPair> {
  const response = await noAuthApi.post(settings.authLoginPath, credentials);
  const tokens = loginResponseSchema.parse(response.data);

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}
