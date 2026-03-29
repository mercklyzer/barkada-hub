'use client'

import type { ImpostorSession } from '@/types/impostor'

interface Props {
  session: ImpostorSession
  onNextRound: () => void
  onViewScoreboard: () => void
}

export function ResultsScreen({ session, onNextRound, onViewScoreboard }: Props) {
  const { players, impostorId, secretWord, outcome, votes, impostorGuess } = session
  const impostor = players.find((p) => p.id === impostorId)
  const impostorWins = outcome === 'impostor_wins'

  // Tally votes
  const voteTallies: Record<string, number> = {}
  for (const vote of votes) {
    voteTallies[vote.suspectId] = (voteTallies[vote.suspectId] ?? 0) + 1
  }

  // Determine if impostor was caught by vote
  let impostorCaughtByVote = false
  if (votes.length > 0) {
    let maxVotes = 0
    let topId = ''
    let hasTie = false
    for (const [pid, count] of Object.entries(voteTallies)) {
      if (count > maxVotes) {
        maxVotes = count
        topId = pid
        hasTie = false
      } else if (count === maxVotes) {
        hasTie = true
        topId = ''
      }
    }
    if (!hasTie) {
      impostorCaughtByVote = topId === impostorId
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col px-4 py-6 overflow-y-auto">
      <div className="max-w-md mx-auto w-full space-y-6 pb-10">
        {/* Outcome banner */}
        <div
          className={`
            rounded-2xl px-6 py-6 text-center
            ${impostorWins ? 'bg-red-900 border border-red-700' : 'bg-green-900 border border-green-700'}
          `}
        >
          <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">
            {impostorWins ? 'Impostor ang Nanalo!' : 'Team ang Nanalo!'}
          </p>
          <h1 className="text-3xl font-black text-white">
            {impostorWins ? 'Natalo ang Team!' : 'Nahuli ang Impostor!'}
          </h1>
          {impostorCaughtByVote && impostorGuess !== null && (
            <p className="text-sm mt-2 opacity-80">
              {impostorWins
                ? `Inimbes ang pagkakataon ni ${impostor?.name} — tama ang hula!`
                : `Mali ang hula ni ${impostor?.name}.`}
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
            Ang Impostor
          </p>
          <p className="text-2xl font-black text-white">{impostor?.name ?? '?'}</p>
        </div>

        {/* Secret word reveal */}
        {secretWord && (
          <div className="bg-slate-800 rounded-2xl px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Ang Secret Word
            </p>
            <p className="text-4xl font-black text-yellow-400">{secretWord.word}</p>
            <p className="text-slate-500 text-sm mt-1">Kategorya: {secretWord.category}</p>
            {impostorGuess !== null && (
              <p className={`text-sm mt-2 font-bold ${impostorWins ? 'text-green-400' : 'text-red-400'}`}>
                Hula ni {impostor?.name}: &ldquo;{impostorGuess}&rdquo;
                {impostorWins ? ' — TAMA!' : ' — Mali!'}
              </p>
            )}
          </div>
        )}

        {/* Vote tally */}
        {votes.length > 0 && (
          <div className="bg-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Resulta ng Boto
              </p>
            </div>
            <ul>
              {players
                .slice()
                .sort((a, b) => (voteTallies[b.id] ?? 0) - (voteTallies[a.id] ?? 0))
                .map((player, i) => {
                  const count = voteTallies[player.id] ?? 0
                  return (
                    <li
                      key={player.id}
                      className={`
                        flex items-center justify-between px-4 py-3
                        ${i < players.length - 1 ? 'border-b border-slate-700' : ''}
                        ${player.id === impostorId ? 'bg-slate-700/50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{player.name}</span>
                        {player.id === impostorId && (
                          <span className="text-xs bg-red-800 text-red-300 rounded-full px-2 py-0.5 font-bold">
                            IMPOSTOR
                          </span>
                        )}
                      </div>
                      <span className={`font-black text-lg ${count > 0 ? 'text-white' : 'text-slate-600'}`}>
                        {count} boto
                      </span>
                    </li>
                  )
                })}
            </ul>
          </div>
        )}

        {/* Session scores update */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Session Scores
            </p>
          </div>
          <ul>
            {players
              .slice()
              .sort((a, b) => (session.sessionScores[b.id] ?? 0) - (session.sessionScores[a.id] ?? 0))
              .map((player, i) => (
                <li
                  key={player.id}
                  className={`
                    flex items-center justify-between px-4 py-3
                    ${i < players.length - 1 ? 'border-b border-slate-700' : ''}
                  `}
                >
                  <span className="font-bold text-white">{player.name}</span>
                  <span className="font-black text-xl text-yellow-400">
                    {session.sessionScores[player.id] ?? 0}
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={onNextRound}
            className="
              w-full py-5 rounded-2xl font-black text-xl tracking-widest
              bg-green-600 hover:bg-green-500 active:bg-green-700
              transition-all min-h-[72px]
            "
          >
            SUSUNOD NA ROUND
          </button>
          <button
            onClick={onViewScoreboard}
            className="
              w-full py-4 rounded-2xl font-black text-lg tracking-widest
              bg-slate-700 hover:bg-slate-600 active:bg-slate-800
              transition-all min-h-[60px]
            "
          >
            TINGNAN ANG SCORE
          </button>
        </div>
      </div>
    </div>
  )
}
