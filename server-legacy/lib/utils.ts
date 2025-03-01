import path from "path";

/**
 * Resolve files path (depending on mode)
 * @param The path to resolve
 * @returns The resolved path
 */
export function resolve(...args: string[]) {
  return global.APP_CROSSWORDS_MODE && global.APP_CROSSWORDS_MODE === "test"
    ? path.resolve(...args)
    : path.resolve(__dirname, ...args);
}
