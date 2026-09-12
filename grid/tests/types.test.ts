import { describe, it, expect } from 'vitest';
import {
  isSolutionStyle,
  isGoogleFont,
  isCustomFont,
  defaultStyles,
  defaultSolutionStyle,
} from '../src/types';

describe('isSolutionStyle', () => {
  it('detects a solution style', () => {
    expect(isSolutionStyle(defaultSolutionStyle)).toBe(true);
    expect(isSolutionStyle(defaultStyles)).toBeFalsy();
  });
});

describe('font guards', () => {
  it('isGoogleFont detects google fonts', () => {
    expect(isGoogleFont({ isGoogle: true, family: 'Roboto', weight: '400' })).toBe(true);
    expect(isGoogleFont({ isGoogle: false, family: 'X', weight: '400', content: 'x' })).toBe(false);
  });

  it('isCustomFont detects custom fonts', () => {
    expect(isCustomFont({ isGoogle: false, family: 'X', weight: '400', content: 'x' })).toBe(true);
    expect(isCustomFont({ isGoogle: true, family: 'Roboto', weight: '400' })).toBe(false);
  });
});
