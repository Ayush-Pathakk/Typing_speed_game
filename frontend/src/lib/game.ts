const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateSequence(length = 20): string[] {
  const seq: string[] = [];
  for (let i = 0; i < length; i++) {
    seq.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
  }
  return seq;
}

export const PENALTY_MS = 500;

export type GameResult = {
  totalTimeMs: number;
  correctChars: number;
  wrongAttempts: number;
  penaltyMs: number;
};

export function isCorrectKey(key: string, expected: string): boolean {
  return key.toUpperCase() === expected;
}

export function computeResult(rawTimeMs: number, wrongAttempts: number, correctChars: number): GameResult {
  const penaltyMs = wrongAttempts * PENALTY_MS;
  return { totalTimeMs: rawTimeMs + penaltyMs, correctChars, wrongAttempts, penaltyMs };
}