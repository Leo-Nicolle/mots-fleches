export type ShortcutId =
  | "toggleDefinition"
  | "exitDefinition"
  | "verticalSplit"
  | "horizontalSplit"
  | "switchMethod"
  | "cycleOrdering"
  | "setDirection"
  | "moveAround";

/**
 * Match a KeyboardEvent against a logical shortcut.
 * This is the single source of truth for the keys used by the editor.
 */
export function matches(evt: KeyboardEvent, id: ShortcutId): boolean {
  const ctrl = evt.ctrlKey || evt.metaKey;
  const key = evt.key;
  switch (id) {
    case "toggleDefinition":
      return key === "Escape";
    case "exitDefinition":
      return ctrl && key === "Enter";
    case "verticalSplit":
      return key === "|";
    case "horizontalSplit":
      return key === "_";
    case "switchMethod":
      return key === " " || evt.code === "Space";
    case "cycleOrdering":
      return key === "<" || key === ">";
    case "setDirection":
      return (
        ctrl &&
        (key === "ArrowUp" ||
          key === "ArrowDown" ||
          key === "ArrowLeft" ||
          key === "ArrowRight")
      );
    case "moveAround":
      return (
        !ctrl &&
        (key === "ArrowUp" ||
          key === "ArrowDown" ||
          key === "ArrowLeft" ||
          key === "ArrowRight")
      );
    default:
      return false;
  }
}

export interface ShortcutEntry {
  id: ShortcutId;
  labelKey: string;
  keys: string[];
}

/**
 * Ordered list of shortcuts to display in the editor help modal.
 */
export const SHORTCUTS: ShortcutEntry[] = [
  { id: "moveAround", labelKey: "shortcuts.moveAround", keys: ["↑", "↓", "←", "→"] },
  { id: "setDirection", labelKey: "shortcuts.setDirection", keys: ["Ctrl + ↑/↓", "Ctrl + ←/→"] },
  { id: "toggleDefinition", labelKey: "shortcuts.toggleDefinition", keys: ["Esc"] },
  { id: "exitDefinition", labelKey: "shortcuts.exitDefinition", keys: ["Ctrl + Enter"] },
  { id: "horizontalSplit", labelKey: "shortcuts.horizontalSplit", keys: ["_"] },
  { id: "verticalSplit", labelKey: "shortcuts.verticalSplit", keys: ["|"] },
  { id: "switchMethod", labelKey: "shortcuts.switchMethod", keys: ["Space"] },
  { id: "cycleOrdering", labelKey: "shortcuts.cycleOrdering", keys: ["<", ">"] },
];
