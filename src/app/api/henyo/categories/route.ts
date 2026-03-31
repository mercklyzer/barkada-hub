const getSupabase = () => {
  try {
    const { supabase } = require("@/lib/supabase") as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
    };
    return supabase;
  } catch {
    return null;
  }
};

const CATEGORY_META: Record<string, { label: string; englishLabel: string }> = {
  tao: { label: "Tao", englishLabel: "Person" },
  bagay: { label: "Bagay", englishLabel: "Object" },
  lugar: { label: "Lugar", englishLabel: "Place" },
  hayop: { label: "Hayop", englishLabel: "Animal" },
  pagkain: { label: "Pagkain", englishLabel: "Food" },
  pelikula: { label: "Pelikula", englishLabel: "Movie / Show" },
  kanta: { label: "Kanta", englishLabel: "Song" },
  palaro: { label: "Palaro", englishLabel: "Sport / Game" },
};

export const GET = async () => {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("henyo_words")
        .select("category")
        .eq("is_active", true);

      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.category] = (counts[row.category] ?? 0) + 1;
      }

      const categories = Object.entries(CATEGORY_META).map(([key, meta]) => ({
        key,
        label: meta.label,
        englishLabel: meta.englishLabel,
        count: counts[key] ?? 0,
      }));

      return Response.json({ categories });
    } catch {
      // fall through to static fallback
    }
  }

  // Static fallback
  const categories = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    englishLabel: meta.englishLabel,
    count: 0,
  }));
  return Response.json({ categories });
};
