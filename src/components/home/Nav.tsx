import Link from "next/link";
import type { Lang } from "@/lib/home/games";

interface Props {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export const Nav = ({ lang, onLangChange }: Props) => {
  return (
    <nav
      className="sticky top-0 z-[100] flex items-center justify-between px-6 h-14"
      style={{
        background: "rgba(13,17,23,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 font-extrabold text-[1.2rem] tracking-[-0.5px] no-underline"
        style={{ color: "var(--text)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{
            background: "linear-gradient(135deg, var(--blue), var(--red))",
          }}
        >
          🎮
        </div>
        <span>
          <span style={{ color: "var(--gold)" }}>Laro</span> Na!
        </span>
      </Link>

      <div
        className="flex items-center gap-1 p-1 rounded-lg"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {(["en", "fil"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => onLangChange(l)}
            className="text-[0.8rem] font-semibold px-2.5 py-1 rounded-md cursor-pointer border-none transition-all duration-150"
            style={
              lang === l
                ? { background: "var(--blue)", color: "#fff" }
                : { background: "none", color: "var(--muted)" }
            }
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
};
