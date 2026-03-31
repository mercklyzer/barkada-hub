export function Footer() {
  return (
    <footer
      className="px-6 py-7 text-center text-[0.82rem]"
      style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
    >
      <p>
        <a href="#" style={{ color: "var(--muted)", textDecoration: "none" }}>
          About
        </a>
        &nbsp;·&nbsp;
        <a href="#" style={{ color: "var(--muted)", textDecoration: "none" }}>
          Suggest a Game
        </a>
        &nbsp;·&nbsp;
        <a href="#" style={{ color: "var(--muted)", textDecoration: "none" }}>
          Report a Bug
        </a>
      </p>
      <p className="mt-2 text-[0.75rem]">No login. No download. Libre. 🇵🇭</p>
    </footer>
  );
}
