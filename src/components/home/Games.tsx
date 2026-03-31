import {
  FILTER_OPTIONS,
  type Filter,
  MULTI_GAMES,
  SOLO_GAMES,
} from "@/lib/home/games";
import { GameSection } from "./GameSection";

const SOLO_SECTION = {
  title: "Solo Device Games",
  badge: "📱 One shared phone",
  badgeStyle: {
    background: "rgba(252,209,22,0.12)",
    color: "#fcd116",
    border: "1px solid rgba(252,209,22,0.25)",
  },
  dotColor: "var(--gold)",
};

const MULTI_SECTION = {
  title: "Multi-Device Games",
  badge: "📱📱 Everyone uses their own phone",
  badgeStyle: {
    background: "rgba(0,56,168,0.15)",
    color: "#80a8ff",
    border: "1px solid rgba(0,56,168,0.3)",
  },
  dotColor: "var(--blue)",
};

interface Props {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export const Games = ({ filter, onFilterChange }: Props) => {
  const visibleSolo = SOLO_GAMES.filter(
    (g) =>
      filter !== "multi" &&
      (filter !== "available" || g.status === "available"),
  );
  const visibleMulti = MULTI_GAMES.filter(
    (g) =>
      filter !== "solo" && (filter !== "available" || g.status === "available"),
  );

  return (
    <div id="games" className="max-w-[1100px] mx-auto px-6 pb-16">
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className="text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-full cursor-pointer border-none transition-all duration-150"
            style={
              filter === value
                ? {
                    background: "var(--gold)",
                    color: "#1a1400",
                    border: "1px solid var(--gold)",
                  }
                : {
                    background: "var(--surface)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {visibleSolo.length > 0 && (
        <GameSection {...SOLO_SECTION} games={visibleSolo} />
      )}
      {visibleMulti.length > 0 && (
        <GameSection {...MULTI_SECTION} games={visibleMulti} />
      )}
    </div>
  );
};
