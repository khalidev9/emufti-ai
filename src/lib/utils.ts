import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Citation, Message } from '../types/database.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Arabic text detection regex (Arabic and Arabic Supplement Unicode blocks)
export function isArabic(text: string): boolean {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

// Determines if a string is predominantly in Arabic (useful for RTL paragraph layout vs. mixed quotes)
export function isPredominantlyArabic(text: string): boolean {
  if (!text) return false;
  const clean = text.replace(/[\s\d\p{P}]/gu, '');
  if (!clean) return false;
  const arabicChars = (clean.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  return arabicChars / clean.length > 0.45;
}

// Format relative date into ChatGPT-style groups: Today, Yesterday, Previous 7 Days, Older
export function getRelativeDateGroup(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (date >= startOfToday) {
    return 'Today';
  } else if (date >= startOfYesterday) {
    return 'Yesterday';
  } else if (date >= sevenDaysAgo) {
    return 'Previous 7 Days';
  } else if (date >= thirtyDaysAgo) {
    return 'Previous 30 Days';
  } else {
    return 'Older';
  }
}

// Format message time
export function formatMessageTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format readable date
export function formatReadableDate(dateInput: string | Date): string {
  const date = new Date(dateInput);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Extract Quran and Hadith citations from AI message content
export function extractCitations(content: string): Citation[] {
  const citations: Citation[] = [];
  let idCounter = 1;

  // Regex for Quran Surah citations like [Surah Al-Baqarah 2:183] or Quran (2:183) or Surah An-Nisa 4:1
  const quranRegex = /(?:Surah|Sūrah|Quran|Qur'an)\s+([A-Za-z\-'\s]+)?\s*\(?(\d{1,3}):(\d{1,3}(?:-\d{1,3})?)\)?/gi;
  let match;
  while ((match = quranRegex.exec(content)) !== null) {
    const surahName = (match[1] || '').trim();
    const chapter = match[2];
    const verse = match[3];
    const startVerse = verse ? verse.split('-')[0].trim() : '1';
    citations.push({
      id: `cite-q-${idCounter++}`,
      type: 'quran',
      reference: surahName ? `Surah ${surahName} (${chapter}:${verse})` : `Quran (${chapter}:${verse})`,
      source: 'Holy Quran',
      verified: true,
      url: `https://quran.com/${chapter}/${startVerse}`,
    });
  }

  // Regex for Hadith collections like Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, etc.
  const hadithRegex = /(Sahih\s+(?:al-)?Bukhari|Sahih\s+Muslim|Sunan\s+(?:Abi\s+Dawud|al-Tirmidhi|an-Nasa'i|Ibn\s+Majah)|Musnad\s+Ahmad|Muwatta\s+Malik)(?:\s+(?:hadith|no\.?|#)?\s*(\d+))?/gi;
  while ((match = hadithRegex.exec(content)) !== null) {
    const collection = match[1];
    const number = match[2];
    let hadithUrl = `https://sunnah.com/search?q=${encodeURIComponent(collection + ' ' + (number || ''))}`;
    const colLower = collection.toLowerCase();
    if (number) {
      if (colLower.includes('bukhari')) hadithUrl = `https://sunnah.com/bukhari:${number}`;
      else if (colLower.includes('muslim')) hadithUrl = `https://sunnah.com/muslim:${number}`;
      else if (colLower.includes('dawud')) hadithUrl = `https://sunnah.com/abudawud:${number}`;
      else if (colLower.includes('tirmidhi')) hadithUrl = `https://sunnah.com/tirmidhi:${number}`;
      else if (colLower.includes('nasa')) hadithUrl = `https://sunnah.com/nasai:${number}`;
      else if (colLower.includes('majah')) hadithUrl = `https://sunnah.com/ibnmajah:${number}`;
    }

    citations.push({
      id: `cite-h-${idCounter++}`,
      type: 'hadith',
      reference: number ? `${collection} (${number})` : collection,
      source: collection,
      verified: true,
      url: hadithUrl,
    });
  }

  // Deduplicate by reference
  const uniqueCitations: Citation[] = [];
  const seen = new Set<string>();
  for (const c of citations) {
    if (!seen.has(c.reference)) {
      seen.add(c.reference);
      uniqueCitations.push(c);
    }
  }

  return uniqueCitations;
}

// Truncate text cleanly
export function truncate(text: string, length = 32): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// Export conversation to Markdown
export function exportConversationToMarkdown(title: string, messages: Message[]): string {
  let md = `# ${title}\n*Exported from EMufti AI on ${new Date().toLocaleString()}*\n\n---\n\n`;
  for (const msg of messages) {
    const roleName = msg.role === 'user' ? '👤 User' : '🕌 EMufti AI';
    md += `### ${roleName} (${new Date(msg.created_at).toLocaleTimeString()})\n\n`;
    md += `${msg.content}\n\n---\n\n`;
  }
  md += `\n*Note: EMufti AI answers are educational. For personal legal rulings, consult a certified scholar.*`;
  return md;
}

// Export conversation to JSON
export function exportConversationToJson(title: string, messages: Message[]): string {
  const payload = {
    title,
    exported_at: new Date().toISOString(),
    platform: 'EMufti AI',
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      created_at: m.created_at,
      status: m.status,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

// Download string as file helper
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
