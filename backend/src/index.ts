import { createYoga, createSchema } from "graphql-yoga";
import { createServer } from "node:http";
import { typeDefs, resolvers } from "./schema";
import { prisma } from "./db";
import { verifyToken } from "./auth";

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  maskedErrors: process.env.NODE_ENV === "production",
  context: ({ request }) => {
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const payload = token ? verifyToken(token) : null;
    return { prisma, userId: payload?.userId ?? null };
  },
});

const server = createServer(yoga);
server.listen(4000, () => {
  console.log("GraphQL server: http://localhost:4000/graphql");
});