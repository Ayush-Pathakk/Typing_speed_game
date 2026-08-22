import { describe, test, expect } from "bun:test";
import { isNewBest } from "./localBest";

describe("isNewBest (high-score calculation)", () => {
  test("true when no previous best", () => {
    expect(isNewBest(null, 9999)).toBe(true);
  });
  test("true when lower than previous", () => {
    expect(isNewBest(10000, 9000)).toBe(true);
  });
  test("false when equal or higher", () => {
    expect(isNewBest(9000, 9000)).toBe(false);
    expect(isNewBest(9000, 9500)).toBe(false);
  });
});