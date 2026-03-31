import Link from "next/link";
import type { Game } from "@/lib/home/games";

const STATUS_BADGE = {
  soon: {
    style: {
      background: "rgba(113,128,150,0.15)",
      color: "var(--muted)",
      border: "1px solid var(--border)",
    },
    label: "Coming Soon",
  },
  available: {
    style: {
      background: "rgba(52,211,153,0.15)",
      color: "#34d399",
      border: "1px solid rgba(52,211,153,0.3)",
    },
    label: "Available",
  },
};

const TYPE_BADGE = {
  solo: {
    style: {
      background: "rgba(252,209,22,0.12)",
      color: "#fcd116",
      border: "1px solid rgba(252,209,22,0.25)",
    },
    label: "📱 Solo Device",
  },
  multi: {
    style: {
      background: "rgba(0,56,168,0.15)",
      color: "#80a8ff",
      border: "1px solid rgba(0,56,168,0.3)",
    },
    label: "📱📱 Multi-Device",
  },
};

const GameCardContent = ({ game }: { game: Game }) => {
  const isSoon = game.status === "soon";
  const statusBadge = STATUS_BADGE[game.status];
  const typeBadge = TYPE_BADGE[game.type];

  return (
    <>
      <div className="flex items-start justify-between gap-2 mb-3.5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: game.iconBg }}
        >
          {game.icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-[0.7rem] font-bold tracking-[0.5px] uppercase px-2 py-0.5 rounded-[5px]"
            style={statusBadge.style}
          >
            {statusBadge.label}
          </span>
          <span
            className="text-[0.7rem] font-medium"
            style={{ color: "var(--muted)" }}
          >
            {game.players}
          </span>
        </div>
      </div>

      <div
        className="text-[1.05rem] font-extrabold leading-tight mb-0.5"
        style={{ color: "var(--text)" }}
      >
        {game.nameEn}
      </div>
      <div
        className="text-[0.8rem] italic mb-2.5"
        style={{ color: "var(--muted)" }}
      >
        {game.nameFil}
      </div>
      <div
        className="text-[0.85rem] leading-relaxed"
        style={{ color: "var(--muted)" }}
      >
        {game.desc}
      </div>

      <div
        className="flex items-center justify-between mt-4 pt-3.5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span
          className="text-[0.75rem] font-semibold px-2.5 py-0.5 rounded-md"
          style={typeBadge.style}
        >
          {typeBadge.label}
        </span>
        {isSoon ? (
          <span
            className="text-[0.82rem] font-semibold"
            style={{ color: "var(--muted)" }}
          >
            Coming soon
          </span>
        ) : (
          <span
            className="text-[0.82rem] font-bold"
            style={{ color: "var(--gold)" }}
          >
            Play now →
          </span>
        )}
      </div>
    </>
  );
};

const cardBase = {
  background: "var(--card)",
  border: "1px solid var(--border)",
};

export const GameCard = ({ game }: { game: Game }) => {
  if (game.status === "soon") {
    return (
      <div
        className="rounded-[14px] p-5 relative overflow-hidden opacity-55 cursor-default"
        style={cardBase}
      >
        <GameCardContent game={game} />
      </div>
    );
  }

  return (
    <Link
      href={game.href!}
      className="game-card-link block rounded-[14px] p-5 relative overflow-hidden transition-all duration-[0.18s]"
      style={{ ...cardBase, color: "inherit", textDecoration: "none" }}
    >
      <GameCardContent game={game} />
    </Link>
  );
};
