import { useState, useCallback } from "react";

const INITIAL_STATE = {
  tournamentName: "COC TOURNAMENT 2025",
  teamA: {
    name: "Team Alpha",
    players: Array.from({ length: 8 }, (_, i) => ({ id: `A${i + 1}`, name: `A${i + 1}` })),
  },
  teamB: {
    name: "Team Bravo",
    players: Array.from({ length: 8 }, (_, i) => ({ id: `B${i + 1}`, name: `B${i + 1}` })),
  },
  matchups: Array.from({ length: 8 }, (_, i) => ({
    id: i,
    matches: [
      { a: "", b: "" },
      { a: "", b: "" },
      { a: "", b: "" },
    ],
  })),
};

const sumPct = (matches, key) => matches.reduce((acc, m) => acc + (parseFloat(m[key]) || 0), 0);

// ── Editable inline text ──────────────────────────────────────────────────────
const EditableText = ({ value, onChange, style = {}, placeholder, center }) => {
  const [editing, setEditing] = useState(false);
  if (editing)
    return (
      <input
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid #f5c842",
          borderRadius: 4,
          color: "#fff",
          fontFamily: "inherit",
          fontSize: "inherit",
          padding: "2px 6px",
          outline: "none",
          textAlign: center ? "center" : "left",
          width: "100%",
          ...style,
        }}
      />
    );
  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{
        cursor: "pointer",
        borderBottom: "1px dashed rgba(245,200,66,0.35)",
        display: "inline-block",
        textAlign: center ? "center" : "left",
        ...style,
      }}>
      {value || <span style={{ opacity: 0.35 }}>{placeholder}</span>}
    </span>
  );
};

// ── Percentage input ──────────────────────────────────────────────────────────
const PctInput = ({ value, onChange, color }) => (
  <input
    type="number"
    min={0}
    max={100}
    value={value}
    placeholder="0"
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: 56,
      background: "rgba(255,255,255,0.06)",
      border: `1px solid ${color}44`,
      borderRadius: 6,
      color,
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: 15,
      fontWeight: 700,
      padding: "4px 6px",
      outline: "none",
      textAlign: "center",
    }}
  />
);

