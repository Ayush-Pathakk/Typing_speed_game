import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthScreen } from "./components/AuthScreen";
import { GameScreen } from "./components/GameScreen";
import { ResultScreen } from "./components/ResultScreen";
import { Leaderboard } from "./components/Leaderboard";
import { getLocalBest, setLocalBest, isNewBest } from "./lib/localBest";
import { getClient } from "./lib/graphql";
import { SAVE_GAME_RESULT } from "./lib/queries";
import type { GameResult } from "./lib/game";

type View = "menu" | "playing" | "result" | "leaderboard";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<View>("menu");
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [isBest, setIsBest] = useState(false);

  if (loading) return <div className="app-shell"><p>Loading...</p></div>;
  if (!user) return <AuthScreen />;

  async function handleComplete(result: GameResult) {
    const prevBest = getLocalBest();
    const newBest = isNewBest(prevBest, result.totalTimeMs);
    if (newBest) setLocalBest(result.totalTimeMs);

    setLastResult(result);
    setIsBest(newBest);
    setView("result");

    try {
      await getClient().request(SAVE_GAME_RESULT, result);
    } catch (err) {
      console.error("Failed to save game result:", err);
    }
  }

  if (view === "playing") return <GameScreen onComplete={handleComplete} />;

  if (view === "result" && lastResult) {
    return (
      <ResultScreen
        result={lastResult}
        isNewBest={isBest}
        bestTimeMs={getLocalBest()}
        onRestart={() => setView("playing")}
        onMenu={() => setView("menu")}
      />
    );
  }

  if (view === "leaderboard") return <Leaderboard onBack={() => setView("menu")} />;

  return (
    <div className="app-shell">
      <div className="panel">
        <h1 className="title" style={{ fontSize: 14 }}>{user.username}</h1>
        {getLocalBest() !== null && (
          <p style={{ color: "var(--gold)", marginBottom: 20 }}>
            🏆 Best: {(getLocalBest()! / 1000).toFixed(2)}s
          </p>
        )}
        <button className="btn" onClick={() => setView("playing")} style={{ width: "100%", marginBottom: 12 }}>
          START GAME
        </button>
        <button className="btn btn-secondary" onClick={() => setView("leaderboard")} style={{ width: "100%", marginBottom: 12 }}>
          LEADERBOARD
        </button>
        <button className="btn btn-danger" onClick={logout} style={{ width: "100%" }}>
          LOG OUT
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;