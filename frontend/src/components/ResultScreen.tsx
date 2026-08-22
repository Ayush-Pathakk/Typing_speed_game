import type { GameResult } from "../lib/game";

export function ResultScreen({
  result,
  isNewBest,
  bestTimeMs,
  onRestart,
  onMenu,
}: {
  result: GameResult;
  isNewBest: boolean;
  bestTimeMs: number | null;
  onRestart: () => void;
  onMenu: () => void;
}) {
  return (
    <div className="app-shell">
      <div className="panel">
        <h1 className={`result-title ${isNewBest ? "success" : "failure"}`}>
          {isNewBest ? "🏆 SUCCESS!" : "TRY AGAIN"}
        </h1>
        <div className="stat-row"><span>Time</span><span>{(result.totalTimeMs / 1000).toFixed(2)}s</span></div>
        <div className="stat-row">
          <span>Wrong attempts</span>
          <span>{result.wrongAttempts} (+{(result.penaltyMs / 1000).toFixed(1)}s)</span>
        </div>
        {bestTimeMs !== null && (
          <div className="stat-row"><span>Best</span><span>{(bestTimeMs / 1000).toFixed(2)}s</span></div>
        )}
        <button className="btn" onClick={onRestart} style={{ marginTop: 16, width: "100%", marginBottom: 12 }}>
          PLAY AGAIN
        </button>
        <button className="btn btn-secondary" onClick={onMenu} style={{ width: "100%" }}>
          MENU
        </button>
      </div>
    </div>
  );
}