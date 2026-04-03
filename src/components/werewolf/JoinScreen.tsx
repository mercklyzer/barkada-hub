"use client";

import { useState } from "react";

interface Props {
  isLoading: boolean;
  error: string | null;
  onJoin: (code: string, name: string) => void;
  onCreate: (name: string) => void;
}

export const JoinScreen = ({ isLoading, error, onJoin, onCreate }: Props) => {
  const [tab, setTab] = useState<"join" | "create">("join");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (!name.trim() || !code.trim()) return;
    onJoin(code.trim(), name.trim());
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="text-6xl">🐺</div>
          <h1 className="text-3xl font-black tracking-tight">Werewolf</h1>
          <p className="text-slate-400 text-sm">
            A game of deception and deduction. Who is the wolf?
          </p>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-700">
          <button
            onClick={() => setTab("join")}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              tab === "join"
                ? "bg-slate-700 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            Join Game
          </button>
          <button
            onClick={() => setTab("create")}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              tab === "create"
                ? "bg-slate-700 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            Create Game
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-400">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
            />
          </div>

          {tab === "join" && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-400">
                Room Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-center text-2xl font-black tracking-widest uppercase focus:outline-none focus:border-slate-400"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={tab === "join" ? handleJoin : handleCreate}
            disabled={
              isLoading || !name.trim() || (tab === "join" && code.length < 6)
            }
            className="w-full py-4 bg-red-700 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-black text-lg transition-colors min-h-14"
          >
            {isLoading
              ? "Loading..."
              : tab === "join"
                ? "Join"
                : "Create Room"}
          </button>
        </div>
      </div>
    </div>
  );
};
