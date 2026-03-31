import type { Game } from "@/lib/home/games";
import { GameCard } from "./GameCard";

interface Props {
  title: string;
  badge: string;
  badgeStyle: React.CSSProperties;
  dotColor: string;
  games: Game[];
}

export const GameSection = ({
  title,
  badge,
  badgeStyle,
  dotColor,
  games,
}: Props) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div
          className="flex items-center gap-2.5 text-[1.1rem] font-bold"
          style={{ color: "var(--text)" }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: dotColor }}
          />
          {title}
        </div>
        <span
          className="text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-md whitespace-nowrap"
          style={badgeStyle}
        >
          {badge}
        </span>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {games.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
    </div>
  );
};
