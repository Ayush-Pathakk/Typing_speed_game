import { describe, test, expect } from "bun:test";
import { generateSequence, isCorrectKey, computeResult } from "./game";

describe("generateSequence", () => {
  test("generates requested length of uppercase letters", () => {
    const seq = generateSequence(20);
    expect(seq.length).toBe(20);
    expect(seq.every((c) => /^[A-Z]$/.test(c))).toBe(true);
  });
});

describe("isCorrectKey", () => {
  test("matches case-insensitively", () => {
    expect(isCorrectKey("a", "A")).toBe(true);
    expect(isCorrectKey("B", "A")).toBe(false);
  });
});

describe("computeResult", () => {
  test("adds penalty to raw time (game completion + penalty calc)", () => {
    const result = computeResult(10000, 3, 20);
    expect(result.penaltyMs).toBe(1500);
    expect(result.totalTimeMs).toBe(11500);
    expect(result.correctChars).toBe(20);
  });

  test("zero wrong attempts means zero penalty", () => {
    const result = computeResult(5000, 0, 20);
    expect(result.totalTimeMs).toBe(5000);
  });
});