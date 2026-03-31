"use client";

import type { GameSession, WordAttempt } from "@/types/henyo";

interface Props {
  attempt: WordAttempt;
  session: GameSession;
  onNext: () => void;
}

const formatTime = (secs: number): string => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const ResultScreen = ({ attempt, session, onNext }: Props) => {
  const isWin = attempt.result === "correct";
  const isTimeout = attempt.result === "timeout";
  const wordCount = session.settings.wordCount;
  const wordsPlayed = session.attempts.length;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 text-white
        ${isWin ? "bg-green-900" : "bg-slate-900"}
      `}
    >
      {/* Result headline */}
      <div className="text-center mb-8">
        <p
          className={`font-black text-7xl mb-2 ${
            isWin ? "text-green-300" : "text-red-400"
          }`}
        >
          {isWin ? "TAMA!" : "ULIT!"}
        </p>
        <p className="text-slate-300 text-lg">
          {isWin
            ? "Nahulaan mo!"
            : isTimeout
              ? "Naubos ang oras!"
              : "Na-pass ang salita"}
        </p>
      </div>

      {/* Word reveal */}
      <div className="bg-slate-800 rounded-2xl px-8 py-6 text-center mb-8 w-full max-w-sm">
        <p className="text-slate-400 text-sm mb-1">Ang salita ay:</p>
        <p className="font-black text-4xl uppercase">{attempt.word.word}</p>
        {attempt.word.hint && (
          <p className="text-slate-500 text-sm mt-2 italic">
            {attempt.word.hint}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
        <div className="bg-slate-800 rounded-xl px-4 py-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
            Oras
          </p>
          <p className="font-black text-2xl">
            {isWin ? formatTime(attempt.timeUsed) : "—"}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl px-4 py-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
            Score
          </p>
          <p className="font-black text-2xl">
            {session.score}/{wordsPlayed}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: wordCount }).map((_, i) => {
          const attemptAt = session.attempts[i];
          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < session.attempts.length
                  ? attemptAt?.result === "correct"
                    ? "bg-green-500"
                    : "bg-red-500"
                  : i === session.currentIndex
                    ? "bg-blue-500"
                    : "bg-slate-600"
              }`}
            />
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-sm py-5 rounded-2xl font-black text-2xl tracking-widest bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all min-h-[64px]"
      >
        SUSUNOD
      </button>
    </div>
  );
};
