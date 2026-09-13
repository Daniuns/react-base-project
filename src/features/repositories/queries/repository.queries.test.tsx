import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, delay, http } from "msw";
import { describe, expect, it } from "vitest";
import { createAppQueryClient } from "@/lib/query-client";
import { settings } from "@/settings";
import { server } from "@/test/server";
import { useRepository } from "./repository.queries";

describe("repository queries", () => {
  it("deduplicates observers with the same query key", async () => {
    let requestCount = 0;

    server.use(
      http.get(`${settings.exampleApiUrl}/repos/TanStack/query`, async () => {
        requestCount += 1;
        await delay(20);

        return HttpResponse.json({
          id: 1,
          full_name: "TanStack/query",
          description: "Async state management",
          stargazers_count: 50_000,
          html_url: "https://github.com/TanStack/query",
        });
      }),
    );

    const queryClient = createAppQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () => [
        useRepository("TanStack", "query"),
        useRepository("TanStack", "query"),
      ],
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.every((query) => query.isSuccess)).toBe(true);
    });

    expect(requestCount).toBe(1);
    expect(result.current[0]?.data?.fullName).toBe("TanStack/query");
  });
});