// ── Single matchup card (Ax vs Bx) ────────────────────────────────────────────
const MatchupCard = ({ index, playerA, playerB, matchup, onMatchChange }) => {
  const aTotal = sumPct(matchup.matches, "a");
  const bTotal = sumPct(matchup.matches, "b");
  const hasData = aTotal > 0 || bTotal > 0;
  const aWins = hasData && aTotal > bTotal;
  const bWins = hasData && bTotal > aTotal;
  const draw = hasData && aTotal === bTotal;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${aWins ? "rgba(121,212,241,0.35)" : bWins ? "rgba(249,123,107,0.35)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        position: "relative",
        transition: "border-color 0.3s",
      }}>
      {/* Badge */}
      <div
        style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1a1d24",
          border: "1px solid rgba(245,200,66,0.3)",
          borderRadius: 20,
          padding: "1px 10px",
          fontSize: 10,
          fontFamily: "'Cinzel', serif",
          color: "#f5c842",
          letterSpacing: 1,
        }}>
        MATCH {index + 1}
      </div>

      {/* Player names */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 4 }}>
        <span style={{ color: "#79d4f1", fontFamily: "'Cinzel', serif", fontSize: 13, flex: 1 }}>{playerA.name}</span>
        <span style={{ color: "#f5c842", fontSize: 10, padding: "0 10px", fontFamily: "'Cinzel', serif" }}>VS</span>
        <span style={{ color: "#f97b6b", fontFamily: "'Cinzel', serif", fontSize: 13, flex: 1, textAlign: "right" }}>{playerB.name}</span>
      </div>

      {/* 3 match rows */}
      {matchup.matches.map((m, mi) => {
        const t = (parseFloat(m.a) || 0) + (parseFloat(m.b) || 0);
        const aPct = t > 0 ? ((parseFloat(m.a) || 0) / t) * 100 : 50;
        return (
          <div key={mi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <PctInput value={m.a} onChange={(v) => onMatchChange(mi, "a", v)} color="#79d4f1" />
            <span style={{ fontSize: 10, color: "#555" }}>%</span>
            <div style={{ flex: 1, position: "relative", height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 4 }}>
              {t > 0 && (
                <>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${aPct}%`, background: "linear-gradient(90deg,#79d4f1,#4ab8e0)", borderRadius: 4, transition: "width 0.4s" }} />
                  <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: `${100 - aPct}%`, background: "linear-gradient(90deg,#f97b6b,#e05a45)", borderRadius: 4, transition: "width 0.4s" }} />
                </>
              )}
            </div>
            <span style={{ fontSize: 10, color: "#555" }}>%</span>
            <PctInput value={m.b} onChange={(v) => onMatchChange(mi, "b", v)} color="#f97b6b" />
          </div>
        );
      })}

      {/* Totals row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>
        <span style={{ color: "#79d4f1", fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14 }}>{aTotal.toFixed(1)}%</span>
        {hasData && (
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Cinzel', serif",
              letterSpacing: 1,
              color: draw ? "#aaa" : "#f5c842",
              background: "rgba(0,0,0,0.3)",
              padding: "2px 8px",
              borderRadius: 20,
            }}>
            {aWins ? `⚔️ ${playerA.name}` : bWins ? `⚔️ ${playerB.name}` : "🤝 DRAW"}
          </span>
        )}
        <span style={{ color: "#f97b6b", fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14 }}>{bTotal.toFixed(1)}%</span>
      </div>
    </div>
  );
};

// ── Grand final banner ────────────────────────────────────────────────────────
const GrandResult = ({ teamAName, teamBName, matchups }) => {
  let aTotal = 0,
    bTotal = 0,
    aMatchWins = 0,
    bMatchWins = 0;
  matchups.forEach((mu) => {
    const a = sumPct(mu.matches, "a");
    const b = sumPct(mu.matches, "b");
    aTotal += a;
    bTotal += b;
    if (a > b) aMatchWins++;
    else if (b > a) bMatchWins++;
  });

  const hasData = aTotal > 0 || bTotal > 0;
  if (!hasData) return null;

  const winner = aTotal > bTotal ? teamAName : bTotal > aTotal ? teamBName : null;
  const total = aTotal + bTotal;
  const aPct = total > 0 ? (aTotal / total) * 100 : 50;

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "32px auto 0",
        background: "linear-gradient(135deg, rgba(245,200,66,0.07), rgba(255,255,255,0.03))",
        border: "1px solid rgba(245,200,66,0.4)",
        borderRadius: 16,
        padding: "24px 28px",
        textAlign: "center",
        boxShadow: "0 0 40px rgba(245,200,66,0.08)",
      }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#f5c842", fontFamily: "'Cinzel', serif", marginBottom: 10 }}>TOURNAMENT RESULT</div>

      {/* Team totals */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ color: "#79d4f1", fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700 }}>{teamAName}</div>
          <div style={{ color: "#79d4f1", fontSize: 13, marginTop: 2 }}>
            {aMatchWins} matchup wins • {aTotal.toFixed(1)}%
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#f5c842", fontFamily: "'Cinzel', serif" }}>VS</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#f97b6b", fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700 }}>{teamBName}</div>
          <div style={{ color: "#f97b6b", fontSize: 13, marginTop: 2 }}>
            {bMatchWins} matchup wins • {bTotal.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Big progress bar */}
      <div style={{ height: 12, background: "rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ width: `${aPct}%`, background: "linear-gradient(90deg,#79d4f1,#4ab8e0)", transition: "width 0.5s" }} />
          <div style={{ flex: 1, background: "linear-gradient(90deg,#f97b6b,#e05a45)", transition: "width 0.5s" }} />
        </div>
      </div>

      {/* Winner */}
      {winner ? (
        <div>
          <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 3, fontFamily: "'Cinzel', serif", marginBottom: 6 }}>WINNER</div>
          <div
            style={{
              fontSize: 32,
              fontFamily: "'Cinzel', serif",
              fontWeight: 900,
              color: "#f5c842",
              textShadow: "0 0 30px rgba(245,200,66,0.6)",
              letterSpacing: 2,
            }}>
            🏆 {winner} 🏆
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 22, fontFamily: "'Cinzel', serif", color: "#aaa" }}>🤝 IT'S A DRAW</div>
      )}
    </div>
  );
};

// ── Main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(INITIAL_STATE);

  const setTournamentName = (v) => setState((s) => ({ ...s, tournamentName: v }));
  const setTeamName = (team, v) => setState((s) => ({ ...s, [team]: { ...s[team], name: v } }));
  const setPlayerName = (team, idx, v) =>
    setState((s) => ({
      ...s,
      [team]: {
        ...s[team],
        players: s[team].players.map((p, i) => (i === idx ? { ...p, name: v } : p)),
      },
    }));
  const updateMatch = useCallback((mui, mi, side, val) => {
    setState((s) => ({
      ...s,
      matchups: s.matchups.map((mu, j) =>
        j !== mui
          ? mu
          : {
              ...mu,
              matches: mu.matches.map((m, k) => (k !== mi ? m : { ...m, [side]: val })),
            },
      ),
    }));
  }, []);

  const { tournamentName, teamA, teamB, matchups } = state;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0f14",
        backgroundImage: "radial-gradient(ellipse at 15% 15%, rgba(20,55,30,0.4) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(15,35,65,0.45) 0%, transparent 50%)",
        fontFamily: "'Rajdhani', sans-serif",
        color: "#fff",
        padding: "24px 16px 60px",
      }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 9, letterSpacing: 6, color: "#f5c842", fontFamily: "'Cinzel', serif", marginBottom: 6, opacity: 0.6 }}>⚔ CLASH OF CLANS ⚔</div>
        <h1 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: "clamp(20px, 5vw, 34px)", letterSpacing: 2, color: "#fff", textShadow: "0 0 30px rgba(245,200,66,0.4)" }}>
          <EditableText value={tournamentName} onChange={setTournamentName} placeholder="Tournament Name" center />
        </h1>
        <div style={{ fontSize: 11, color: "#555", marginTop: 5, letterSpacing: 2 }}>8 MATCHUPS • A1 vs B1 … A8 vs B8 • 3 MATCHES EACH</div>
        <div style={{ fontSize: 10, color: "#f5c842", opacity: 0.45, marginTop: 4, letterSpacing: 1 }}>✎ Click any name, title or % field to edit</div>
      </div>

      {/* ── TEAM HEADERS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          maxWidth: 860,
          margin: "0 auto 24px",
          alignItems: "center",
          gap: 16,
        }}>
        <div
          style={{
            background: "rgba(121,212,241,0.07)",
            border: "1px solid rgba(121,212,241,0.25)",
            borderRadius: 12,
            padding: "14px 20px",
            textAlign: "center",
          }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#79d4f1", marginBottom: 4, opacity: 0.7 }}>TEAM A</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: "#79d4f1" }}>
            <EditableText value={teamA.name} onChange={(v) => setTeamName("teamA", v)} placeholder="Team A Name" center />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", marginTop: 10 }}>
            {teamA.players.map((p, pi) => (
              <span key={p.id} style={{ fontSize: 11, padding: "2px 8px", background: "rgba(121,212,241,0.08)", borderRadius: 20, color: "#79d4f1", border: "1px solid rgba(121,212,241,0.2)" }}>
                <EditableText value={p.name} onChange={(v) => setPlayerName("teamA", pi, v)} placeholder={`A${pi + 1}`} />
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: "#f5c842", textAlign: "center" }}>VS</div>

        <div
          style={{
            background: "rgba(249,123,107,0.07)",
            border: "1px solid rgba(249,123,107,0.25)",
            borderRadius: 12,
            padding: "14px 20px",
            textAlign: "center",
          }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#f97b6b", marginBottom: 4, opacity: 0.7 }}>TEAM B</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: "#f97b6b" }}>
            <EditableText value={teamB.name} onChange={(v) => setTeamName("teamB", v)} placeholder="Team B Name" center />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", marginTop: 10 }}>
            {teamB.players.map((p, pi) => (
              <span key={p.id} style={{ fontSize: 11, padding: "2px 8px", background: "rgba(249,123,107,0.08)", borderRadius: 20, color: "#f97b6b", border: "1px solid rgba(249,123,107,0.2)" }}>
                <EditableText value={p.name} onChange={(v) => setPlayerName("teamB", pi, v)} placeholder={`B${pi + 1}`} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MATCHUP CARDS GRID ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          maxWidth: 860,
          margin: "0 auto",
        }}>
        {matchups.map((mu, mui) => (
          <MatchupCard key={mu.id} index={mui} playerA={teamA.players[mui]} playerB={teamB.players[mui]} matchup={mu} onMatchChange={(mi, side, val) => updateMatch(mui, mi, side, val)} />
        ))}
      </div>

      {/* ── GRAND RESULT ── */}
      <GrandResult teamAName={teamA.name} teamBName={teamB.name} matchups={matchups} />

      <div style={{ textAlign: "center", marginTop: 40, fontSize: 10, color: "#2a2d35", letterSpacing: 2 }}>COC TOURNAMENT MANAGER • ALL FIELDS EDITABLE</div>
    </div>
  );
}
