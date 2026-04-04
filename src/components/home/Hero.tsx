export const Hero = () => {
  return (
    <section className="text-center px-6 pt-18 pb-12 max-w-180 mx-auto">
      <div
        className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold tracking-[0.5px] uppercase px-3.5 py-1.5 rounded-full mb-5"
        style={{
          background: "rgba(0,56,168,0.2)",
          border: "1px solid rgba(0,56,168,0.5)",
          color: "#80a8ff",
        }}
      >
        Free Party Games
      </div>
      <h1
        className="font-black leading-[1.05] mb-4"
        style={{ fontSize: "clamp(2.4rem,8vw,4rem)", letterSpacing: "-2px" }}
      >
        <span style={{ color: "var(--gold)" }}>Barkada</span>{" "}
        <span style={{ color: "var(--red)" }}>Hub</span>
      </h1>
      <p
        className="text-[1.05rem] max-w-120 mx-auto mb-8"
        style={{ color: "var(--muted)" }}
      >
        The free, browser-based party game hub. No download, no login — just
        pick a game and play.
      </p>
      <a
        href="#games"
        className="inline-flex items-center gap-2 font-bold text-[0.95rem] px-6 py-3 rounded-xl border-none cursor-pointer no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(252,209,22,0.3)]"
        style={{ background: "var(--gold)", color: "#1a1400" }}
      >
        🎲 Pick a Game
      </a>
    </section>
  );
};
