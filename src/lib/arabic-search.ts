/**
 * Arabic Language Normalization and Investigative Search Engine
 * Specifically handles Arabic script variations and diacritics:
 * - أ / إ / آ / ٱ -> ا
 * - ة -> ه
 * - ي / ى -> ي
 * - ؤ -> و, ئ -> ي
 * - Removes all Tashkeel (harakat): َ ُ ِ ً ٌ ٍ ّ ْ
 * - Removes Tatweel / Kashida (ـ)
 */

export function normalizeArabic(text: string | null | undefined): string {
  if (!text) return "";

  let norm = text.toString();

  // Remove diacritics (Tashkeel) and tatweel
  norm = norm.replace(/[\u064B-\u0652\u0653-\u065F\u0670\u0640]/g, "");

  // Normalize Alef variations
  norm = norm.replace(/[أإآٱ]/g, "ا");

  // Normalize Ta Marbuta to Ha
  norm = norm.replace(/ة/g, "ه");

  // Normalize Ya and Alef Maqsura
  norm = norm.replace(/[ىي]/g, "ي");

  // Normalize Hamza on Waw / Ya
  norm = norm.replace(/ؤ/g, "و");
  norm = norm.replace(/ئ/g, "ي");

  // Case normalization for latin words and trim
  norm = norm.toLowerCase().trim();

  return norm;
}

export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/[\s\-\(\)\.]/g, "");
}

/**
 * Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

export interface SearchMatch {
  field: string;
  fieldLabel: string;
  originalText: string;
  snippet: string;
  score: number;
}

/**
 * Searches a text with Arabic normalization and fuzzy matching
 */
export function matchArabicQuery(
  rawText: string | null | undefined,
  rawQuery: string,
  field: string,
  fieldLabel: string
): SearchMatch | null {
  if (!rawText || !rawQuery) return null;

  const normQuery = normalizeArabic(rawQuery);
  const normText = normalizeArabic(rawText);

  if (!normQuery) return null;

  // Exact or substring match in normalized text
  const matchIndex = normText.indexOf(normQuery);

  if (matchIndex !== -1) {
    // Generate context snippet around the match
    const start = Math.max(0, matchIndex - 35);
    const end = Math.min(rawText.length, matchIndex + normQuery.length + 35);
    let snippet = rawText.substring(start, end);

    if (start > 0) snippet = "..." + snippet;
    if (end < rawText.length) snippet = snippet + "...";

    return {
      field,
      fieldLabel,
      originalText: rawText,
      snippet,
      score: 100 - matchIndex * 0.1, // Earlier occurrence gets higher score
    };
  }

  // Token-level check (for multi-word queries like "طارق المنصوري" or "سجل اجتماع")
  const queryTokens = normQuery.split(/\s+/).filter(Boolean);
  const textTokens = normText.split(/\s+/).filter(Boolean);

  let matchedTokens = 0;
  for (const qToken of queryTokens) {
    const directHit = textTokens.some((t) => t.includes(qToken));
    if (directHit) {
      matchedTokens++;
      continue;
    }

    // Fuzzy token check if token length >= 3
    if (qToken.length >= 3) {
      const fuzzyHit = textTokens.some((t) => {
        if (Math.abs(t.length - qToken.length) > 2) return false;
        return levenshteinDistance(t, qToken) <= 1;
      });
      if (fuzzyHit) matchedTokens += 0.8;
    }
  }

  if (queryTokens.length > 0 && matchedTokens / queryTokens.length >= 0.6) {
    const score = Math.round((matchedTokens / queryTokens.length) * 80);
    const snippet = rawText.length > 100 ? rawText.substring(0, 100) + "..." : rawText;
    return {
      field,
      fieldLabel,
      originalText: rawText,
      snippet,
      score,
    };
  }

  // Also support phone query matching
  const cleanQueryPhone = normalizePhone(rawQuery);
  const cleanTextPhone = normalizePhone(rawText);
  if (cleanQueryPhone.length >= 3 && cleanTextPhone.includes(cleanQueryPhone)) {
    return {
      field,
      fieldLabel,
      originalText: rawText,
      snippet: rawText,
      score: 95,
    };
  }

  return null;
}
