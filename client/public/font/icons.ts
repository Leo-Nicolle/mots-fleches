export type IconsId =
  | "arrow"
  | "curved"
  | "dog"
  | "elephant";

export type IconsKey =
  | "Arrow"
  | "Curved"
  | "Dog"
  | "Elephant";

export enum Icons {
  Arrow = "arrow",
  Curved = "curved",
  Dog = "dog",
  Elephant = "elephant",
}

export const ICONS_CODEPOINTS: { [key in Icons]: string } = {
  [Icons.Arrow]: "61697",
  [Icons.Curved]: "61698",
  [Icons.Dog]: "61699",
  [Icons.Elephant]: "61700",
};
