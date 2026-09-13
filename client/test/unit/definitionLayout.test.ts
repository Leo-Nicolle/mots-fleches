import { describe, it, expect } from 'vitest';
import { wrapParagraph, hyphenateWord } from '../../src/js/definitionLayout';

// A fake measuring context: every character has a fixed width, so widths in
// the assertions below are easy to reason about without a real canvas.
function fakeCtx(charWidth = 10): CanvasRenderingContext2D {
  return {
    measureText: (text: string) => ({ width: text.length * charWidth }),
  } as unknown as CanvasRenderingContext2D;
}

describe('hyphenateWord', () => {
  it('cuts a word into hyphenated pieces that each fit maxWidth', () => {
    const ctx = fakeCtx(10);
    const pieces = hyphenateWord('abstraction', ctx, 50);
    expect(pieces.length).toBeGreaterThan(1);
    pieces.slice(0, -1).forEach((p) => expect(p.endsWith('-')).toBe(true));
    pieces.forEach((p) => expect(ctx.measureText(p).width).toBeLessThanOrEqual(50));
    expect(pieces.join('').replace(/-/g, '')).toBe('abstraction');
  });

  it('keeps at least one character per piece even on a very narrow width', () => {
    const ctx = fakeCtx(10);
    const pieces = hyphenateWord('ab', ctx, 5);
    expect(pieces.join('').replace(/-/g, '')).toBe('ab');
  });
});

describe('wrapParagraph', () => {
  it('wraps at spaces when words fit, without adding hyphens', () => {
    const ctx = fakeCtx(10);
    const result = wrapParagraph('hello world', ctx, 60);
    expect(result).not.toContain('-');
    expect(result.split('\n').every((line) => ctx.measureText(line).width <= 60)).toBe(true);
  });

  it('leaves short text on one line', () => {
    const ctx = fakeCtx(10);
    expect(wrapParagraph('hi', ctx, 60)).toBe('hi');
  });

  it('hyphenates a single word too wide to fit on its own line', () => {
    const ctx = fakeCtx(10);
    const result = wrapParagraph('supercalifragilisticexpialidocious', ctx, 50);
    const lines = result.split('\n');
    expect(lines.length).toBeGreaterThan(1);
    lines.slice(0, -1).forEach((l) => expect(l.endsWith('-')).toBe(true));
    expect(lines.join('').replace(/-/g, '')).toBe('supercalifragilisticexpialidocious');
  });

  it('hyphenates an overlong word even when it is the first word', () => {
    const ctx = fakeCtx(10);
    const result = wrapParagraph('supercalifragilisticexpialidocious short', ctx, 50);
    expect(result.split('\n')[0].endsWith('-')).toBe(true);
  });
});
