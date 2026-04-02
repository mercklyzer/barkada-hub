"use client";

import { useCallback, useState } from "react";
import { assignRoles } from "@/lib/impostor/roleAssigner";
import { getTopVoteId, tallyVotes } from "@/lib/impostor/voteUtils";
import { fetchImpostorWords } from "@/lib/impostor/wordService";
import { shuffle } from "@/lib/shuffle";
import type {
  GameSettings,
  ImpostorGameState,
  ImpostorSession,
  Vote,
} from "@/types/impostor";

const captureEvent = (name: string, props: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.capture(name, props);
    })
    .catch(() => {
      /* ignore */
    });
};

export interface UseImpostorGame {
  gameState: ImpostorGameState;
  session: ImpostorSession | null;
  isLoading: boolean;
  error: string | null;

  startGame: (settings: GameSettings) => Promise<void>;
  advanceToRoleShow: () => void;
  onRevealDone: () => void;
  advanceClueRound: () => void;
  startVoting: () => void;
  submitVote: (vote: Vote) => void;
  submitImpostorGuess: (guess: string) => void;
  nextRound: () => void;
  viewScoreboard: () => void;
  playAgain: () => void;
  newGame: () => void;
}

export const useImpostorGame = (): UseImpostorGame => {
  const [gameState, setGameState] = useState<ImpostorGameState>("setup");
  const [session, setSession] = useState<ImpostorSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = useCallback(
    async (settings: GameSettings) => {
      setIsLoading(true);
      setError(null);
      try {
        const words = await fetchImpostorWords(
          settings.category,
          settings.language,
          20,
        );

        if (!words || words.length === 0) {
          throw new Error("No words available");
        }

        const shuffledWords = shuffle([...words]);
        const secretWord = shuffledWords[0];

        const { players, impostorIds } = assignRoles(
          settings.players,
          settings.numImpostors,
        );

        const existingScores = session?.sessionScores ?? {};
        const sessionScores: Record<string, number> = Object.fromEntries(
          players.map((p) => [p.id, existingScores[p.id] ?? 0]),
        );

        const newSession: ImpostorSession = {
          settings,
          players,
          secretWord,
          impostorIds,
          currentRound: 1,
          currentPlayerIndex: 0,
          votes: [],
          impostorGuess: null,
          outcome: null,
          roundsPlayedInSession: session?.roundsPlayedInSession ?? 0,
          sessionScores,
        };

        setSession(newSession);

        captureEvent("impostor_game_started", {
          category: settings.category,
          language: settings.language,
          player_count: settings.players.length,
          clue_rounds: settings.clueRounds,
        });

        setGameState("role_reveal_queue");
      } catch {
        setError("Hindi ma-load ang mga salita. Subukan ulit.");
      } finally {
        setIsLoading(false);
      }
    },
    [session],
  );

  const advanceToRoleShow = useCallback(() => {
    setGameState("role_reveal_show");
  }, []);

  const onRevealDone = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.currentPlayerIndex + 1;
      const allRevealed = nextIndex >= prev.players.length;

      setTimeout(() => {
        if (allRevealed) {
          setSession((s) =>
            s ? { ...s, currentPlayerIndex: 0, currentRound: 1 } : s,
          );
          setGameState("clue_round");
        } else {
          setGameState("role_reveal_queue");
        }
      }, 0);

      if (!allRevealed) {
        return { ...prev, currentPlayerIndex: nextIndex };
      }
      return prev;
    });
  }, []);

  const advanceClueRound = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const nextPlayerIndex = prev.currentPlayerIndex + 1;

      if (nextPlayerIndex < prev.players.length) {
        return { ...prev, currentPlayerIndex: nextPlayerIndex };
      }

      const nextRound = prev.currentRound + 1;
      if (nextRound <= prev.settings.clueRounds) {
        return { ...prev, currentRound: nextRound, currentPlayerIndex: 0 };
      }

      // All rounds done
      setTimeout(() => setGameState("discussion"), 0);
      return { ...prev, currentPlayerIndex: 0 };
    });
  }, []);

  const startVoting = useCallback(() => {
    setSession((prev) =>
      prev ? { ...prev, currentPlayerIndex: 0, votes: [] } : prev,
    );
    setGameState("voting");
  }, []);

  const submitVote = useCallback((vote: Vote) => {
    setSession((prev) => {
      if (!prev) return prev;
      const newVotes = [...prev.votes, vote];
      const nextPlayerIndex = prev.currentPlayerIndex + 1;

      if (nextPlayerIndex < prev.players.length) {
        return {
          ...prev,
          votes: newVotes,
          currentPlayerIndex: nextPlayerIndex,
        };
      }

      // All players voted — tally
      const tallies = tallyVotes(newVotes);
      const topSuspectId = getTopVoteId(tallies);
      const impostorCaught = prev.impostorIds.includes(topSuspectId);

      if (!impostorCaught) {
        const newScores = { ...prev.sessionScores };
        for (const id of prev.impostorIds) {
          newScores[id] = (newScores[id] ?? 0) + 1;
        }

        captureEvent("impostor_round_completed", {
          outcome: "impostor_wins",
          impostor_caught: false,
          secret_word: prev.secretWord?.word,
          category: prev.settings.category,
        });

        setTimeout(() => setGameState("results"), 0);

        return {
          ...prev,
          votes: newVotes,
          outcome: "impostor_wins",
          roundsPlayedInSession: prev.roundsPlayedInSession + 1,
          sessionScores: newScores,
        };
      }

      // Impostor caught — go to impostor_guess
      setTimeout(() => setGameState("impostor_guess"), 0);
      return { ...prev, votes: newVotes };
    });
  }, []);

  const submitImpostorGuess = useCallback((guess: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const trimmedGuess = guess.trim();
      const secretWord = prev.secretWord?.word ?? "";
      const correct = trimmedGuess.toLowerCase() === secretWord.toLowerCase();
      const outcome: ImpostorSession["outcome"] = correct
        ? "impostor_wins"
        : "team_wins";

      const newScores = { ...prev.sessionScores };
      if (correct) {
        for (const id of prev.impostorIds) {
          newScores[id] = (newScores[id] ?? 0) + 1;
        }
      } else {
        for (const p of prev.players) {
          if (!prev.impostorIds.includes(p.id)) {
            newScores[p.id] = (newScores[p.id] ?? 0) + 1;
          }
        }
      }

      captureEvent("impostor_round_completed", {
        outcome,
        impostor_caught: true,
        secret_word: secretWord,
        category: prev.settings.category,
      });

      setTimeout(() => setGameState("results"), 0);

      return {
        ...prev,
        impostorGuess: trimmedGuess,
        outcome,
        roundsPlayedInSession: prev.roundsPlayedInSession + 1,
        sessionScores: newScores,
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        votes: [],
        impostorGuess: null,
        outcome: null,
        currentRound: 1,
        currentPlayerIndex: 0,
      };
    });
    setGameState("setup");
  }, []);

  const viewScoreboard = useCallback(() => {
    setGameState("scoreboard");
  }, []);

  const playAgain = nextRound;

  const newGame = useCallback(() => {
    setSession(null);
    setError(null);
    setGameState("setup");
  }, []);

  return {
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
  };
};
