"use client";

import { useImpostorGame } from "@/hooks/useImpostorGame";
import { ClueRoundScreen } from "./ClueRoundScreen";
import { DiscussionScreen } from "./DiscussionScreen";
import { ImpostorGuessScreen } from "./ImpostorGuessScreen";
import { ResultsScreen } from "./ResultsScreen";
import { RoleRevealQueueScreen } from "./RoleRevealQueueScreen";
import { RoleRevealShowScreen } from "./RoleRevealShowScreen";
import { ScoreboardScreen } from "./ScoreboardScreen";
import { SetupScreen } from "./SetupScreen";
import { VotingScreen } from "./VotingScreen";

const ErrorFallback = ({ onReset }: { onReset: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-slate-400">May problema. Subukan ulit.</p>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-blue-600 rounded-xl font-bold min-h-14"
        >
          Bumalik sa Setup
        </button>
      </div>
    </div>
  );
};

export const ImpostorGame = () => {
  const game = useImpostorGame();
  const {
    gameState,
    session,
    isLoading,
    error,
    startGame,
    advanceToRoleShow,
    onRevealDone,
    advanceClueRound,
    startVoting,
    submitVote,
    submitImpostorGuess,
    nextRound,
    viewScoreboard,
    playAgain,
    newGame,
  } = game;

  if (gameState === "setup") {
    return (
      <SetupScreen
        onStart={startGame}
        isLoading={isLoading}
        error={error}
        initialPlayers={session?.settings.players}
      />
    );
  }

  if (!session) return <ErrorFallback onReset={newGame} />;

  const currentPlayer = session.players[session.currentPlayerIndex];

  if (gameState === "role_reveal_queue") {
    if (!currentPlayer) return null;
    return (
      <RoleRevealQueueScreen
        player={currentPlayer}
        onReady={advanceToRoleShow}
      />
    );
  }

  if (gameState === "role_reveal_show") {
    if (!currentPlayer) return null;
    return (
      <RoleRevealShowScreen
        player={currentPlayer}
        secretWord={session.secretWord}
        onRevealDone={onRevealDone}
      />
    );
  }

  if (gameState === "clue_round") {
    return (
      <ClueRoundScreen
        players={session.players}
        currentRound={session.currentRound}
        totalRounds={session.settings.clueRounds}
        currentPlayerIndex={session.currentPlayerIndex}
        secretWord={session.secretWord}
        onNext={advanceClueRound}
      />
    );
  }

  if (gameState === "discussion") {
    return (
      <DiscussionScreen players={session.players} onStartVoting={startVoting} />
    );
  }

  if (gameState === "voting") {
    return (
      <VotingScreen
        players={session.players}
        currentPlayerIndex={session.currentPlayerIndex}
        onVote={submitVote}
      />
    );
  }

  if (gameState === "impostor_guess") {
    const impostor = session.players.find((p) => p.id === session.impostorId);
    if (!impostor) return null;
    return (
      <ImpostorGuessScreen
        impostorName={impostor.name}
        secretWord={session.secretWord}
        onSubmitGuess={submitImpostorGuess}
      />
    );
  }

  if (gameState === "results") {
    return (
      <ResultsScreen
        session={session}
        onNextRound={nextRound}
        onViewScoreboard={viewScoreboard}
      />
    );
  }

  if (gameState === "scoreboard") {
    return (
      <ScoreboardScreen
        session={session}
        onPlayAgain={playAgain}
        onNewGame={newGame}
      />
    );
  }

  return <ErrorFallback onReset={newGame} />;
};
