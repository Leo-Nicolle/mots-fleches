import { LocalFont } from "grid";
import { api } from "../../api";
export const loadedFonts = new Set();

export function loadFont(font: LocalFont) {
  if (loadedFonts.has(font.family)) {
    return Promise.resolve();
  }
  return api.db.getFont(font.family)
    .then((font) => {
      const fontface = new FontFace(font.family, `url(${font.content})`);
      return fontface.load();
    })
    .then((fontface) => {
      loadedFonts.add(font.family);
      document.fonts.add(fontface);
    });
}