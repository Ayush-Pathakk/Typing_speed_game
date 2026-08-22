import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { resolvers } from "./schema";
import { prisma } from "./db";

const testUsername = `testuser_${Date.now()}`;

afterAll(async () => {
  const users = await prisma.user.findMany({ where: { username: { startsWith: "testuser_" } } });
  const userIds = users.map((u) => u.id);
  await prisma.gameResult.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { username: { startsWith: "testuser_" } } });
  await prisma.$disconnect();
});

describe("register", () => {
  test("creates a user and returns a token", async () => {
    const result = await resolvers.Mutation.register(
      null,
      { username: testUsername, password: "test123" },
      { prisma, userId: null }
    );
    expect(result.token).toBeTruthy();
    expect(result.user.username).toBe(testUsername);
  });

  test("rejects duplicate username", async () => {
    await expect(
      resolvers.Mutation.register(null, { username: testUsername, password: "test456" }, { prisma, userId: null })
    ).rejects.toThrow("Username already taken");
  });

  test("rejects short password", async () => {
    await expect(
      resolvers.Mutation.register(null, { username: "someoneelse", password: "abc" }, { prisma, userId: null })
    ).rejects.toThrow("Password must be at least 6 characters");
  });
});

describe("login", () => {
  test("logs in with correct credentials", async () => {
    const result = await resolvers.Mutation.login(
      null,
      { username: testUsername, password: "test123" },
      { prisma, userId: null }
    );
    expect(result.token).toBeTruthy();
  });

  test("rejects wrong password", async () => {
    await expect(
      resolvers.Mutation.login(null, { username: testUsername, password: "wrongpass" }, { prisma, userId: null })
    ).rejects.toThrow("Invalid credentials");
  });
});


describe("saveGameResult", () => {
  test("throws when not authenticated", () => {
    expect(() =>
        resolvers.Mutation.saveGameResult(
        null,
        { totalTimeMs: 9000, correctChars: 20, wrongAttempts: 1, penaltyMs: 500 },
        { prisma, userId: null }
        )
    ).toThrow("Not authenticated");
  });

  test("saves a result for authenticated user", async () => {
    const user = await prisma.user.findUnique({ where: { username: testUsername } });
    const result = await resolvers.Mutation.saveGameResult(
      null,
      { totalTimeMs: 9000, correctChars: 20, wrongAttempts: 1, penaltyMs: 500 },
      { prisma, userId: user!.id }
    );
    expect(result.totalTimeMs).toBe(9000);
    expect(result.userId).toBe(user!.id);
  });

    test("rejects mismatched penalty", () => {
    expect(() =>
      resolvers.Mutation.saveGameResult(
        null,
        { totalTimeMs: 9000, correctChars: 20, wrongAttempts: 2, penaltyMs: 999 },
        { prisma, userId: "fake-id" }
      )
    ).toThrow("penaltyMs must equal wrongAttempts * 500");
  });

  test("rejects incomplete game (correctChars != 20)", () => {
    expect(() =>
      resolvers.Mutation.saveGameResult(
        null,
        { totalTimeMs: 9000, correctChars: 15, wrongAttempts: 0, penaltyMs: 0 },
        { prisma, userId: "fake-id" }
      )
    ).toThrow("correctChars must equal 20 (full game)");
  });
});

describe("bestScore / gameHistory / leaderboard", () => {
  test("bestScore returns the lowest totalTimeMs", async () => {
    const user = await prisma.user.findUnique({ where: { username: testUsername } });
    await resolvers.Mutation.saveGameResult(
      null,
      { totalTimeMs: 5000, correctChars: 20, wrongAttempts: 0, penaltyMs: 0 },
      { prisma, userId: user!.id }
    );
    const best = await resolvers.Query.bestScore(null, null, { prisma, userId: user!.id });
    expect(best?.totalTimeMs).toBe(5000);
  });

  test("gameHistory returns only the current user's results", async () => {
    const user = await prisma.user.findUnique({ where: { username: testUsername } });
    const history = await resolvers.Query.gameHistory(null, null, { prisma, userId: user!.id });
    expect(history.every((r) => r.userId === user!.id)).toBe(true);
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  test("leaderboard is ordered ascending by bestTimeMs", async () => {
    const board = await resolvers.Query.leaderboard(null, null, { prisma, userId: null });
    for (let i = 1; i < board.length; i++) {
      expect(board[i].bestTimeMs).toBeGreaterThanOrEqual(board[i - 1].bestTimeMs);
    }
  });

  
}); 