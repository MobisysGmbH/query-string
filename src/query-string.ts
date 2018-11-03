import parser from './parser';
import stringifier from './stringifier';

export type CompareFn = (a: string, b: string) => number;

export type ArrayFormat = 'none' | 'bracket' | 'index';

export interface ParseOptions {
  decode?: boolean
  arrayFormat?: ArrayFormat
}

export interface StringifyOptions {
  encode?: boolean;
  strict?: boolean;
  arrayFormat?: ArrayFormat;
  sort?: boolean | CompareFn;
}

export const { extract, parse, parseUrl } = parser;
export const { stringify } = stringifier;

export default { ...parser, ...stringifier }
