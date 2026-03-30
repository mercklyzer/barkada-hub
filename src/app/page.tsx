'use client'

import { useState } from 'react'
import Link from 'next/link'

type Lang = 'en' | 'fil'
type Filter = 'all' | 'solo' | 'multi' | 'available'

const COPY: Record<Lang, { heroSub: string; roomSub: string }> = {
  en: {
    heroSub:
      'The free, browser-based Filipino party game hub. No download, no login — just pick a game and play.',
    roomSub:
      'Create a room and share the code — everyone joins from their own device.',
  },
  fil: {
    heroSub:
      'Libreng Filipino party game hub. Walang download, walang login — pumili lang ng laro at maglaro na!',
    roomSub:
      'Gumawa ng room at ibahagi ang code — sasali ang lahat mula sa sarili nilang phone.',
  },
}

interface Game {
  slug: string
  href?: string
  icon: string
  iconBg: string
  nameEn: string
  nameFil: string
  desc: string
  type: 'solo' | 'multi'
  status: 'available' | 'soon'
  players: string
}

const SOLO_GAMES: Game[] = [
  {
    slug: 'henyo',
    href: '/henyo',
    icon: '🙈',
    iconBg: 'rgba(252,209,22,0.12)',
    nameEn: 'Pinoy Henyo',
    nameFil: 'Hulaan ang salita!',
    desc: 'Guesser holds the phone to their forehead. Partner responds Oo / Hindi / Pwede to yes-or-no questions. Classic Filipino party game from Eat Bulaga.',
    type: 'solo',
    status: 'available',
    players: '2 players',
  },
  {
    slug: 'truths',
    icon: '🤔',
    iconBg: 'rgba(206,17,38,0.1)',
    nameEn: 'Two Truths, One Lie',
    nameFil: 'Totoo o Gawa-Gawa',
    desc: 'Each player shares 3 statements — 2 true, 1 false. The group votes on which one is the lie. Great for getting to know your barkada.',
    type: 'solo',
    status: 'soon',
    players: '3+ players',
  },
  {
    slug: 'never',
    icon: '✋',
    iconBg: 'rgba(167,139,250,0.1)',
    nameEn: 'Never Have I Ever',
    nameFil: 'Hindi Ko Pa Nagagawa',
    desc: 'Classic finger-down game with Filipino scenarios. Track scores on screen. Perfect for barkada nights and reunions.',
    type: 'solo',
    status: 'soon',
    players: '3+ players',
  },
  {
    slug: 'wyr',
    icon: '🤷',
    iconBg: 'rgba(251,146,60,0.1)',
    nameEn: 'Would You Rather?',
    nameFil: 'Piliin Mo',
    desc: "Two Filipino-flavored choices appear — the group debates and votes. Jollibee vs McDonald's? Jeepney vs MRT? The arguments are half the fun.",
    type: 'solo',
    status: 'soon',
    players: '2+ players',
  },
  {
    slug: 'likely',
    icon: '🎯',
    iconBg: 'rgba(0,56,168,0.15)',
    nameEn: 'Most Likely To',
    nameFil: 'Sino Kaya?',
    desc: '"Most likely to order Jollibee at 2am" — the group nominates one person. Tally the nominations and see who wins each category.',
    type: 'solo',
    status: 'soon',
    players: '3+ players',
  },
]

