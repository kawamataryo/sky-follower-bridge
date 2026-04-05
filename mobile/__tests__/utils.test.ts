import { describe, expect, it } from "vitest";
import { isOneSymbol } from "~/lib/utils";

describe("isOneSymbol", () => {
  it("should return true for a single symbol character", () => {
    expect(isOneSymbol("!")).toBe(true);
    expect(isOneSymbol("@")).toBe(true);
    expect(isOneSymbol("#")).toBe(true);
  });

  it("should return false for letters, digits, or multi-char strings", () => {
    expect(isOneSymbol("a")).toBe(false);
    expect(isOneSymbol("1")).toBe(false);
    expect(isOneSymbol("ab")).toBe(false);
    expect(isOneSymbol("hello")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isOneSymbol("")).toBe(false);
  });
});
