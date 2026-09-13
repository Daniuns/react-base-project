import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { BrowserRouter } from "react-router";
import { describe, expect, it } from "vitest";
import Creatures from "./creatures";
import { createAppQueryClient } from "@/lib/query-client";
import { settings } from "@/settings";
import { server } from "@/test/server";

describe("Creatures page", () => {
  it("filters the list and loads the selected creature details", async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`*${settings.tibiaWikiApiUrl}/api/creatures`, () =>
        HttpResponse.json(["Dragon", "Rat"]),
      ),
      http.get(`*${settings.tibiaWikiApiUrl}/api/creatures/Dragon`, () =>
        HttpResponse.json({
          name: "Dragon",
          hp: "1000",
          exp: "700",
          attacktype: "Melee",
          occurrence: "Common",
          bestiarylevel: "Medium",
          bestiarytext: "Dragons are powerful monsters.",
        }),
      ),
    );

    render(
      <QueryClientProvider client={createAppQueryClient()}>
        <BrowserRouter>
          <Creatures />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    const dragonButton = await screen.findByRole("button", { name: "Dragon" });

    await user.click(dragonButton);

    expect(
      await screen.findByRole("heading", { name: "Dragon" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByText("700")).toBeInTheDocument();
    expect(screen.getByText("Common")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /search/i }), "rat");

    expect(screen.getByRole("button", { name: "Rat" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Dragon" }),
    ).not.toBeInTheDocument();
  });
});