const MULTI_GAMES: Game[] = [
  {
    slug: 'impostor',
    href: '/impostor',
    icon: '🕵️',
    iconBg: 'rgba(206,17,38,0.1)',
    nameEn: "Who's the Impostor?",
    nameFil: 'Sino ang Impostor?',
    desc: 'Everyone gets a secret word — except one player. Give one-word clues each round. After 3 rounds, the group votes. Can the Impostor blend in?',
    type: 'multi',
    status: 'available',
    players: '4–12 players',
  },
  // {
  //   slug: 'drawing',
  //   icon: '🖌️',
  //   iconBg: 'rgba(52,211,153,0.1)',
  //   nameEn: 'Drawing Henyo',
  //   nameFil: 'Iguhit Mo!',
  //   desc: 'One player draws a Filipino word or phrase; everyone else guesses on their phones. Custom Filipino word packs — food, places, teleserye, and more.',
  //   type: 'multi',
  //   status: 'soon',
  //   players: '3–8 players',
  // },
  {
    slug: 'palakpakan',
    icon: '😂',
    iconBg: 'rgba(251,146,60,0.1)',
    nameEn: 'Palakpakan',
    nameFil: 'Pinakamagaling na sagot!',
    desc: 'A funny Filipino prompt appears — everyone submits their wittiest answer anonymously. The group votes for the best one. Tagalog humor guaranteed.',
    type: 'multi',
    status: 'soon',
    players: '3–10 players',
  },
  {
    slug: 'bingo',
    icon: '🎰',
    iconBg: 'rgba(167,139,250,0.1)',
    nameEn: 'Pinoy Bingo',
    nameFil: 'Bingo Pinoy!',
    desc: "Filipino pop culture bingo cards — \"nasaktan ka na ba sa jeep?\", \"natulog ka sa klase?\". Each player's card is unique. First bingo wins!",
    type: 'multi',
    status: 'soon',
    players: '4–30 players',
  },
  // {
  //   slug: 'boat',
  //   icon: '🚣',
  //   iconBg: 'rgba(0,56,168,0.15)',
  //   nameEn: 'Boat is Sinking',
  //   nameFil: 'Lumulubog ang Bangka!',
  //   desc: "The host calls a group size — players race to form the right number of groups. Too many or too few in your group? You're out! Last survivor wins.",
  //   type: 'multi',
  //   status: 'soon',
  //   players: '5–30 players',
  // },
]

