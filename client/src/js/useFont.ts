import { TextStyle } from 'grid';

export function getFont(value?: TextStyle) {
  return value ? `${value.weight} ${value.size} ${value.family}` : '';
}