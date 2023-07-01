import { GridStyle, SolutionStyle, defaultStyles, defaultSolutionStyle } from "grid";
import merge from "merge";


export function mergeOptionsWithDefaults(option: SolutionStyle | GridStyle) {
  return merge.recursive({}, 
    (option as unknown as SolutionStyle).isSolution ? defaultSolutionStyle :
    defaultStyles, option);
}