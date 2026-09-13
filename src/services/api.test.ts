import { HttpResponse, delay, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { createMemoryTokenStorage } from "@/features/auth/auth-token-storage";
import {
  createAuthenticatedApi,
  isTokenExpired,
  SessionExpiredError,
} from "./api";
import { server } from "@/test/server";

const API_URL = "http://localhost:3000";

function jwtWithExpiration(expiration: number) {
  return [
    btoa(JSON.stringify({ alg: "none", typ: "JWT" })),
    btoa(JSON.stringify({ exp: expiration })),
    "signature",
  ].join(".");
}

describe("authenticated API", () => {
  it("shares one refresh across simultaneous requests and stores rotation", async () => {
    let refreshCount = 0;
    const storage = createMemoryTokenStorage({
      accessToken: jwtWithExpiration(1),
      refreshToken: "refresh-old",
    });

    server.use(
      http.post(`${API_URL}/auth/refresh`, async () => {
        refreshCount += 1;
        await delay(25);
        return HttpResponse.json({
          access_token: "access-new",
          refresh_token: "refresh-new",
        });
      }),
      http.get(`${API_URL}/private`, ({ request }) =>
        HttpResponse.json({
          authorization: request.headers.get("authorization"),
        }),
      ),
    );

    const authenticatedApi = createAuthenticatedApi({
      baseURL: API_URL,
      refreshPath: "/auth/refresh",
      tokenStorage: storage,
    });
    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        authenticatedApi.client.get<{ authorization: string }>("/private"),
      ),
    );

    expect(refreshCount).toBe(1);
    expect(storage.getAccessToken()).toBe("access-new");
    expect(storage.getRefreshToken()).toBe("refresh-new");
    expect(
      responses.every(
        (response) => response.data.authorization === "Bearer access-new",
      ),
    ).toBe(true);
  });

  it("rejects every waiting request and expires the session once", async () => {
    const onSessionExpired = vi.fn();
    const storage = createMemoryTokenStorage({
      accessToken: jwtWithExpiration(1),
      refreshToken: "invalid-refresh",
    });

    server.use(
      http.post(`${API_URL}/auth/refresh`, async () => {
        await delay(25);
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const authenticatedApi = createAuthenticatedApi({
      baseURL: API_URL,
      refreshPath: "/auth/refresh",
      tokenStorage: storage,
      onSessionExpired,
    });
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        authenticatedApi.client.get<{ ok: boolean }>("/private"),
      ),
    );

    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(
      results.every(
        (result) =>
          result.status === "rejected" &&
          result.reason instanceof SessionExpiredError,
      ),
    ).toBe(true);
    expect(onSessionExpired).toHaveBeenCalledOnce();
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it("refreshes once after simultaneous 401 responses and replays requests", async () => {
    let refreshCount = 0;
    const storage = createMemoryTokenStorage({
      accessToken: "access-old",
      refreshToken: "refresh-old",
    });

    server.use(
      http.post(`${API_URL}/auth/refresh`, async () => {
        refreshCount += 1;
        await delay(25);
        return HttpResponse.json({ access_token: "access-new" });
      }),
      http.get(`${API_URL}/private`, ({ request }) => {
        const authorization = request.headers.get("authorization");

        return authorization === "Bearer access-new"
          ? HttpResponse.json({ ok: true })
          : new HttpResponse(null, { status: 401 });
      }),
    );

    const authenticatedApi = createAuthenticatedApi({
      baseURL: API_URL,
      refreshPath: "/auth/refresh",
      tokenStorage: storage,
    });
    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        authenticatedApi.client.get<{ ok: boolean }>("/private"),
      ),
    );

    expect(refreshCount).toBe(1);
    expect(responses.every((response) => response.data.ok === true)).toBe(true);
  });

  it("never retries a request more than once", async () => {
    const onSessionExpired = vi.fn();
    const storage = createMemoryTokenStorage({
      accessToken: "access-old",
      refreshToken: "refresh-old",
    });
    let requestCount = 0;

    server.use(
      http.post(`${API_URL}/auth/refresh`, () =>
        HttpResponse.json({ access_token: "access-new" }),
      ),
      http.get(`${API_URL}/private`, () => {
        requestCount += 1;
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const authenticatedApi = createAuthenticatedApi({
      baseURL: API_URL,
      refreshPath: "/auth/refresh",
      tokenStorage: storage,
      onSessionExpired,
    });

    await expect(authenticatedApi.client.get("/private")).rejects.toBeTruthy();
    expect(requestCount).toBe(2);
    expect(onSessionExpired).toHaveBeenCalledOnce();
  });
});

describe("token expiration", () => {
  it("handles base64url JWT payloads and clock skew", () => {
    const now = Date.now();
    const expiration = Math.floor(now / 1_000) + 20;

    expect(isTokenExpired(jwtWithExpiration(expiration), 30, now)).toBe(true);
    expect(isTokenExpired(jwtWithExpiration(expiration), 5, now)).toBe(false);
  });

  it("leaves opaque tokens to the API as source of truth", () => {
    expect(isTokenExpired("opaque-access-token")).toBe(false);
  });
});
