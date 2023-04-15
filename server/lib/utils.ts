import path from "path";

export function resolve(...args: string[]) {
  return global.APP_CROSSWORDS_MODE && global.APP_CROSSWORDS_MODE === "test"
    ? path.resolve(...args)
    : path.resolve(__dirname, ...args);
}
