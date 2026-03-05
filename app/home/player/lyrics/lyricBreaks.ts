import type { LyricCue } from "@/lib/types";

export const PARA_BREAK = "__PARA_BREAK__" as const;

export function isParaBreakCue(cue: LyricCue): boolean {
  return cue.text === PARA_BREAK;
}

export type LyricParagraph = { key: string; cues: LyricCue[] };

export function toLyricParagraphs(cues: LyricCue[]): LyricParagraph[] {
  const out: LyricParagraph[] = [];
  let cur: LyricCue[] = [];
  let paraIdx = 0;

  for (const c of cues) {
    if (isParaBreakCue(c)) {
      if (cur.length) {
        out.push({ key: `p-${paraIdx}`, cues: cur });
        paraIdx += 1;
      }
      cur = [];
      continue;
    }
    cur.push(c);
  }

  if (cur.length) out.push({ key: `p-${paraIdx}`, cues: cur });
  return out;
}