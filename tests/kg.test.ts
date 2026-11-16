import { describe, expect, it } from "vitest";
import { lerKg } from "@/lib/kg";

describe("lerKg", () => {
  it("aceita vírgula e ponto como separador decimal", () => {
    expect(lerKg("1,5")).toBe(1.5);
    expect(lerKg("1.5")).toBe(1.5);
    expect(lerKg(" 12 ")).toBe(12);
  });

  it("arredonda para 3 casas decimais", () => {
    expect(lerKg("2,3456")).toBe(2.346);
  });

  it("recusa textos que não são números", () => {
    expect(lerKg("abc")).toBeNull();
    expect(lerKg("")).toBeNull();
    expect(lerKg("1.234,5")).toBeNull();
    expect(lerKg("-3")).toBeNull();
  });

  it("recusa zero, a não ser que seja permitido", () => {
    expect(lerKg("0")).toBeNull();
    expect(lerKg("0", true)).toBe(0);
  });

  it("recusa pesos absurdamente altos", () => {
    expect(lerKg("100001")).toBeNull();
  });
});
