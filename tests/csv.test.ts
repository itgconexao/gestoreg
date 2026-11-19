import { describe, expect, it } from "vitest";
import { montarCsv } from "@/lib/csv";

describe("montarCsv", () => {
  it("usa ponto e vírgula, vírgula decimal e BOM", () => {
    expect(montarCsv([["Corte", "kg"], ["Alcatra", 12.5]])).toBe(
      "\uFEFFCorte;kg\r\nAlcatra;12,5\r\n",
    );
  });

  it("protege textos com separador ou aspas", () => {
    expect(montarCsv([['Filé; "extra"', 1]])).toBe(
      '\uFEFF"Filé; ""extra""";1\r\n',
    );
  });
});
