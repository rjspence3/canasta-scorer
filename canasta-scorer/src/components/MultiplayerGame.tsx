"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { MultiplayerGameState, MyTeam } from "@/lib/multiplayerTypes";
import type { HandEntry } from "@/lib/types";
import { DEFAULT_HAND_ENTRY } from "@/lib/types";
import { HouseRules, DEFAULT_HOUSE_RULES, isDefaultRules } from "@/lib/houseRules";
import { calculateHandScore } from "@/lib/scoring";
import { HandScoringForm } from "@/components/HandScoringForm";
import { ScoreBoard } from "@/components/ScoreBoard";
import { HandHistory } from "@/components/HandHistory";
import { WinCelebration } from "@/components/WinCelebration";
import { HouseRulesSetup } from "@/components/HouseRulesSetup";
import type { HandResult } from "@/lib/types";

type Phase =
  | "lobby"
  | "create_form"
  | "code_display"
  | "join_form"
  | "team_select"
  | "playing"
  | "gameover";

interface MultiplayerGameProps {
  onBack: () => void;
  initialJoinCode?: string;
}

const SUITS = ["♠", "♥", "♦", "♣"];

function generateRoomCode(): string {
  // Omit I and O to avoid confusion with 1 and 0
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function freshEntry(): HandEntry {
  return { ...DEFAULT_HAND_ENTRY };
}

function makeInitialGameState(
  teamNames: [string, string],
  houseRules: HouseRules
): MultiplayerGameState {
  return {
    team_names: teamNames,
    target_score: houseRules.targetScore,
    house_rules: houseRules,
    cumulative_scores: [0, 0],
    hands: [],
    current_hand: {
      team0_submitted: false,
      team1_submitted: false,
      team0_entry: null,
      team1_entry: null,
    },
    status: "active",
  };
}

function processCompletedHand(
  state: MultiplayerGameState
): MultiplayerGameState {
  const { current_hand, cumulative_scores, hands, target_score, house_rules } = state;
  if (!current_hand.team0_entry || !current_hand.team1_entry) return state;

  const rules = house_rules ?? DEFAULT_HOUSE_RULES;

  const handScores: [number, number] = [
    calculateHandScore(current_hand.team0_entry, rules),
    calculateHandScore(current_hand.team1_entry, rules),
  ];
  const newCumulative: [number, number] = [
    cumulative_scores[0] + handScores[0],
    cumulative_scores[1] + handScores[1],
  ];
  const handResult: HandResult = {
    handNumber: hands.length + 1,
    entries: [current_hand.team0_entry, current_hand.team1_entry],
    handScores,
    cumulativeScores: newCumulative,
  };

  const gameOver =
    newCumulative[0] >= target_score || newCumulative[1] >= target_score;

  return {
    ...state,
    cumulative_scores: newCumulative,
    hands: [...hands, handResult],
    current_hand: {
      team0_submitted: false,
      team1_submitted: false,
      team0_entry: null,
      team1_entry: null,
    },
    status: gameOver ? "gameover" : "active",
  };
}

function SuitWatermarks() {
  return (
    <>
      {SUITS.map((suit, i) => {
        const isRed = suit === "♥" || suit === "♦";
        return (
          <span
            key={i}
            className="absolute select-none pointer-events-none font-black"
            style={{
              fontSize: "5rem",
              top: i < 2 ? "8%" : "55%",
              left: i % 2 === 0 ? "4%" : "78%",
              transform: `rotate(${[-12, 15, 20, -18][i]}deg)`,
              color: isRed ? "#ef4444" : "white",
              opacity: isRed ? 0.08 : 0.055,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {suit}
          </span>
        );
      })}
    </>
  );
}

export function MultiplayerGame({ onBack, initialJoinCode }: MultiplayerGameProps) {
  const [phase, setPhase] = useState<Phase>(initialJoinCode ? "join_form" : "lobby");
  const [roomCode, setRoomCode] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState(initialJoinCode ?? "");
  const [myTeam, setMyTeam] = useState<MyTeam>(0);
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [myEntry, setMyEntry] = useState<HandEntry>(freshEntry());
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [team1Name, setTeam1Name] = useState("Team 1");
  const [team2Name, setTeam2Name] = useState("Team 2");
  const [houseRules, setHouseRules] = useState<HouseRules>(DEFAULT_HOUSE_RULES);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const joinInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to realtime updates while playing
  useEffect(() => {
    if (!supabase || !roomCode || phase !== "playing") return;

    const channel = supabase
      .channel(`game:${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "canasta_games",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          const row = payload.new as { state: MultiplayerGameState };
          setGameState(row.state);
          if (row.state.status === "gameover") {
            setPhase("gameover");
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [roomCode, phase]);

  // Auto-focus the join input when entering join_form (including on initial mount from URL)
  useEffect(() => {
    if (phase === "join_form" && joinInputRef.current) {
      joinInputRef.current.focus();
    }
  }, [phase]);

  // Reset entry form when a new hand starts (hands.length increases)
  const handCount = gameState?.hands.length ?? 0;
  useEffect(() => {
    setMyEntry(freshEntry());
    setHasSubmitted(false);
  }, [handCount]);

  const writeGameState = useCallback(
    async (newState: MultiplayerGameState) => {
      if (!supabase || !roomCode) return;
      await supabase
        .from("canasta_games")
        .update({ state: newState, updated_at: new Date().toISOString() })
        .eq("room_code", roomCode);
    },
    [roomCode]
  );

  const handleCreateGame = async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    try {
      const code = generateRoomCode();
      const state = makeInitialGameState(
        [team1Name.trim() || "Team 1", team2Name.trim() || "Team 2"],
        houseRules
      );
      const { error: dbError } = await supabase.from("canasta_games").insert({
        room_code: code,
        state,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (dbError) throw dbError;
      setRoomCode(code);
      setGameState(state);
      setPhase("code_display");
    } catch {
      setError("Failed to create game. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!supabase) return;
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length !== 4) {
      setError("Enter a 4-letter room code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: dbError } = await supabase
        .from("canasta_games")
        .select("state, created_at")
        .eq("room_code", code)
        .single();

      if (dbError || !data) {
        setError("Room not found. Check the code and try again.");
        return;
      }

      const createdAt = new Date(data.created_at as string);
      const hoursSince = (Date.now() - createdAt.getTime()) / 3_600_000;
      if (hoursSince > 24) {
        setError("This room has expired (rooms last 24 hours).");
        return;
      }

      setRoomCode(code);
      setGameState(data.state as MultiplayerGameState);
      setPhase("team_select");
    } catch {
      setError("Failed to join game. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickTeam = (team: MyTeam) => {
    setMyTeam(team);
    setPhase("playing");
  };

  const handleSubmitMyEntry = async () => {
    if (!supabase || !gameState || !roomCode || submitting) return;
    setSubmitting(true);
    try {
      // Fetch latest state to avoid overwriting the other team's submission
      const { data } = await supabase
        .from("canasta_games")
        .select("state")
        .eq("room_code", roomCode)
        .single();

      const base = (data?.state as MultiplayerGameState | undefined) ?? gameState;
      const updatedHand = { ...base.current_hand };

      if (myTeam === 0) {
        updatedHand.team0_entry = myEntry;
        updatedHand.team0_submitted = true;
      } else {
        updatedHand.team1_entry = myEntry;
        updatedHand.team1_submitted = true;
      }

      let newState: MultiplayerGameState = { ...base, current_hand: updatedHand };

      // If both entries are in, compute the hand result
      if (updatedHand.team0_submitted && updatedHand.team1_submitted) {
        newState = processCompletedHand(newState);
      }

      setHasSubmitted(true);
      setGameState(newState);
      await writeGameState(newState);

      if (newState.status === "gameover") {
        setPhase("gameover");
      }
    } catch {
      setError("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewGame = async () => {
    if (supabase && roomCode) {
      await supabase.from("canasta_games").delete().eq("room_code", roomCode);
    }
    onBack();
  };

  const handleShareInvite = async () => {
    const inviteUrl = `https://canasta-scorer.vercel.app?join=${roomCode}`;
    const shareText = `Join my canasta game! Use code ${roomCode} or click: ${inviteUrl}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // User cancelled — silently ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable — silently ignore
      }
    }
  };

  // ── Not configured ──────────────────────────────────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5"
        style={{ backgroundColor: "#F8F9FC" }}
      >
        <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">⚡</div>
          <h2 className="text-xl font-bold" style={{ color: "#111827" }}>
            Multiplayer Not Configured
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
            Add{" "}
            <code
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: "rgba(99,102,241,0.1)", color: "#4338CA" }}
            >
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: "rgba(99,102,241,0.1)", color: "#4338CA" }}
            >
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            to your environment to enable multiplayer.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="w-full h-12 rounded-xl font-semibold text-white transition-all btn-tactile"
            style={{ background: "#6366F1" }}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // ── Lobby ───────────────────────────────────────────────────────────────────
  if (phase === "lobby") {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8F9FC" }}>
        <div className="felt-header relative flex flex-col items-center justify-center pt-14 pb-10 px-6 overflow-hidden">
          <SuitWatermarks />
          <div className="relative mb-4">
            <div
              className="w-16 h-20 rounded-xl absolute"
              style={{
                background: "rgba(255,255,255,0.15)",
                transform: "rotate(-8deg) translate(-4px, 3px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
            <div
              className="w-16 h-20 rounded-xl relative flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,255,255,0.3)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              <span className="text-4xl font-black" style={{ color: "#6366F1" }}>
                ⇌
              </span>
            </div>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight text-white mt-2"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          >
            Multiplayer
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            Two phones, one game
          </p>
        </div>

        <div className="flex-1 px-5 pt-6 pb-10 max-w-md mx-auto w-full space-y-4">
          <button
            type="button"
            onClick={() => setPhase("create_form")}
            className="w-full h-16 rounded-xl text-white text-base font-bold tracking-tight transition-all btn-tactile flex flex-col items-center justify-center gap-0.5"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #EA6C10 100%)",
              boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
            }}
          >
            <span>🎮 Create Game</span>
            <span className="text-xs font-normal opacity-80">Start a new room</span>
          </button>

          <button
            type="button"
            onClick={() => { setPhase("join_form"); setError(""); }}
            className="w-full h-16 rounded-xl text-base font-bold tracking-tight transition-all btn-tactile flex flex-col items-center justify-center gap-0.5 border"
            style={{
              background: "white",
              border: "1.5px solid rgba(99,102,241,0.25)",
              color: "#6366F1",
              boxShadow: "0 4px 12px rgba(99,102,241,0.1)",
            }}
          >
            <span>🔗 Join Game</span>
            <span className="text-xs font-normal opacity-70">Enter a room code</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full h-11 rounded-xl text-sm font-semibold transition-all btn-tactile border"
            style={{ borderColor: "rgba(107,114,128,0.2)", color: "#6B7280", background: "white" }}
          >
            ← Single Device
          </button>
        </div>
      </div>
    );
  }

  // ── Create Form ─────────────────────────────────────────────────────────────
  if (phase === "create_form") {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8F9FC" }}>
        <div className="felt-header flex items-center justify-between px-5 pt-12 pb-6">
          <button
            type="button"
            onClick={() => { setPhase("lobby"); setError(""); }}
            className="text-white/80 text-sm font-medium"
          >
            ← Back
          </button>
          <h2 className="text-lg font-bold text-white">Create Game</h2>
          <div className="w-12" />
        </div>

        <div className="flex-1 px-5 pt-6 pb-10 max-w-md mx-auto w-full">
          <div className="glass-card p-6 space-y-5">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>
              Team Names
            </p>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="mp-team1"
                  className="text-sm font-medium mb-1.5 block"
                  style={{ color: "#374151" }}
                >
                  <span className="mr-1.5" style={{ color: "#6366F1" }}>♠♣</span>
                  First Team
                </label>
                <input
                  id="mp-team1"
                  type="text"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="Team 1"
                  className="w-full h-12 px-4 rounded-xl border text-base font-medium outline-none transition-all"
                  style={{ borderColor: "rgba(99,102,241,0.2)", background: "white", color: "#111827" }}
                />
              </div>
              <div>
                <label
                  htmlFor="mp-team2"
                  className="text-sm font-medium mb-1.5 block"
                  style={{ color: "#374151" }}
                >
                  <span className="mr-1.5" style={{ color: "#dc2626" }}>♥♦</span>
                  Second Team
                </label>
                <input
                  id="mp-team2"
                  type="text"
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="Team 2"
                  className="w-full h-12 px-4 rounded-xl border text-base font-medium outline-none transition-all"
                  style={{ borderColor: "rgba(99,102,241,0.2)", background: "white", color: "#111827" }}
                />
              </div>
            </div>

            {/* House Rules */}
            <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }} />
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>
              Game Settings
            </p>
            <HouseRulesSetup rules={houseRules} onChange={setHouseRules} />

            {error && (
              <p className="text-sm text-center" style={{ color: "#DC2626" }}>{error}</p>
            )}

            <button
              type="button"
              onClick={handleCreateGame}
              disabled={loading}
              className="w-full h-14 rounded-xl text-white text-base font-bold tracking-tight transition-all btn-tactile"
              style={{
                background: loading
                  ? "rgba(249,115,22,0.5)"
                  : "linear-gradient(135deg, #F97316 0%, #EA6C10 100%)",
                boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
              }}
            >
              {loading ? "Creating…" : "Create Game →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Code Display (creator waits, picks team) ────────────────────────────────
  if (phase === "code_display" && gameState) {
    const rulesLabel = isDefaultRules(gameState.house_rules ?? DEFAULT_HOUSE_RULES)
      ? "Standard rules"
      : "Custom rules";

    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8F9FC" }}>
        <div className="felt-header flex items-center justify-center px-5 pt-12 pb-6">
          <h2 className="text-lg font-bold text-white">Share This Code</h2>
        </div>

        <div className="flex-1 px-5 pt-6 pb-10 max-w-md mx-auto w-full space-y-5">
          {/* Room code card */}
          <div className="glass-card p-6 text-center space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#6B7280" }}>
              Room Code
            </p>
            <div
              className="text-6xl font-black tracking-[0.2em] tabular-nums"
              style={{ color: "#6366F1", letterSpacing: "0.25em" }}
            >
              {roomCode}
            </div>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Tell the other team to enter this code
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  color: "#6366F1",
                }}
              >
                {rulesLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={handleShareInvite}
              className="w-full h-12 rounded-xl text-white text-sm font-bold tracking-tight transition-all btn-tactile"
              style={{
                background: copied
                  ? "#16a34a"
                  : "#6366F1",
                boxShadow: copied
                  ? "0 4px 12px rgba(22,163,74,0.3)"
                  : "0 4px 12px rgba(99,102,241,0.25)",
              }}
            >
              {copied
                ? "✅ Copied!"
                : typeof navigator !== "undefined" && typeof navigator.share === "function"
                  ? "📱 Text invite"
                  : "📋 Copy invite link"}
            </button>
          </div>

          {/* Team picker */}
          <div className="glass-card p-6 space-y-4">
            <p className="text-sm font-semibold text-center" style={{ color: "#374151" }}>
              Which team are you?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(gameState.team_names as [string, string]).map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePickTeam(i as MyTeam)}
                  className="h-16 rounded-xl border-2 text-sm font-bold transition-all btn-tactile"
                  style={{
                    background: "white",
                    borderColor: i === 0 ? "rgba(99,102,241,0.3)" : "rgba(220,38,38,0.3)",
                    color: i === 0 ? "#4338CA" : "#991B1B",
                  }}
                >
                  {i === 0 ? "♠♣ " : "♥♦ "}
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Join Form ───────────────────────────────────────────────────────────────
  if (phase === "join_form") {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8F9FC" }}>
        <div className="felt-header flex items-center justify-between px-5 pt-12 pb-6">
          <button
            type="button"
            onClick={() => { setPhase("lobby"); setError(""); }}
            className="text-white/80 text-sm font-medium"
          >
            ← Back
          </button>
          <h2 className="text-lg font-bold text-white">Join Game</h2>
          <div className="w-12" />
        </div>

        <div className="flex-1 px-5 pt-6 pb-10 max-w-md mx-auto w-full">
          <div className="glass-card p-6 space-y-5">
            <div>
              <label
                htmlFor="room-code-input"
                className="text-sm font-medium mb-2 block"
                style={{ color: "#374151" }}
              >
                Enter Room Code
              </label>
              <input
                ref={joinInputRef}
                id="room-code-input"
                type="text"
                value={roomCodeInput}
                onChange={(e) => {
                  setRoomCodeInput(e.target.value.toUpperCase().slice(0, 4));
                  setError("");
                }}
                placeholder="ABCD"
                maxLength={4}
                className="w-full h-16 px-4 rounded-xl border text-3xl font-black text-center tracking-[0.3em] uppercase outline-none transition-all"
                style={{
                  borderColor: error ? "rgba(220,38,38,0.4)" : "rgba(99,102,241,0.3)",
                  background: "white",
                  color: "#6366F1",
                }}
                autoCapitalize="characters"
                autoCorrect="off"
              />
            </div>

            {error && (
              <p className="text-sm text-center" style={{ color: "#DC2626" }}>{error}</p>
            )}

            <button
              type="button"
              onClick={handleJoinGame}
              disabled={loading || roomCodeInput.length !== 4}
              className="w-full h-14 rounded-xl text-white text-base font-bold tracking-tight transition-all btn-tactile"
              style={{
                background:
                  loading || roomCodeInput.length !== 4
                    ? "rgba(99,102,241,0.4)"
                    : "#6366F1",
                boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
              }}
            >
              {loading ? "Joining…" : "Join Game →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Team Select (joiner) ────────────────────────────────────────────────────
  if (phase === "team_select" && gameState) {
    const rulesLabel = isDefaultRules(gameState.house_rules ?? DEFAULT_HOUSE_RULES)
      ? "Standard rules"
      : "Custom rules";

    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8F9FC" }}>
        <div className="felt-header flex items-center justify-center px-5 pt-12 pb-6">
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">Joined Room</h2>
            <p className="text-white/60 text-sm font-mono tracking-widest mt-0.5">{roomCode}</p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-6 pb-10 max-w-md mx-auto w-full">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: "#374151" }}>
                Which team are you?
              </p>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  color: "#6366F1",
                }}
              >
                {rulesLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(gameState.team_names as [string, string]).map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePickTeam(i as MyTeam)}
                  className="h-16 rounded-xl border-2 text-sm font-bold transition-all btn-tactile"
                  style={{
                    background: "white",
                    borderColor: i === 0 ? "rgba(99,102,241,0.3)" : "rgba(220,38,38,0.3)",
                    color: i === 0 ? "#4338CA" : "#991B1B",
                  }}
                >
                  {i === 0 ? "♠♣ " : "♥♦ "}
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Game Over ───────────────────────────────────────────────────────────────
  if (phase === "gameover" && gameState) {
    return (
      <WinCelebration
        teamNames={gameState.team_names}
        cumulativeScores={gameState.cumulative_scores}
        handCount={gameState.hands.length}
        onNewGame={handleNewGame}
      />
    );
  }

  // ── Playing ─────────────────────────────────────────────────────────────────
  if (phase === "playing" && gameState) {
    const hand = gameState.current_hand;
    const otherTeam: MyTeam = myTeam === 0 ? 1 : 0;
    const otherTeamName = gameState.team_names[otherTeam];
    const myTeamName = gameState.team_names[myTeam];
    const otherEntry = myTeam === 0 ? hand.team1_entry : hand.team0_entry;
    const otherTeamWentOut =
      otherEntry !== null && otherEntry.goingOut !== "none";
    const handNumber = gameState.hands.length + 1;
    const activeRules = gameState.house_rules ?? DEFAULT_HOUSE_RULES;

    return (
      <div className="min-h-screen pb-36" style={{ backgroundColor: "#F8F9FC" }}>
        <ScoreBoard
          teamNames={gameState.team_names}
          cumulativeScores={gameState.cumulative_scores}
          targetScore={gameState.target_score}
          handCount={gameState.hands.length}
          houseRules={activeRules}
        />

        <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
          {/* Hand number header with room code */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#6B7280" }}
              >
                Hand {handNumber}
              </span>
              <div className="flex-1 h-px w-8" style={{ background: "rgba(99,102,241,0.1)" }} />
            </div>
            <span
              className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
              style={{ background: "rgba(99,102,241,0.08)", color: "#6366F1" }}
            >
              {roomCode}
            </span>
          </div>

          {/* My team's form or waiting indicator */}
          {hasSubmitted ? (
            <div
              className="glass-card p-6 flex flex-col items-center gap-3 text-center"
              style={{ minHeight: "140px", justifyContent: "center" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ background: "#6366F1" }}
                />
                <p className="text-base font-semibold" style={{ color: "#374151" }}>
                  Waiting for {otherTeamName}…
                </p>
              </div>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>
                {myTeamName}&apos;s entry has been submitted
              </p>
            </div>
          ) : (
            <div className="glass-card p-5">
              <HandScoringForm
                teamName={myTeamName}
                teamIndex={myTeam}
                entry={myEntry}
                otherTeamWentOut={otherTeamWentOut}
                onChange={setMyEntry}
                houseRules={activeRules}
              />
            </div>
          )}

          <HandHistory hands={gameState.hands} teamNames={gameState.team_names} />
        </div>

        {/* Submit button */}
        {!hasSubmitted && (
          <div
            className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-6"
            style={{
              background: "rgba(248,249,252,0.96)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(99,102,241,0.1)",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div className="max-w-lg mx-auto space-y-2.5">
              {error && (
                <p className="text-sm text-center" style={{ color: "#DC2626" }}>{error}</p>
              )}
              <button
                type="button"
                onClick={handleSubmitMyEntry}
                disabled={submitting}
                className="w-full h-14 rounded-xl text-white text-base font-bold tracking-tight transition-all btn-tactile"
                style={{
                  background: submitting
                    ? "rgba(249,115,22,0.5)"
                    : "linear-gradient(135deg, #F97316 0%, #EA6C10 100%)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
                }}
              >
                {submitting ? "Submitting…" : `Submit ${myTeamName}'s Hand`}
              </button>
              <button
                type="button"
                onClick={handleNewGame}
                className="w-full h-11 rounded-xl text-sm font-semibold transition-all btn-tactile border"
                style={{
                  borderColor: "rgba(107,114,128,0.2)",
                  color: "#6B7280",
                  background: "white",
                }}
              >
                Leave Game
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