function GameCard({ game }: { game: Game }) {
  const isSoon = game.status === 'soon'

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2 mb-3.5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: game.iconBg }}
        >
          {game.icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          {isSoon ? (
            <span
              className="text-[0.7rem] font-bold tracking-[0.5px] uppercase px-2 py-0.5 rounded-[5px]"
              style={{
                background: 'rgba(113,128,150,0.15)',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              Coming Soon
            </span>
          ) : (
            <span
              className="text-[0.7rem] font-bold tracking-[0.5px] uppercase px-2 py-0.5 rounded-[5px]"
              style={{
                background: 'rgba(52,211,153,0.15)',
                color: '#34d399',
                border: '1px solid rgba(52,211,153,0.3)',
              }}
            >
              Available
            </span>
          )}
          <span className="text-[0.7rem] font-medium" style={{ color: 'var(--muted)' }}>
            {game.players}
          </span>
        </div>
      </div>

      <div className="text-[1.05rem] font-extrabold leading-tight mb-0.5" style={{ color: 'var(--text)' }}>
        {game.nameEn}
      </div>
      <div className="text-[0.8rem] italic mb-2.5" style={{ color: 'var(--muted)' }}>
        {game.nameFil}
      </div>
      <div className="text-[0.85rem] leading-relaxed" style={{ color: 'var(--muted)' }}>
        {game.desc}
      </div>

      <div
        className="flex items-center justify-between mt-4 pt-3.5"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span
          className="text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-md"
          style={
            game.type === 'solo'
              ? {
                  background: 'rgba(252,209,22,0.12)',
                  color: '#fcd116',
                  border: '1px solid rgba(252,209,22,0.25)',
                }
              : {
                  background: 'rgba(0,56,168,0.15)',
                  color: '#80a8ff',
                  border: '1px solid rgba(0,56,168,0.3)',
                }
          }
        >
          {game.type === 'solo' ? '📱 Solo Device' : '📱📱 Multi-Device'}
        </span>
        {isSoon ? (
          <span className="text-[0.82rem] font-semibold" style={{ color: 'var(--muted)' }}>
            Coming soon
          </span>
        ) : (
          <span className="text-[0.82rem] font-bold" style={{ color: 'var(--gold)' }}>
            Play now →
          </span>
        )}
      </div>
    </>
  )

  const baseStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
  }

  if (isSoon) {
    return (
      <div
        className="rounded-[14px] p-5 relative overflow-hidden opacity-55 cursor-default"
        style={baseStyle}
      >
        {inner}
      </div>
    )
  }

  return (
    <Link
      href={game.href!}
      className="game-card-link block rounded-[14px] p-5 relative overflow-hidden transition-all duration-[0.18s]"
      style={{ ...baseStyle, color: 'inherit', textDecoration: 'none' }}
    >
      {inner}
    </Link>
  )
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('en')
  const [filter, setFilter] = useState<Filter>('all')
  const [roomCode, setRoomCode] = useState('')

  const visibleSolo = SOLO_GAMES.filter(
    (g) => filter !== 'multi' && (filter !== 'available' || g.status === 'available'),
  )
  const visibleMulti = MULTI_GAMES.filter(
    (g) => filter !== 'solo' && (filter !== 'available' || g.status === 'available'),
  )

  function handleJoin() {
    if (!roomCode.trim()) return
    alert(`Joining room: ${roomCode}\n\n(Room system coming in Phase 2!)`)
  }

  function handleCreate() {
    const mock = 'LARO' + Math.floor(1000 + Math.random() * 9000)
    alert(`Room created! Code: ${mock}\n\n(Room system coming in Phase 2!)`)
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All Games' },
    { value: 'solo', label: '📱 Solo Device' },
    { value: 'multi', label: '📱📱 Multi-Device' },
    { value: 'available', label: '✅ Available Now' },
  ]

  return (
    <>
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-[100] flex items-center justify-between px-6 h-14"
        style={{
          background: 'rgba(13,17,23,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-extrabold text-[1.2rem] tracking-[-0.5px] no-underline"
          style={{ color: 'var(--text)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'linear-gradient(135deg, var(--blue), var(--red))' }}
          >
            🎮
          </div>
          <span>
            <span style={{ color: 'var(--gold)' }}>Laro</span> Na!
          </span>
        </Link>

        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {(['en', 'fil'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="text-[0.8rem] font-semibold px-2.5 py-1 rounded-md cursor-pointer border-none transition-all duration-150"
              style={
                lang === l
                  ? { background: 'var(--blue)', color: '#fff' }
                  : { background: 'none', color: 'var(--muted)' }
              }
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="text-center px-6 pt-[72px] pb-12 max-w-[720px] mx-auto">
        <div
          className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold tracking-[0.5px] uppercase px-3.5 py-1.5 rounded-full mb-5"
          style={{
            background: 'rgba(0,56,168,0.2)',
            border: '1px solid rgba(0,56,168,0.5)',
            color: '#80a8ff',
          }}
        >
          🇵🇭 Free Filipino Party Games
        </div>
        <h1 className="font-black leading-[1.05] mb-4" style={{ fontSize: 'clamp(2.4rem,8vw,4rem)', letterSpacing: '-2px' }}>
          <span style={{ color: 'var(--gold)' }}>Laro</span>{' '}
          <span style={{ color: 'var(--red)' }}>Na!</span>
        </h1>
        <p className="text-[1.05rem] max-w-[480px] mx-auto mb-8" style={{ color: 'var(--muted)' }}>
          {COPY[lang].heroSub}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="#games"
            className="inline-flex items-center gap-2 font-bold text-[0.95rem] px-6 py-3 rounded-xl border-none cursor-pointer no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(252,209,22,0.3)]"
            style={{ background: 'var(--gold)', color: '#1a1400' }}
          >
            🎲 Pick a Game
          </a>
          {/* <a
            href="#room"
            className="inline-flex items-center gap-2 font-bold text-[0.95rem] px-6 py-3 rounded-xl cursor-pointer no-underline transition-all duration-150 hover:bg-[var(--surface)]"
            style={{
              background: 'transparent',
              color: 'var(--text)',
              border: '1.5px solid var(--border)',
            }}
          >
            Create a Room
          </a> */}
        </div>
      </section>

      {/* ── Stats ── */}
      <div
        className="flex gap-8 justify-center flex-wrap px-6 py-6 mb-12"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {[
          { num: '15+', label: 'Games' },
          { num: '2–30', label: 'Players' },
          { num: '0', label: 'Downloads needed' },
          { num: 'Free', label: 'Forever' },
        ].map(({ num, label }) => (
          <div key={label} className="text-center">
            <div className="text-[1.6rem] font-black tracking-[-1px]" style={{ color: 'var(--gold)' }}>
              {num}
            </div>
            <div className="text-[0.75rem] font-medium mt-0.5" style={{ color: 'var(--muted)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Room Banner ── */}
      {/* <div id="room" className="max-w-[1100px] mx-auto px-6 mb-12">
        <div
          className="flex items-center justify-between gap-6 flex-wrap rounded-[14px] px-8 py-7"
          style={{
            background: 'linear-gradient(135deg, rgba(0,56,168,0.2), rgba(206,17,38,0.15))',
            border: '1px solid rgba(0,56,168,0.3)',
          }}
        >
          <div>
            <h3 className="text-[1.15rem] font-extrabold mb-1.5">
              📱 Playing with friends on separate phones?
            </h3>
            <p className="text-[0.88rem]" style={{ color: 'var(--muted)' }}>
              {COPY[lang].roomSub}
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <input
              type="text"
              placeholder="ROOM CODE"
              maxLength={9}
              value={roomCode}
              onChange={(e) =>
                setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
              }
              className="w-40 px-4 py-2.5 rounded-xl text-base font-bold tracking-[3px] uppercase outline-none transition-[border-color] duration-150 focus:border-[var(--blue)]"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid var(--border)',
                color: 'var(--text)',
                fontFamily: "'Courier New', monospace",
              }}
            />
            <button
              onClick={handleJoin}
              className="px-5 py-2.5 rounded-xl text-[0.9rem] font-bold text-white border-none cursor-pointer transition-all duration-150 hover:bg-[#004fd6]"
              style={{ background: 'var(--blue)' }}
            >
              Join
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-2.5 rounded-xl text-[0.9rem] font-bold border-none cursor-pointer transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text)',
                border: '1.5px solid var(--border)',
              }}
            >
              + Create
            </button>
          </div>
        </div>
      </div> */}

      {/* ── Games ── */}
      <div id="games" className="max-w-[1100px] mx-auto px-6 pb-16">
        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className="text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-full cursor-pointer border-none transition-all duration-150"
              style={
                filter === value
                  ? { background: 'var(--gold)', color: '#1a1400', border: '1px solid var(--gold)' }
                  : {
                      background: 'var(--surface)',
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Solo Device Section */}
        {visibleSolo.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2.5 text-[1.1rem] font-bold" style={{ color: 'var(--text)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
                Solo Device Games
              </div>
              <span
                className="text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-md whitespace-nowrap"
                style={{
                  background: 'rgba(252,209,22,0.12)',
                  color: '#fcd116',
                  border: '1px solid rgba(252,209,22,0.25)',
                }}
              >
                📱 One shared phone
              </span>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {visibleSolo.map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
            </div>
          </div>
        )}

        {/* Multi-Device Section */}
        {visibleMulti.length > 0 && (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2.5 text-[1.1rem] font-bold" style={{ color: 'var(--text)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--blue)' }} />
                Multi-Device Games
              </div>
              <span
                className="text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-md whitespace-nowrap"
                style={{
                  background: 'rgba(0,56,168,0.15)',
                  color: '#80a8ff',
                  border: '1px solid rgba(0,56,168,0.3)',
                }}
              >
                📱📱 Everyone uses their own phone
              </span>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {visibleMulti.map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-7 text-center text-[0.82rem]"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <p>
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>About</a>
          &nbsp;·&nbsp;
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Suggest a Game</a>
          &nbsp;·&nbsp;
          <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Report a Bug</a>
        </p>
        <p className="mt-2 text-[0.75rem]">No login. No download. Libre. 🇵🇭</p>
      </footer>
    </>
  )
}
