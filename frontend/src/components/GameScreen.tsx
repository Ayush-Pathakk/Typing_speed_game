import { useState, useEffect, useRef, useCallback } from "react";
import { generateSequence, isCorrectKey, computeResult, type GameResult } from "../lib/game";

export function GameScreen({ onComplete }: { onComplete: (result: GameResult) => void }) {
  const [sequence] = useState(() => generateSequence(20));
  const [index, setIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [started, setStarted] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!started || finishedRef.current) return;
    const interval = setInterval(() => {
      if (startTimeRef.current !== null) {
        setElapsedMs(Date.now() - startTimeRef.current);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [started]);

  const finish = useCallback(() => {
    if (finishedRef.current || startTimeRef.current === null) return;
    finishedRef.current = true;
    const rawTimeMs = Date.now() - startTimeRef.current;
    onComplete(computeResult(rawTimeMs, wrongAttempts, sequence.length));
  }, [wrongAttempts, sequence.length, onComplete]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (finishedRef.current) return;
      const key = e.key.toUpperCase();
      if (key.length !== 1 || key < "A" || key > "Z") return;

      if (!started) {
        setStarted(true);
        startTimeRef.current = Date.now();
      }

      if (isCorrectKey(key, sequence[index])) {
        setIndex((i) => i + 1);
      } else {
        setWrongAttempts((w) => w + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, sequence, started]);

  useEffect(() => {
    if (index === sequence.length) {
      finish();
    }
  }, [index, sequence.length, finish]);

  const progressPct = (index / sequence.length) * 100;

  return (
    <div className="app-shell">
      <div className="panel">
        <div className="stat-row">
          <span>⏱ {(elapsedMs / 1000).toFixed(2)}s</span>
          <span>{index} / {sequence.length}</span>
        </div>

        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="letter-screen">
          <div className="letter-display">{sequence[index] ?? "🏆"}</div>
        </div>

        <div className="stat-row">
          <span>Wrong: {wrongAttempts}</span>
          {!started && <span>Press a letter to start</span>}
        </div>
      </div>
    </div>
  );
}