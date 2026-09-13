import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { z } from "zod";
import { notifySessionExpired } from "@/features/auth/auth-events";
import {
  browserTokenStorage,
  type TokenPair,
  type TokenStorage,
} from "@/features/auth/auth-token-storage";
import { settings } from "@/settings";

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _accessToken?: string;
  _retry?: boolean;
};

export class SessionExpiredError extends Error {
  constructor(
    message = "The authentication session has expired.",
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "SessionExpiredError";
  }
}

export interface AuthenticatedApiOptions {
  baseURL: string;
  refreshPath: string;
  tokenStorage: TokenStorage;
  onSessionExpired?: () => void;
  refreshClient?: AxiosInstance;
  timeout?: number;
  refreshSkewSeconds?: number;
}

export interface AuthenticatedApi {
  client: AxiosInstance;
  clearSession(): void;
  ensureAccessToken(): Promise<string>;
  hasSession(): boolean;
  setTokens(tokens: TokenPair): void;
}

export function isTokenExpired(
  token: string,
  skewSeconds = 30,
  now = Date.now(),
) {
  const parts = token.split(".");

  // Opaque access tokens cannot be inspected. A 401 response remains the
  // source of truth for them.
  if (parts.length !== 3) {
    return false;
  }

  try {
    const payloadPart = parts[1];

    if (!payloadPart) {
      return true;
    }

    const normalizedPayload = payloadPart
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    const payload = z
      .object({ exp: z.number() })
      .safeParse(JSON.parse(globalThis.atob(normalizedPayload)));

    return payload.success
      ? payload.data.exp <= now / 1_000 + skewSeconds
      : true;
  } catch {
    return true;
  }
}

export function createAuthenticatedApi({
  baseURL,
  refreshPath,
  tokenStorage,
  onSessionExpired = () => undefined,
  refreshClient = axios.create({
    baseURL,
    timeout: 10_000,
    allowAbsoluteUrls: false,
  }),
  timeout = 10_000,
  refreshSkewSeconds = 30,
}: AuthenticatedApiOptions): AuthenticatedApi {
  const client = axios.create({
    baseURL,
    timeout,
    allowAbsoluteUrls: false,
  });

  let refreshPromise: Promise<string> | null = null;
  let sessionExpirationNotified = false;

  const expireSession = () => {
    tokenStorage.clear();

    if (!sessionExpirationNotified) {
      sessionExpirationNotified = true;
      onSessionExpired();
    }
  };

  const clearSession = () => {
    tokenStorage.clear();
    sessionExpirationNotified = false;
  };

  const setTokens = (tokens: TokenPair) => {
    tokenStorage.setTokens(tokens);
    sessionExpirationNotified = false;
  };

  const refreshAccessToken = () => {
    if (refreshPromise) {
      return refreshPromise;
    }

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      expireSession();
      return Promise.reject(new SessionExpiredError("No refresh token found."));
    }

    refreshPromise = refreshClient
      .post(refreshPath, { refresh_token: refreshToken })
      .then((response) => {
        const parsedTokens = tokenResponseSchema.parse(response.data);
        const tokens: TokenPair = {
          accessToken: parsedTokens.access_token,
          refreshToken: parsedTokens.refresh_token ?? refreshToken,
        };

        setTokens(tokens);
        return tokens.accessToken;
      })
      .catch((error: unknown) => {
        expireSession();
        throw new SessionExpiredError("Unable to refresh the session.", error);
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  };

  const ensureAccessToken = async () => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken && !isTokenExpired(accessToken, refreshSkewSeconds)) {
      return accessToken;
    }

    return refreshAccessToken();
  };

  client.interceptors.request.use(async (config) => {
    const accessToken = await ensureAccessToken();
    const retriableConfig = config as RetriableRequestConfig;

    retriableConfig._accessToken = accessToken;
    config.headers.set("Authorization", `Bearer ${accessToken}`);

    return config;
  });

  client.interceptors.response.use(undefined, async (error: unknown) => {
    if (!(error instanceof AxiosError) || error.response?.status !== 401) {
      throw error;
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (!originalRequest || originalRequest._retry) {
      expireSession();
      throw error;
    }

    originalRequest._retry = true;

    const currentToken = tokenStorage.getAccessToken();
    const tokenWasAlreadyRenewed =
      currentToken &&
      originalRequest._accessToken &&
      currentToken !== originalRequest._accessToken &&
      !isTokenExpired(currentToken, refreshSkewSeconds);
    const accessToken = tokenWasAlreadyRenewed
      ? currentToken
      : await refreshAccessToken();

    originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
    return client.request(originalRequest);
  });

  return {
    client,
    clearSession,
    ensureAccessToken,
    hasSession: () =>
      Boolean(tokenStorage.getAccessToken() ?? tokenStorage.getRefreshToken()),
    setTokens,
  };
}

export const authenticatedApi = createAuthenticatedApi({
  baseURL: settings.apiUrl,
  refreshPath: settings.authRefreshPath,
  tokenStorage: browserTokenStorage,
  onSessionExpired: notifySessionExpired,
});

export const api = authenticatedApi.client;
export default api;
