"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWords } from "@/lib/henyo/wordService";
import { shuffle } from "@/lib/shuffle";
import type {
  GameSession,
  GameSettings,
  GameState,
  HenyoWord,
  WordAttempt,
} from "@/types/henyo";

const MAX_PASSES = 3;

export interface UseHenyoGame {
  // State
  gameState: GameState;
  currentWord: HenyoWord | null;
  session: GameSession | null;
  timeLeft: number;
  passesLeft: number;
  isLoading: boolean;
  error: string | null;
  lastAttempt: WordAttempt | null;

  // Actions
  startGame: (settings: GameSettings) => Promise<void>;
  beginPlaying: () => void;
  markCorrect: () => void;
  passWord: () => void;
  nextWord: () => void;
  restartGame: () => void;
  resetToSetup: () => void;
}

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

export const useHenyoGame = (): UseHenyoGame => {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [session, setSession] = useState<GameSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<WordAttempt | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<GameSession | null>(null);
  const timerSecondsRef = useRef(0);
  const wordStartTimeRef = useRef(0);

  // Keep sessionRef in sync with state
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(() => {
    stopTimer();
    const sess = sessionRef.current;
    if (!sess) return;
    const word = sess.wordQueue[sess.currentIndex];

    captureEvent("henyo_word_timeout", {
      word: word.word,
      category: word.category,
    });

    const attempt: WordAttempt = {
      word,
      result: "timeout",
      timeUsed: wordStartTimeRef.current,
    };
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, attempts: [...prev.attempts, attempt] };
    });
    captureEvent("henyo_game_completed", {
      score: sess.score,
      total_words: sess.settings.wordCount,
      category: sess.settings.category,
    });
    setGameState("game_over");
  }, [stopTimer]);

  const startTimer = useCallback(
    (seconds: number) => {
      stopTimer();
      timerSecondsRef.current = seconds;
      setTimeLeft(seconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [stopTimer, handleTimeout],
  );

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const startGame = useCallback(async (settings: GameSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const words = await fetchWords(settings.category, settings.wordCount * 3);
      const shuffled = shuffle([...words]).slice(0, settings.wordCount);

      captureEvent("henyo_game_started", {
        category: settings.category,
        timer_seconds: settings.timerSeconds,
        word_count: settings.wordCount,
      });

      const newSession: GameSession = {
        settings,
        wordQueue: shuffled,
        currentIndex: 0,
        attempts: [],
        passesUsed: 0,
        score: 0,
      };
      setSession(newSession);
      setLastAttempt(null);
      setGameState("countdown");
    } catch {
      setError("Hindi ma-load ang mga salita. Subukan ulit.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Called by CountdownScreen after the 3-2-1 animation ends
  const beginPlaying = useCallback(() => {
    const sess = sessionRef.current;
    if (!sess) return;
    wordStartTimeRef.current = sess.settings.timerSeconds;
    startTimer(sess.settings.timerSeconds);
    setGameState("playing");
  }, [startTimer]);

  const advanceWord = useCallback(
    (attempt: WordAttempt, scoreIncrement: number, passIncrement: number) => {
      const sess = sessionRef.current;
      if (!sess) return;
      const nextIndex = sess.currentIndex + 1;
      const isLastWord = nextIndex >= sess.settings.wordCount;

      if (isLastWord) {
        stopTimer();
        setSession((prev) =>
          prev
            ? {
                ...prev,
                attempts: [...prev.attempts, attempt],
                score: prev.score + scoreIncrement,
                passesUsed: prev.passesUsed + passIncrement,
                currentIndex: nextIndex,
              }
            : prev,
        );
        captureEvent("henyo_game_completed", {
          score: sess.score + scoreIncrement,
          total_words: sess.settings.wordCount,
          category: sess.settings.category,
        });
        setGameState("game_over");
      } else {
        wordStartTimeRef.current = timeLeft;
        setSession((prev) =>
          prev
            ? {
                ...prev,
                attempts: [...prev.attempts, attempt],
                score: prev.score + scoreIncrement,
                passesUsed: prev.passesUsed + passIncrement,
                currentIndex: nextIndex,
              }
            : prev,
        );
      }
    },
    [stopTimer, timeLeft],
  );

  const markCorrect = useCallback(() => {
    const sess = sessionRef.current;
    if (!sess) return;
    const word = sess.wordQueue[sess.currentIndex];
    const timeUsed = wordStartTimeRef.current - timeLeft;

    captureEvent("henyo_word_correct", {
      word: word.word,
      category: word.category,
      time_used: timeUsed,
      passes_used: sess.passesUsed,
    });

    advanceWord({ word, result: "correct", timeUsed }, 1, 0);
  }, [advanceWord, timeLeft]);

  const passWord = useCallback(() => {
    const sess = sessionRef.current;
    if (!sess || sess.passesUsed >= MAX_PASSES) return;

    const word = sess.wordQueue[sess.currentIndex];
    captureEvent("henyo_word_passed", {
      word: word.word,
      category: word.category,
    });

    advanceWord(
      { word, result: "passed", timeUsed: wordStartTimeRef.current - timeLeft },
      0,
      1,
    );
  }, [advanceWord, timeLeft]);

  const nextWord = useCallback(() => {
    const sess = sessionRef.current;
    if (!sess) return;
    captureEvent("henyo_game_completed", {
      score: sess.score,
      total_words: sess.settings.wordCount,
      category: sess.settings.category,
    });
    setGameState("game_over");
  }, []);

  const restartGame = useCallback(() => {
    const sess = sessionRef.current;
    if (!sess) return;
    stopTimer();
    const reshuffled = shuffle([...sess.wordQueue]);
    setSession({
      ...sess,
      wordQueue: reshuffled,
      currentIndex: 0,
      attempts: [],
      passesUsed: 0,
      score: 0,
    });
    setLastAttempt(null);
    setGameState("countdown");
  }, [stopTimer]);

  const resetToSetup = useCallback(() => {
    stopTimer();
    setSession(null);
    setLastAttempt(null);
    setError(null);
    setGameState("setup");
  }, [stopTimer]);

  const currentWord: HenyoWord | null = session
    ? (session.wordQueue[session.currentIndex] ?? null)
    : null;
  const passesLeft = MAX_PASSES - (session?.passesUsed ?? 0);

  return {
    gameState,
    currentWord,
    session,
    timeLeft,
    passesLeft,
    isLoading,
    error,
    lastAttempt,
    startGame,
    beginPlaying,
    markCorrect,
    passWord,
    nextWord,
    restartGame,
    resetToSetup,
  };
};
