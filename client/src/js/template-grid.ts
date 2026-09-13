import { Grid, GridState } from "grid";

/**
 * Loads the sample grid used to preview a style from the public template
 * file. Returns a fresh Grid instance every time so callers can mutate it
 * (e.g. resize it) without affecting other callers.
 */
export async function createStyleTemplateGrid(): Promise<Grid> {
  const response = await fetch("/grid-template.json");
  if (!response.ok) {
    throw new Error(`Failed to load grid template: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as GridState;
  return Grid.unserialize(data);
}
