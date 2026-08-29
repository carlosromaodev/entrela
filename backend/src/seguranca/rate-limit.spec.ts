import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { LimitadorEmMemoria } from "./rate-limit.js";
it("limita atomicamente pela chave pseudonimizada e reinicia a janela", async () => {
  const l = new LimitadorEmMemoria(),
    k = createHash("sha256").update("ip/token").digest("hex"),
    agora = new Date("2026-01-01");
  expect((await l.consumir(k, 2, 60, agora)).permitido).toBe(true);
  expect((await l.consumir(k, 2, 60, agora)).restantes).toBe(0);
  expect((await l.consumir(k, 2, 60, agora)).permitido).toBe(false);
  expect(
    (await l.consumir(k, 2, 60, new Date(agora.getTime() + 61000))).permitido,
  ).toBe(true);
});
