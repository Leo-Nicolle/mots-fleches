import { Font } from "database";

export function loadFont(font: Font) {
  const fontface = new FontFace(font.family, `url(${font.content})`);
  return fontface.load()
    .then((fontface) => document.fonts.add(fontface));
}