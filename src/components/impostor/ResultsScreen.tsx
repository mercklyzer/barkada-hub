"use client";

import { getTopVoteId, tallyVotes } from "@/lib/impostor/voteUtils";
import type { ImpostorSession, Player } from "@/types/impostor";

interface Props {
  session: ImpostorSession;
  onNextRound: () => void;
  onViewScoreboard: () => void;
}

const VoteTallyList = ({
  players,
  tallies,
  impostorIds,
}: {
  players: Player[];
  tallies: Record<string, number>;
  impostorIds: string[];
}) => {
  const sorted = players
    .slice()
    .sort((a, b) => (tallies[b.id] ?? 0) - (tallies[a.id] ?? 0));

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Resulta ng Boto
        </p>
      </div>
      <ul>
        {sorted.map((player, i) => {
          const count = tallies[player.id] ?? 0;
          const isImpostor = impostorIds.includes(player.id);
          return (
            <li
              key={player.id}
              className={`
                flex items-center justify-between px-4 py-3
                ${i < players.length - 1 ? "border-b border-slate-700" : ""}
                ${isImpostor ? "bg-slate-700/50" : ""}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{player.name}</span>
                {isImpostor && (
                  <span className="text-xs bg-red-800 text-red-300 rounded-full px-2 py-0.5 font-bold">
                    IMPOSTOR
                  </span>
                )}
              </div>
              <span
                className={`font-black text-lg ${count > 0 ? "text-white" : "text-slate-600"}`}
              >
                {count} boto
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const SessionScoreList = ({
  players,
  sessionScores,
}: {
  players: Player[];
  sessionScores: Record<string, number>;
}) => {
  const sorted = players
    .slice()
    .sort((a, b) => (sessionScores[b.id] ?? 0) - (sessionScores[a.id] ?? 0));

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Session Scores
        </p>
      </div>
      <ul>
        {sorted.map((player, i) => (
          <li
            key={player.id}
            className={`
              flex items-center justify-between px-4 py-3
              ${i < players.length - 1 ? "border-b border-slate-700" : ""}
            `}
          >
            <span className="font-bold text-white">{player.name}</span>
            <span className="font-black text-xl text-yellow-400">
              {sessionScores[player.id] ?? 0}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ResultsScreen = ({
  session,
  onNextRound,
  onViewScoreboard,
}: Props) => {
  const { players, impostorIds, secretWord, outcome, votes, impostorGuess } =
    session;
  const impostors = players.filter((p) => impostorIds.includes(p.id));
  const impostorWins = outcome === "impostor_wins";

  const voteTallies = tallyVotes(votes);
  const topVoteId = votes.length > 0 ? getTopVoteId(voteTallies) : "";
  const impostorCaughtByVote = impostorIds.includes(topVoteId);
  const caughtImpostor = players.find(
    (p) => p.id === topVoteId && impostorIds.includes(p.id),
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col px-4 py-6 overflow-y-auto">
      <div className="max-w-md mx-auto w-full space-y-6 pb-10">
        {/* Outcome banner */}
        <div
          className={`rounded-2xl px-6 py-6 text-center ${
            impostorWins
              ? "bg-red-900 border border-red-700"
              : "bg-green-900 border border-green-700"
          }`}
        >
          <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">
            {impostorWins ? "Impostor ang Nanalo!" : "Team ang Nanalo!"}
          </p>
          <h1 className="text-3xl font-black text-white">
            {impostorWins ? "Natalo ang Team!" : "Nahuli ang Impostor!"}
          </h1>
          {impostorCaughtByVote && impostorGuess !== null && (
            <p className="text-sm mt-2 opacity-80">
              {impostorWins
                ? `Inimbes ang pagkakataon ni ${caughtImpostor?.name} — tama ang hula!`
                : `Mali ang hula ni ${caughtImpostor?.name}.`}
            </p>
          )}
          {!impostorCaughtByVote && votes.length > 0 && impostorWins && (
            <p className="text-sm mt-2 opacity-80">
              Hindi nahuli ang impostor sa boto.
            </p>
          )}
        </div>

        {/* Impostor reveal */}
        <div className="bg-slate-800 rounded-2xl px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            {impostors.length > 1 ? "Ang mga Impostor" : "Ang Impostor"}
          </p>
          <p className="text-2xl font-black text-white">
            {impostors.length > 0
              ? impostors.map((p) => p.name).join(", ")
              : "?"}
          </p>
        </div>

        {/* Secret word reveal */}
        {secretWord && (
          <div className="bg-slate-800 rounded-2xl px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Ang Secret Word
            </p>
            <p className="text-4xl font-black text-yellow-400">
              {secretWord.word}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Kategorya: {secretWord.category}
            </p>
            {impostorGuess !== null && (
              <p
                className={`text-sm mt-2 font-bold ${impostorWins ? "text-green-400" : "text-red-400"}`}
              >
                Hula ni {caughtImpostor?.name ?? impostors[0]?.name}: &ldquo;
                {impostorGuess}&rdquo;
                {impostorWins ? " — TAMA!" : " — Mali!"}
              </p>
            )}
          </div>
        )}

        {votes.length > 0 && (
          <VoteTallyList
            players={players}
            tallies={voteTallies}
            impostorIds={impostorIds}
          />
        )}

        <SessionScoreList
          players={players}
          sessionScores={session.sessionScores}
        />

        <div className="space-y-3">
          <button
            onClick={onNextRound}
            className="w-full py-5 rounded-2xl font-black text-xl tracking-widest bg-green-600 hover:bg-green-500 active:bg-green-700 transition-all min-h-[72px]"
          >
            SUSUNOD NA ROUND
          </button>
          <button
            onClick={onViewScoreboard}
            className="w-full py-4 rounded-2xl font-black text-lg tracking-widest bg-slate-700 hover:bg-slate-600 active:bg-slate-800 transition-all min-h-[60px]"
          >
            TINGNAN ANG SCORE
          </button>
        </div>
      </div>
    </div>
  );
};
