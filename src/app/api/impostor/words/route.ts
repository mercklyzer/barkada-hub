import type { NextRequest } from "next/server";
import fallbackWords from "@/lib/impostor/fallback-words.json";
import { logger } from "@/lib/logger";
import type { ImpostorWord } from "@/types/impostor";

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

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") ?? "random";
  const language = searchParams.get("language") ?? "filipino";
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const limit = Math.max(10, limitParam);

  const supabase = getSupabase();

  if (supabase) {
    try {
      let query = supabase
        .from("impostor_words")
        .select("*")
        .eq("is_active", true);

      if (category !== "random") {
        query = query.eq("category", category);
      }

      if (language !== "mixed") {
        query = query.eq("language", language);
      }

      const { data, error } = await query.limit(limit * 3);

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("No words returned from Supabase");
      }

      const shuffled = [...data]
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);

      const words: ImpostorWord[] = shuffled.map((row) => ({
        id: row.id,
        word: row.word,
        category: row.category,
        difficulty: row.difficulty,
        language: row.language,
      }));

      return Response.json(
        { words, total: words.length },
        {
          headers: {
            "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
          },
        },
      );
    } catch (err) {
      logger.error("Supabase query failed: impostor words", err, {
        route: "/api/impostor/words",
        method: "GET",
        metadata: { category, language, limit },
      });
      // fall through to fallback
    }
  }

  // Fallback to bundled words
  let filtered = (fallbackWords as ImpostorWord[]).filter((w) => {
    if (category !== "random" && w.category !== category) return false;
    if (language !== "mixed" && w.language !== language) return false;
    return true;
  });

  if (filtered.length === 0) {
    filtered = fallbackWords as ImpostorWord[];
  }

  const shuffled = [...filtered]
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);

  return Response.json(
    { words: shuffled, total: shuffled.length, fallback: true },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
};
