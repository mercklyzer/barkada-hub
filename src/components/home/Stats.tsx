const STATS = [
  { num: "3+", label: "Games" },
  { num: "2 - 8", label: "Players" },
  { num: "0", label: "Downloads needed" },
  { num: "Free", label: "Forever" },
];

export const Stats = () => {
  return (
    <div
      className="flex gap-8 justify-center flex-wrap px-6 py-6 mb-12"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {STATS.map(({ num, label }) => (
        <div key={label} className="text-center">
          <div
            className="text-[1.6rem] font-black tracking-[-1px]"
            style={{ color: "var(--gold)" }}
          >
            {num}
          </div>
          <div
            className="text-[0.75rem] font-medium mt-0.5"
            style={{ color: "var(--muted)" }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
};
