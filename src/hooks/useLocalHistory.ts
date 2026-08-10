import { useEffect, useState } from "react";

const RECENT_KEY = "wagi_recently_viewed_v1";
const SEARCH_KEY = "wagi_recent_searches_v1";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Tracks recently viewed product ids locally so the home page can show them. */
export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(read(RECENT_KEY)), []);
  return {
    ids,
    track: (productId: string) => {
      const next = [productId, ...read(RECENT_KEY).filter((id) => id !== productId)].slice(0, 12);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setIds(next);
    },
  };
}

/** Search history for the search bar suggestions. */
export function useRecentSearches() {
  const [terms, setTerms] = useState<string[]>([]);
  useEffect(() => setTerms(read(SEARCH_KEY)), []);
  return {
    terms,
    add: (term: string) => {
      const clean = term.trim();
      if (!clean) return;
      const next = [
        clean,
        ...read(SEARCH_KEY).filter((t) => t.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, 8);
      window.localStorage.setItem(SEARCH_KEY, JSON.stringify(next));
      setTerms(next);
    },
    clear: () => {
      window.localStorage.removeItem(SEARCH_KEY);
      setTerms([]);
    },
  };
}
