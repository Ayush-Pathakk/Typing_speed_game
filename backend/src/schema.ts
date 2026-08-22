import { hashPassword, verifyPassword, signToken } from "./auth";
import type { PrismaClient } from "@prisma/client";

export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    username: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type GameResult {
    id: ID!
    totalTimeMs: Int!
    correctChars: Int!
    wrongAttempts: Int!
    penaltyMs: Int!
    createdAt: String!
  }

  type LeaderboardEntry {
    username: String!
    bestTimeMs: Int!
  }

  type Query {
    health: String!
    me: User
    gameHistory: [GameResult!]!
    bestScore: GameResult
    leaderboard: [LeaderboardEntry!]!
  }

  type Mutation {
    register(username: String!, password: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    saveGameResult(
      totalTimeMs: Int!
      correctChars: Int!
      wrongAttempts: Int!
      penaltyMs: Int!
    ): GameResult!
  }
`;

type Ctx = { prisma: PrismaClient; userId: string | null };

export const resolvers = {
  Query: {
    health: () => "ok",

    me: (_: unknown, __: unknown, ctx: Ctx) => {
      if (!ctx.userId) return null;
      return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
    },

    gameHistory: (_: unknown, __: unknown, ctx: Ctx) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return ctx.prisma.gameResult.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: "desc" },
      });
    },

    bestScore: (_: unknown, __: unknown, ctx: Ctx) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return ctx.prisma.gameResult.findFirst({
        where: { userId: ctx.userId },
        orderBy: { totalTimeMs: "asc" },
      });
    },

    leaderboard: async (_: unknown, __: unknown, ctx: Ctx) => {
      const results = await ctx.prisma.gameResult.findMany({
        orderBy: { totalTimeMs: "asc" },
        include: { user: { select: { username: true } } },
      });
      const seen = new Set<string>();
      const leaderboard: { username: string; bestTimeMs: number }[] = [];
      for (const r of results) {
        if (seen.has(r.userId)) continue;
        seen.add(r.userId);
        leaderboard.push({ username: r.user.username, bestTimeMs: r.totalTimeMs });
        if (leaderboard.length >= 10) break;
      }
      return leaderboard;
    },
  },

  Mutation: {
    register: async (_: unknown, args: { username: string; password: string }, ctx: Ctx) => {
      if (args.username.length < 3) throw new Error("Username must be at least 3 characters");
      if (args.password.length < 6) throw new Error("Password must be at least 6 characters");

      const existing = await ctx.prisma.user.findUnique({ where: { username: args.username } });
      if (existing) throw new Error("Username already taken");

      const passwordHash = await hashPassword(args.password);
      const user = await ctx.prisma.user.create({
        data: { username: args.username, passwordHash },
      });

      return { token: signToken(user.id), user };
    },

    login: async (_: unknown, args: { username: string; password: string }, ctx: Ctx) => {
      const user = await ctx.prisma.user.findUnique({ where: { username: args.username } });
      if (!user) throw new Error("Invalid credentials");

      const valid = await verifyPassword(args.password, user.passwordHash);
      if (!valid) throw new Error("Invalid credentials");

      return { token: signToken(user.id), user };
    },

    saveGameResult: (
      _: unknown,
      args: { totalTimeMs: number; correctChars: number; wrongAttempts: number; penaltyMs: number },
      ctx: Ctx
    ) => {
      if (!ctx.userId) throw new Error("Not authenticated");

      const { totalTimeMs, correctChars, wrongAttempts, penaltyMs } = args;

      if (totalTimeMs <= 0 || correctChars < 0 || wrongAttempts < 0 || penaltyMs < 0) {
        throw new Error("Game result values must be non-negative");
      }
      if (correctChars !== 20) {
        throw new Error("correctChars must equal 20 (full game)");
      }
      if (penaltyMs !== wrongAttempts * 500) {
        throw new Error("penaltyMs must equal wrongAttempts * 500");
      }

      return ctx.prisma.gameResult.create({
        data: { ...args, userId: ctx.userId },
      });
    },
  },
};