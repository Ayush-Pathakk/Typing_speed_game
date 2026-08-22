import { gql } from "graphql-request";

export const REGISTER = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      token
      user { id username }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user { id username }
    }
  }
`;

export const ME = gql`
  query Me {
    me { id username }
  }
`;

export const SAVE_GAME_RESULT = gql`
  mutation SaveGameResult($totalTimeMs: Int!, $correctChars: Int!, $wrongAttempts: Int!, $penaltyMs: Int!) {
    saveGameResult(totalTimeMs: $totalTimeMs, correctChars: $correctChars, wrongAttempts: $wrongAttempts, penaltyMs: $penaltyMs) {
      id totalTimeMs
    }
  }
`;

export const LEADERBOARD = gql`
  query Leaderboard {
    leaderboard { username bestTimeMs }
  }
`;