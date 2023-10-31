import { LocalFont } from "grid";

export function loadFont(font: LocalFont) {
  const fontface = new FontFace(font.family, `url(${font.content})`);
  return fontface.load()
    .then((fontface) => document.fonts.add(fontface));
}