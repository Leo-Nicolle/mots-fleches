import { cellWidth, GridStyle, normalizeDefinitionText } from "grid";
import { definitionFontSize } from "../components/svg-renderer/utils";
import preferences from "./preferences";

let measureCtx: CanvasRenderingContext2D | null = null;
function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCtx) {
    measureCtx = document.createElement("canvas").getContext("2d")!;
  }
  return measureCtx;
}

/**
 * Breaks a single word that doesn't fit on its own line into hyphenated
 * chunks ("chunk-", "chunk-", ..., "rest"), each fitting within maxWidth.
 */
export function hyphenateWord(word: string, ctx: CanvasRenderingContext2D, maxWidth: number): string[] {
  const pieces: string[] = [];
  let current = "";
  for (const char of word) {
    const candidate = current + char + "-";
    if (current && ctx.measureText(candidate).width > maxWidth) {
      pieces.push(`${current}-`);
      current = char;
    } else {
      current += char;
    }
  }
  pieces.push(current);
  return pieces;
}

/**
 * Greedily wraps a single paragraph (no forced breaks) so each resulting
 * line fits within maxWidth, per the ctx's current font. A word too wide to
 * fit on a line by itself is cut with a hyphen instead of overflowing.
 */
export function wrapParagraph(paragraph: string, ctx: CanvasRenderingContext2D, maxWidth: number): string {
  if (!paragraph) return paragraph;
  const words = paragraph.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
    } else {
      const pieces = hyphenateWord(word, ctx, maxWidth);
      lines.push(...pieces.slice(0, -1));
      current = pieces[pieces.length - 1];
    }
  }
  lines.push(current);
  return lines.join("\n");
}

/**
 * Recomputes line wrapping for a definition cell's text so it fits the
 * cell's width, without touching the user's own line breaks: the existing
 * "\n" and (single) "\n\n" split are treated as hard boundaries, and this
 * only ever adds "\n" inside a boundary-delimited segment that overflows.
 * @param text already-normalized definition text (see normalizeDefinitionText)
 */
export function autoLayoutDefinitionText(
  text: string,
  style: GridStyle,
  fontSizePx: number,
  zoom: number
): string {
  const ctx = getMeasureCtx();
  ctx.font = `${style.definition.weight} ${fontSizePx}px ${style.definition.family}`;
  const maxWidth = cellWidth(style) * zoom;
  return text
    .split("\n\n")
    .map((half) => half.split("\n").map((p) => wrapParagraph(p, ctx, maxWidth)).join("\n"))
    .join("\n\n");
}

/**
 * Normalizes a definition cell's text and, if the global auto-layout
 * preference is on, auto-wraps it — the single entry point every place that
 * writes definition text (the on-grid input, the left-panel suggestions
 * list, ...) should call before handing text to Grid.setText, so they all
 * behave the same way.
 */
export function layoutDefinitionText(text: string, style: GridStyle, zoom = 1): string {
  const normalized = normalizeDefinitionText(text);
  if (!preferences.get("editing.autoLayoutDefinitions")) return normalized;
  return autoLayoutDefinitionText(normalized, style, definitionFontSize(style, zoom), zoom);
}
