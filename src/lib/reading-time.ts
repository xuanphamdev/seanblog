import type { Locale } from "./site-config";

const WPM = 200;

/** Count "words" — for VI we split on whitespace, decent approximation. */
function countWords(text: string): number {
  return text
    .replace(/```[\s\S]*?```/g, " ") // strip fenced code
    .replace(/[#*_`>\[\]()]/g, " ") // strip md punctuation
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export interface ReadingStats {
  words: number;
  minutes: number;
  label: string;
}

export function readingTime(body: string, lang: Locale): ReadingStats {
  const words = countWords(body);
  const minutes = Math.max(1, Math.round(words / WPM));
  const label =
    lang === "vi" ? `${minutes} phút đọc` : `${minutes} min read`;
  return { words, minutes, label };
}
