import { useState } from "react";
import { getClient } from "../lib/graphql";
import { LOGIN, REGISTER } from "../lib/queries";
import { useAuth } from "../context/AuthContext";

type AuthPayload = { token: string; user: { id: string; username: string } };

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const query = mode === "login" ? LOGIN : REGISTER;
      const res = await getClient().request<{ login?: AuthPayload; register?: AuthPayload }>(query, {
        username,
        password,
      });
      const payload = res.login ?? res.register!;
      login(payload.token, payload.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="panel">
        <h1 className="title">TYPING<br />SPEED GAME</h1>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "..." : mode === "login" ? "LOG IN" : "REGISTER"}
          </button>
        </form>
        <button className="link-btn" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}