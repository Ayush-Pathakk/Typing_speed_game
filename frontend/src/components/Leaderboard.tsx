import { useEffect, useState } from "react";
import { getClient } from "../lib/graphql";
import { LEADERBOARD } from "../lib/queries";

type Entry = { username: string; bestTimeMs: number };

export function Leaderboard({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClient()
      .request<{ leaderboard: Entry[] }>(LEADERBOARD)
      .then((res) => setEntries(res.leaderboard))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <div className="panel">
        <h2 className="title" style={{ fontSize: 16 }}>🏆 LEADERBOARD</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && (
          <table className="leaderboard">
            <thead>
              <tr><th>Rank</th><th>Player</th><th style={{ textAlign: "right" }}>Time</th></tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.username}>
                  <td>{i + 1}</td>
                  <td>{e.username}</td>
                  <td style={{ textAlign: "right" }}>{(e.bestTimeMs / 1000).toFixed(2)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: 20, width: "100%" }}>
          BACK
        </button>
      </div>
    </div>
  );
}