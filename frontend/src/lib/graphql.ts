import { GraphQLClient } from "graphql-request";

const endpoint = "http://localhost:4000/graphql";

export function getClient() {
  const token = localStorage.getItem("token");
  return new GraphQLClient(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
