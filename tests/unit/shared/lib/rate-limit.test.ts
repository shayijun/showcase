import { afterEach, describe, expect, it, vi } from "vitest";

import { enforceMinIntervalRateLimit } from "@/shared/lib/rate-limit";

function makeRequest(extraHeaders?: HeadersInit) {
  return new Request("https://app.example.com/api/email/send-email", {
    method: "POST",
    headers: {
      cookie: "session=abc",
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      ...extraHeaders,
    },
  });
}

describe("enforceMinIntervalRateLimit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.__minIntervalRateLimitStore = new Map();
  });

  it("allows the first request and blocks repeated requests inside the interval", async () => {
    const now = vi.spyOn(Date, "now");
    now.mockReturnValueOnce(1_000);
    expect(
      enforceMinIntervalRateLimit(makeRequest(), {
        intervalMs: 1_000,
        keyPrefix: "email",
      })
    ).toBeNull();

    now.mockReturnValueOnce(1_250);
    const blocked = enforceMinIntervalRateLimit(makeRequest(), {
      intervalMs: 1_000,
      keyPrefix: "email",
    });

    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get("cache-control")).toBe("no-store");
    expect(blocked?.headers.get("retry-after")).toBe("1");
    await expect(blocked?.json()).resolves.toMatchObject({
      error: "too_many_requests",
    });
  });

  it("allows the request again after the interval has passed", () => {
    const now = vi.spyOn(Date, "now");
    now.mockReturnValueOnce(1_000);
    expect(
      enforceMinIntervalRateLimit(makeRequest(), {
        intervalMs: 1_000,
        keyPrefix: "email",
      })
    ).toBeNull();

    now.mockReturnValueOnce(2_001);
    expect(
      enforceMinIntervalRateLimit(makeRequest(), {
        intervalMs: 1_000,
        keyPrefix: "email",
      })
    ).toBeNull();
  });

  it("uses the extra key to isolate scopes", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);

    expect(
      enforceMinIntervalRateLimit(makeRequest(), {
        extraKey: "a",
        intervalMs: 1_000,
        keyPrefix: "email",
      })
    ).toBeNull();

    expect(
      enforceMinIntervalRateLimit(makeRequest(), {
        extraKey: "b",
        intervalMs: 1_000,
        keyPrefix: "email",
      })
    ).toBeNull();
  });
});
