export type Lang = "en" | "fil";
export type Filter = "all" | "solo" | "multi" | "available";

export const COPY: Record<Lang, { heroSub: string; roomSub: string }> = {
  en: {
    heroSub:
      "The free, browser-based Filipino party game hub. No download, no login — just pick a game and play.",
    roomSub:
      "Create a room and share the code — everyone joins from their own device.",
  },
  fil: {
    heroSub:
      "Libreng Filipino party game hub. Walang download, walang login — pumili lang ng laro at maglaro na!",
    roomSub:
      "Gumawa ng room at ibahagi ang code — sasali ang lahat mula sa sarili nilang phone.",
  },
};

export interface Game {
  slug: string;
  href?: string;
  icon: string;
  iconBg: string;
  nameEn: string;
  nameFil: string;
  desc: string;
  type: "solo" | "multi";
  status: "available" | "soon";
  players: string;
}

export const SOLO_GAMES: Game[] = [
  {
    slug: "henyo",
    href: "/henyo",
    icon: "🙈",
    iconBg: "rgba(252,209,22,0.12)",
    nameEn: "Pinoy Henyo",
    nameFil: "Hulaan ang salita!",
    desc: "Guesser holds the phone to their forehead. Partner responds Oo / Hindi / Pwede to yes-or-no questions. Classic Filipino party game from Eat Bulaga.",
    type: "solo",
    status: "available",
    players: "2 players",
  },
  {
    slug: "impostor",
    href: "/impostor",
    icon: "🕵️",
    iconBg: "rgba(206,17,38,0.1)",
    nameEn: "Who's the Impostor?",
    nameFil: "Sino ang Impostor?",
    desc: "Everyone gets a secret word — except one player. Give one-word clues each round. After 3 rounds, the group votes. Can the Impostor blend in?",
    type: "multi",
    status: "available",
    players: "4–12 players",
  },
  {
    slug: "truths",
    icon: "🤔",
    iconBg: "rgba(206,17,38,0.1)",
    nameEn: "Two Truths, One Lie",
    nameFil: "Totoo o Gawa-Gawa",
    desc: "Each player shares 3 statements — 2 true, 1 false. The group votes on which one is the lie. Great for getting to know your barkada.",
    type: "solo",
    status: "soon",
    players: "3+ players",
  },
  {
    slug: "never",
    icon: "✋",
    iconBg: "rgba(167,139,250,0.1)",
    nameEn: "Never Have I Ever",
    nameFil: "Hindi Ko Pa Nagagawa",
    desc: "Classic finger-down game with Filipino scenarios. Track scores on screen. Perfect for barkada nights and reunions.",
    type: "solo",
    status: "soon",
    players: "3+ players",
  },
  {
    slug: "wyr",
    icon: "🤷",
    iconBg: "rgba(251,146,60,0.1)",
    nameEn: "Would You Rather?",
    nameFil: "Piliin Mo",
    desc: "Two Filipino-flavored choices appear — the group debates and votes. Jollibee vs McDonald's? Jeepney vs MRT? The arguments are half the fun.",
    type: "solo",
    status: "soon",
    players: "2+ players",
  },
  {
    slug: "likely",
    icon: "🎯",
    iconBg: "rgba(0,56,168,0.15)",
    nameEn: "Most Likely To",
    nameFil: "Sino Kaya?",
    desc: '"Most likely to order Jollibee at 2am" — the group nominates one person. Tally the nominations and see who wins each category.',
    type: "solo",
    status: "soon",
    players: "3+ players",
  },
];

export const MULTI_GAMES: Game[] = [
  {
    slug: "palakpakan",
    icon: "😂",
    iconBg: "rgba(251,146,60,0.1)",
    nameEn: "Palakpakan",
    nameFil: "Pinakamagaling na sagot!",
    desc: "A funny Filipino prompt appears — everyone submits their wittiest answer anonymously. The group votes for the best one. Tagalog humor guaranteed.",
    type: "multi",
    status: "soon",
    players: "3–10 players",
  },
  {
    slug: "bingo",
    icon: "🎰",
    iconBg: "rgba(167,139,250,0.1)",
    nameEn: "Pinoy Bingo",
    nameFil: "Bingo Pinoy!",
    desc: 'Filipino pop culture bingo cards — "nasaktan ka na ba sa jeep?", "natulog ka sa klase?". Each player\'s card is unique. First bingo wins!',
    type: "multi",
    status: "soon",
    players: "4–30 players",
  },
];

export const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "All Games" },
  { value: "solo", label: "📱 Solo Device" },
  { value: "multi", label: "📱📱 Multi-Device" },
  { value: "available", label: "✅ Available Now" },
];
