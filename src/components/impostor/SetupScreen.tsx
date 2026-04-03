"use client";

import { useState } from "react";
import type { GameSettings } from "@/types/impostor";
import type { Language } from "@/types/shared";

interface Props {
  onStart: (settings: GameSettings) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  initialPlayers?: string[];
}

const CLUE_ROUND_OPTIONS = [2, 3, 5];

const getImpostorOptions = (playerCount: number): number[] => {
  if (playerCount <= 3) return [1];
  if (playerCount === 4) return [1, 2];
  return [1, 2, 3];
};

// ---------------------------------------------------------------------------
// PlayerInputList
// ---------------------------------------------------------------------------

interface PlayerInputListProps {
  playerNames: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const PlayerInputList = ({
  playerNames,
  onUpdate,
  onAdd,
  onRemove,
}: PlayerInputListProps) => {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        Mga Manlalaro (3–8)
      </h2>
      <div className="space-y-2">
        {playerNames.map((name, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => onUpdate(i, e.target.value)}
              placeholder={`Manlalaro ${i + 1}`}
              maxLength={20}
              className="
                flex-1 bg-slate-800 text-white placeholder-slate-500
                rounded-xl px-4 py-3 min-h-14 text-base
                border border-slate-700 focus:border-blue-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
            {playerNames.length > 3 && (
              <button
                onClick={() => onRemove(i)}
                aria-label="Tanggalin"
                className="
                  w-14 min-h-14 rounded-xl bg-slate-800
                  text-slate-400 hover:bg-red-900 hover:text-red-300
                  font-bold text-xl transition-all border border-slate-700
                "
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {playerNames.length < 8 && (
        <button
          onClick={onAdd}
          className="
            mt-2 w-full py-3 rounded-xl font-bold text-sm
            bg-slate-800 text-slate-400 hover:bg-slate-700
            border border-dashed border-slate-600 min-h-14
            transition-all
          "
        >
          + Dagdag na Manlalaro
        </button>
      )}
    </section>
  );
};

// ---------------------------------------------------------------------------
// ClueRoundPicker
// ---------------------------------------------------------------------------

interface ClueRoundPickerProps {
  value: number;
  onChange: (n: number) => void;
}

const ClueRoundPicker = ({ value, onChange }: ClueRoundPickerProps) => {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        Ilang Rounds ng Clue?
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {CLUE_ROUND_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`
              py-4 rounded-xl font-bold text-2xl min-h-16 transition-all
              ${
                value === n
                  ? "bg-blue-600 text-white ring-2 ring-blue-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }
            `}
          >
            {n}
          </button>
        ))}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// ImpostorCountPicker
// ---------------------------------------------------------------------------

interface ImpostorCountPickerProps {
  value: number;
  onChange: (n: number) => void;
  playerCount: number;
}

const ImpostorCountPicker = ({
  value,
  onChange,
  playerCount,
}: ImpostorCountPickerProps) => {
  const options = getImpostorOptions(playerCount);
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        Ilang Impostor?
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {options.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`
              py-4 rounded-xl font-bold text-2xl min-h-16 transition-all
              ${
                value === n
                  ? "bg-red-600 text-white ring-2 ring-red-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }
            `}
          >
            {n}
          </button>
        ))}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// ErrorMessage
// ---------------------------------------------------------------------------

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <p className="text-red-400 text-sm text-center bg-red-950 rounded-xl px-4 py-3">
      {message}
    </p>
  );
};

// ---------------------------------------------------------------------------
// SetupScreen
// ---------------------------------------------------------------------------

export const SetupScreen = ({
  onStart,
  isLoading,
  error,
  initialPlayers,
}: Props) => {
  const [playerNames, setPlayerNames] = useState<string[]>(
    initialPlayers && initialPlayers.length >= 3
      ? initialPlayers
      : ["", "", ""],
  );
  const [category, setCategory] = useState("random");
  const [clueRounds, setClueRounds] = useState(3);
  const [numImpostors, setNumImpostors] = useState(1);
  const [language, setLanguage] = useState<Language>("filipino");
  const [validationError, setValidationError] = useState<string | null>(null);

  const updatePlayer = (index: number, value: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addPlayer = () => {
    if (playerNames.length < 8) setPlayerNames((prev) => [...prev, ""]);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 3) {
      const next = playerNames.filter((_, i) => i !== index);
      setPlayerNames(next);
      const opts = getImpostorOptions(
        next.filter((n) => n.trim() !== "").length,
      );
      if (!opts.includes(numImpostors)) {
        setNumImpostors(opts[opts.length - 1]);
      }
    }
  };

  const handleStart = () => {
    const filled = playerNames.map((n) => n.trim()).filter(Boolean);
    if (filled.length < 3) {
      setValidationError("Kailangan ng hindi bababa sa 3 manlalaro.");
      return;
    }
    setValidationError(null);
    onStart({ players: filled, category, clueRounds, language, numImpostors });
  };

  const startIsDisabled =
    isLoading ||
    playerNames.filter((n) => n.trim() !== "").length < 3 ||
    !numImpostors ||
    !clueRounds;

  const displayError = validationError ?? error;

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-6 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-6 pb-10">
        <header className="text-center">
          <h1 className="text-3xl font-black tracking-tight">
            SINO ANG IMPOSTOR?
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            I-set up ang laro at magsimula
          </p>
        </header>

        <PlayerInputList
          playerNames={playerNames}
          onUpdate={updatePlayer}
          onAdd={addPlayer}
          onRemove={removePlayer}
        />

        <ClueRoundPicker value={clueRounds} onChange={setClueRounds} />

        <ImpostorCountPicker
          value={numImpostors}
          onChange={setNumImpostors}
          playerCount={playerNames.filter((n) => n.trim() !== "").length}
        />

        {displayError && <ErrorMessage message={displayError} />}

        <button
          onClick={handleStart}
          disabled={startIsDisabled}
          className="
            w-full py-5 rounded-2xl font-black text-2xl tracking-widest
            bg-green-600 hover:bg-green-500 active:bg-green-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all min-h-18
          "
        >
          {isLoading ? "LOADING..." : "SIMULAN"}
        </button>
      </div>
    </div>
  );
};
