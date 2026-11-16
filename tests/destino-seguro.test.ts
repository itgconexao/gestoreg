import { describe, expect, it } from "vitest";
import { destinoSeguro } from "@/lib/destino-seguro";

describe("destinoSeguro", () => {
  it("usa a página inicial quando não há destino", () => {
    expect(destinoSeguro(undefined)).toBe("/");
    expect(destinoSeguro(null)).toBe("/");
    expect(destinoSeguro("")).toBe("/");
  });

  it("aceita caminhos internos, com ou sem parâmetros", () => {
    expect(destinoSeguro("/retirar")).toBe("/retirar");
    expect(destinoSeguro("/estoque?aba=contagem")).toBe("/estoque?aba=contagem");
  });

  it("recusa endereços externos", () => {
    expect(destinoSeguro("https://exemplo.com")).toBe("/");
    expect(destinoSeguro("//exemplo.com")).toBe("/");
    expect(destinoSeguro("/\\exemplo.com")).toBe("/");
    expect(destinoSeguro("retirar")).toBe("/");
  });
});
