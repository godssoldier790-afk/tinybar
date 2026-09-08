import { createServerFn } from "@tanstack/react-start";
import type { ChartRange } from "./market";

const RANGES: ChartRange[] = ["1d", "7d", "30d", "1y"];

export const getSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchSnapshot } = await import("./market.server.ts");
  return fetchSnapshot();
});

export const getChart = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const range = (input as { range?: string } | null)?.range;
    return { range: (RANGES.includes(range as ChartRange) ? range : "1d") as ChartRange };
  })
  .handler(async ({ data }) => {
    const { fetchChart } = await import("./market.server.ts");
    return fetchChart(data.range);
  });

export const verifyAsset = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const query = String((input as { query?: string } | null)?.query ?? "").slice(0, 120);
    return { query };
  })
  .handler(async ({ data }) => {
    const { verifyQuery } = await import("./market.server.ts");
    return verifyQuery(data.query);
  });
