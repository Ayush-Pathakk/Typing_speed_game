const KEY = "typing-game-best-ms";

export function getLocalBest(): number | null {
  const raw = localStorage.getItem(KEY);
  return raw ? Number(raw) : null;
}

export function setLocalBest(ms: number) {
  localStorage.setItem(KEY, String(ms));
}

export function isNewBest(prevBest: number | null, totalTimeMs: number): boolean {
  return prevBest === null || totalTimeMs < prevBest;
}