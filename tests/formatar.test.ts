import { describe, expect, it } from "vitest";
import { formatarKg } from "@/lib/formatar";

describe("formatarKg", () => {
  it("usa vírgula como separador decimal", () => {
    expect(formatarKg(0.5)).toBe("0,5 kg");
  });

  it("usa ponto como separador de milhar", () => {
    expect(formatarKg(1234.5)).toBe("1.234,5 kg");
  });

  it("não mostra casas decimais em números inteiros", () => {
    expect(formatarKg(12)).toBe("12 kg");
  });
});
