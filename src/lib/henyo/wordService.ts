import type { HenyoWord, HenyoCategory } from "@/types/henyo";
import fallbackWords from "./fallback-words.json";

const CACHE_KEY = "henyo_words_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface WordCache {
  words: HenyoWord[];
  fetchedAt: number;
  category: string;
}

export async function fetchWords(
  category: HenyoCategory,
  limit = 20,
): Promise<HenyoWord[]> {
  // Check session cache first
  const cached = getCache(category);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({ category, limit: String(limit) });
    const res = await fetch(`/api/henyo/words?${params}`);
    if (!res.ok) throw new Error("Failed to fetch words");

    const data = await res.json();
    setCache(category, data.words);
    return data.words as HenyoWord[];
  } catch {
    // Silent fallback — log to PostHog
    if (typeof window !== "undefined") {
      try {
        const { default: posthog } = await import("posthog-js");
        posthog.capture("henyo_fallback_words_used", { category });
      } catch {
        // ignore analytics errors
      }
    }

    let filtered = (fallbackWords as HenyoWord[]).filter((w) => {
      if (category !== "random" && w.category !== category) return false;
      return true;
    });

    if (filtered.length === 0) {
      filtered = fallbackWords as HenyoWord[];
    }

    return filtered
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(10, limit));
  }
}

function getCache(category: string): HenyoWord[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: WordCache = JSON.parse(raw);
    if (
      cache.category === category &&
      Date.now() - cache.fetchedAt < CACHE_TTL_MS
    ) {
      return cache.words;
    }
  } catch {
    // ignore
  }
  return null;
}

function setCache(category: string, words: HenyoWord[]): void {
  try {
    const cache: WordCache = { words, fetchedAt: Date.now(), category };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
}
