import Link from 'next/link'

const games = [
  {
    slug: 'henyo',
    name: 'Pinoy Henyo',
    description: 'Ipatong ang telepono sa noo mo! Hulaan ang salita sa tulong ng iyong kasama.',
    emoji: '🎯',
    players: '2 players · 1 phone',
    color: 'from-green-600 to-green-800',
  },
  {
    slug: 'impostor',
    name: 'Sino ang Impostor?',
    description: 'Isa sa inyo ang walang alam. Hanapin ang Impostor bago mahuli!',
    emoji: '🕵️',
    players: '3–8 players · 1 phone',
    color: 'from-red-700 to-red-900',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">🎮 Tambay Games</h1>
          <p className="text-slate-400">Filipino party games para sa barkada</p>
        </div>

        <div className="flex flex-col gap-4">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/${game.slug}`}
              className={`block rounded-2xl p-6 bg-gradient-to-br ${game.color} hover:scale-[1.02] transition-transform active:scale-[0.98]`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{game.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold">{game.name}</h2>
                  <p className="text-sm opacity-80 mt-1">{game.description}</p>
                  <p className="text-xs opacity-60 mt-2 font-medium">{game.players}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
