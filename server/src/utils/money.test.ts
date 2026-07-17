import { describe, expect, it } from "vitest";
import { allocateProportionally, splitCentsEvenly } from "./money.js";

describe("splitCentsEvenly", () => {
  it("splits cents without losing the remainder", () => {
    expect(splitCentsEvenly(100, 3)).toEqual([34, 33, 33]);
  });

  it("handles exact splits", () => {
    expect(splitCentsEvenly(1200, 4)).toEqual([300, 300, 300, 300]);
  });
});

describe("allocateProportionally", () => {
  it("allocates proportional extras while preserving total cents", () => {
    const result = allocateProportionally(101, [1000, 2000, 3000]);
    expect(result.reduce((sum, value) => sum + value, 0)).toBe(101);
    expect(result).toEqual([17, 34, 50]);
  });

  it("returns zero allocations when there is no weight", () => {
    expect(allocateProportionally(99, [0, 0])).toEqual([0, 0]);
  });
});
