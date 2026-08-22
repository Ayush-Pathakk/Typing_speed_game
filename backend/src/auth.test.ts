import { describe, test, expect } from "bun:test";
import { hashPassword, verifyPassword, signToken, verifyToken } from "./auth";

describe("password hashing", () => {
  test("hashes and verifies correctly", async () => {
    const hash = await hashPassword("mypassword");
    expect(await verifyPassword("mypassword", hash)).toBe(true);
    expect(await verifyPassword("wrongpassword", hash)).toBe(false);
  });
});

describe("jwt", () => {
  test("signs and verifies a valid token", () => {
    const token = signToken("user-123");
    const payload = verifyToken(token);
    expect(payload?.userId).toBe("user-123");
  });

  test("rejects a garbage token", () => {
    expect(verifyToken("not-a-real-token")).toBeNull();
  });
});