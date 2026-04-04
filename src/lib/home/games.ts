export type Filter = "all" | "solo" | "multi" | "available";

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
    nameFil: "Guess the word!",
    desc: "Guesser holds the phone to their forehead. Partner answers Yes / No / Maybe to yes-or-no questions. A classic word-guessing party game.",
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
    nameFil: "Who's the Impostor?",
    desc: "Everyone gets a secret word — except one player. Give one-word clues each round. After 3 rounds, the group votes. Can the Impostor blend in?",
    type: "multi",
    status: "available",
    players: "4–12 players",
  },
  {
    slug: "never",
    icon: "✋",
    iconBg: "rgba(167,139,250,0.1)",
    nameEn: "Never Have I Ever",
    nameFil: "Never Have I Ever",
    desc: "Classic finger-down game. Track scores on screen. Perfect for parties and group hangouts.",
    type: "solo",
    status: "soon",
    players: "3+ players",
  },
  {
    slug: "wyr",
    icon: "🤷",
    iconBg: "rgba(251,146,60,0.1)",
    nameEn: "Would You Rather?",
    nameFil: "Would You Rather?",
    desc: "Two choices appear — the group debates and votes. Funny, tough, or impossible dilemmas. The arguments are half the fun.",
    type: "solo",
    status: "soon",
    players: "2+ players",
  },
  {
    slug: "likely",
    icon: "🎯",
    iconBg: "rgba(0,56,168,0.15)",
    nameEn: "Most Likely To",
    nameFil: "Most Likely To",
    desc: '"Most likely to stay up until 3am" — the group nominates one person. Tally the nominations and see who wins each category.',
    type: "solo",
    status: "soon",
    players: "3+ players",
  },
];

export const MULTI_GAMES: Game[] = [
  {
    slug: "werewolf",
    href: "/werewolf",
    icon: "🐺",
    iconBg: "rgba(185,28,28,0.12)",
    nameEn: "Werewolf",
    nameFil: "Werewolf",
    desc: "A game of deception and deduction. Every night, the werewolves eliminate a villager. In the morning, everyone votes to eliminate a suspect. Find the werewolves before it's too late.",
    type: "multi",
    status: "available",
    players: "4–15 players",
  },
  {
    slug: "bingo",
    icon: "🎰",
    iconBg: "rgba(167,139,250,0.1)",
    nameEn: "Pinoy Bingo",
    nameFil: "Pinoy Bingo!",
    desc: 'Pop culture bingo cards — "stayed up past 3am?", "fell asleep in class?". Each player\'s card is unique. First bingo wins!',
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
