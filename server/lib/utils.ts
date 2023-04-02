import path from "path";

export function resolve(...args: string[]) {
  return global.MODE && global.MODE === "test"
    ? path.resolve(...args)
    : path.resolve(__dirname, ...args);
}
