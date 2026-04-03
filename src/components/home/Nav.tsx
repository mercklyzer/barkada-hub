import Link from "next/link";

export const Nav = () => {
  return (
    <nav
      className="sticky top-0 z-\[100\] flex items-center justify-between px-6 h-14"
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
          <span style={{ color: "var(--gold)" }}>Barkada</span> Hub
        </span>
      </Link>
    </nav>
  );
};
