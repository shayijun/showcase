import { describe, expect, it } from "vitest";

import { respData, respErr, respJson, respOk } from "@/shared/lib/resp";

async function readJson(response: Response) {
  return response.json() as Promise<{
    code: number;
    message: string;
    data?: unknown;
  }>;
}

describe("response helpers", () => {
  it("returns successful JSON with data", async () => {
    const response = respData({ id: "task_1" });

    await expect(readJson(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: { id: "task_1" },
    });
  });

  it("returns successful JSON without a data field when no data is supplied", async () => {
    const response = respOk();

    await expect(readJson(response)).resolves.toEqual({
      code: 0,
      message: "ok",
    });
  });

  it("returns error JSON", async () => {
    const response = respErr("invalid_request");

    await expect(readJson(response)).resolves.toEqual({
      code: -1,
      message: "invalid_request",
    });
  });

  it("preserves explicitly supplied data", async () => {
    const response = respJson(1001, "created", { ok: true });

    await expect(readJson(response)).resolves.toEqual({
      code: 1001,
      message: "created",
      data: { ok: true },
    });
  });
});
