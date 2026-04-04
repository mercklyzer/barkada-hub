"use client";

import { useEffect, useState } from "react";
import { useWerewolfGame } from "@/hooks/useWerewolfGame";
import { DayAnnouncementScreen } from "./DayAnnouncementScreen";
import { DayVoteScreen } from "./DayVoteScreen";
import { DiscussionScreen } from "./DiscussionScreen";
import { EliminationScreen } from "./EliminationScreen";
import { GameOverScreen } from "./GameOverScreen";
import { JoinScreen } from "./JoinScreen";
import { LobbyScreen } from "./LobbyScreen";
import { NightScreen } from "./NightScreen";
import { RoleRevealScreen } from "./RoleRevealScreen";

export const WerewolfGame = () => {
  const game = useWerewolfGame();
  const {
    room,
    players,
    myPlayer,
    roleData,
    isHost,
    isLoading,
    error,
    isConnected,
    hasEyesClosed,
    hasSubmittedNightAction,
    hasVoted,
    seerPeekResult,
    playerId,
    createRoom,
    joinRoom,
    startGame,
    confirmRole,
    closeEyes,
    submitNightAction,
    submitDayVote,
    advancePhase,
    resetGame,
    leaveRoom,
  } = game;

  const [showReconnectBanner, setShowReconnectBanner] = useState(false);
  useEffect(() => {
    if (isConnected) {
      setShowReconnectBanner(false);
      return;
    }
    const timer = setTimeout(() => setShowReconnectBanner(true), 1500);
    return () => clearTimeout(timer);
  }, [isConnected]);

  const reconnectBanner =
    showReconnectBanner && room ? (
      <div className="fixed top-0 inset-x-0 z-50 bg-yellow-600 text-white text-center py-2 text-sm font-medium">
        Reconnecting...
      </div>
    ) : null;

  // ── No room yet → join / create ──────────────────────────────────────────
  if (!room) {
    return (
      <JoinScreen
        isLoading={isLoading}
        error={error}
        onJoin={joinRoom}
        onCreate={createRoom}
      />
    );
  }

  const phase = room.phase;

  // ── Lobby ────────────────────────────────────────────────────────────────
  if (phase === "lobby") {
    return (
      <>
        {reconnectBanner}
        <LobbyScreen
          room={room}
          players={players}
          myPlayerId={playerId}
          isHost={isHost}
          isLoading={isLoading}
          error={error}
          onStart={startGame}
          onLeave={leaveRoom}
        />
      </>
    );
  }

  // ── Role reveal ───────────────────────────────────────────────────────────
  if (phase === "role_reveal") {
    if (!roleData) {
      return (
        <>
          {reconnectBanner}
          <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-4xl animate-pulse">🂠</div>
              <p className="text-slate-400">Assigning roles...</p>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        {reconnectBanner}
        <RoleRevealScreen roleData={roleData} onConfirm={confirmRole} />
      </>
    );
  }

  // ── Night ─────────────────────────────────────────────────────────────────
  if (phase === "night" || phase === "night_resolving") {
    const alivePlayers = players.filter((p) => p.is_alive);
    return (
      <>
        {reconnectBanner}
        <NightScreen
          role={roleData?.role ?? "villager"}
          alivePlayers={alivePlayers}
          myPlayerId={playerId}
          hasEyesClosed={hasEyesClosed}
          hasSubmittedNightAction={hasSubmittedNightAction}
          seerPeekResult={seerPeekResult}
          roundNumber={room.round_number}
          onCloseEyes={closeEyes}
          onSubmitAction={async (targetId) => {
            await submitNightAction(targetId);
          }}
        />
      </>
    );
  }

  // ── Day announcement ──────────────────────────────────────────────────────
  if (phase === "day_announcement") {
    return (
      <>
        {reconnectBanner}
        <DayAnnouncementScreen
          room={room}
          players={players}
          isHost={isHost}
          onContinue={advancePhase}
        />
      </>
    );
  }

  // ── Discussion ────────────────────────────────────────────────────────────
  if (phase === "discussion") {
    return (
      <>
        {reconnectBanner}
        <DiscussionScreen
          players={players}
          roundNumber={room.round_number}
          isHost={isHost}
          onStartVote={advancePhase}
        />
      </>
    );
  }

  // ── Day vote ──────────────────────────────────────────────────────────────
  if (phase === "day_vote") {
    return (
      <>
        {reconnectBanner}
        <DayVoteScreen
          players={players}
          myPlayerId={playerId}
          hasVoted={hasVoted}
          roundNumber={room.round_number}
          onVote={submitDayVote}
        />
      </>
    );
  }

  // ── Elimination ───────────────────────────────────────────────────────────
  if (phase === "elimination") {
    return (
      <>
        {reconnectBanner}
        <EliminationScreen
          room={room}
          players={players}
          isHost={isHost}
          onContinue={advancePhase}
        />
      </>
    );
  }

  // ── Game over ─────────────────────────────────────────────────────────────
  if (phase === "game_over") {
    return (
      <>
        {reconnectBanner}
        <GameOverScreen
          room={room}
          players={players}
          isHost={isHost}
          onPlayAgain={resetGame}
          onLeave={leaveRoom}
        />
      </>
    );
  }

  // Fallback
  return (
    <>
      {reconnectBanner}
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Something went wrong. Please try again.</p>
          <button
            onClick={leaveRoom}
            className="px-6 py-3 bg-blue-600 rounded-xl font-bold min-h-14"
          >
            Go Back
          </button>
        </div>
      </div>
    </>
  );
};
