import { decode } from './uri-decoder';
import { mergeOptions } from './util';
import { ParseOptions } from './query-string';

interface PreparsedValue {
	key: string;
	value: string;
}

interface ParsedMap {
  [key: string]: string | string[] | {} | null
}

function getParserForArrayFormat(options: ParseOptions) {
	switch (options.arrayFormat) {
		case 'index':
			return (accumulator: ParsedMap, { key, value }: PreparsedValue) => {
				const match = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (match === null) {
					accumulator[key] = value;

					return accumulator;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = Object.create(null);
				}

				(accumulator[key] as Object)[match[1]] = value;

				return accumulator;
			};
		case 'bracket':
			return (accumulator: ParsedMap, { key, value }: PreparsedValue) => {
				const match = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (match === null) {
					accumulator[key] = value;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
				} else {
					accumulator[key] = Array.prototype.concat([], accumulator[key], value);
				}

				return accumulator;
			};
		default:
			return (accumulator: ParsedMap, { key, value }: PreparsedValue) => {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
				} else {
          accumulator[key] = Array.prototype.concat([], accumulator[key], value);
				}

				return accumulator;
			};
	}
}

export function parse(input: string, options?: ParseOptions) {
	const mergedOptions = mergeOptions({
		decode: true,
		arrayFormat: 'none'
	}, options) as ParseOptions;

	if (typeof input !== 'string') {
		return Object.create(null);
	}

	input = input.trim().replace(/^[?#&]/, '');

	if (input.length === 0) {
		return Object.create(null);
	}

	const parsed = input
		.split('&')
		.map(param => {
      let [key, value] = param.replace(/\+/g, ' ').split('=');

			value = value === undefined ? null : decode(value, mergedOptions);
			key = decode(key, mergedOptions);

			return { key, value };
		})
		.reduce(
			getParserForArrayFormat(mergedOptions),
			Object.create(null)
    );

  return Object.keys(parsed)
    .sort()
    .reduce((result, key) => {
      const value = parsed[key];

      if (mergedOptions.arrayFormat === 'index'
        && Boolean(value)
        && typeof value === 'object') {

        result[key] = Object.keys(value)
          .sort((a, b) => Number(a) - Number(b))
          .map(index => value[index]);
      } else {
        result[key] = value;
      }

      return result;
    }, Object.create(null));
}

export function extract(input: string) {
	const queryStart = input.indexOf('?');

	if (queryStart === -1) {
		return '';
	}

	return input.slice(queryStart + 1);
}

export function parseUrl(input: string, options: ParseOptions) {
	const hashIndex = input.indexOf('#');

	if (hashIndex > -1) {
		input = input.slice(0, hashIndex);
	}

	return {
		url: input.split('?')[0] || '',
		query: parse(extract(input), options)
	}
}

export default { extract, parse, parseUrl }
