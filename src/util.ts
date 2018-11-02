import { ParseOptions, StringifyOptions } from './query-string';

export function mergeOptions(to: ParseOptions | StringifyOptions, from?: ParseOptions | StringifyOptions) {
  from = from || {};

	for (let key in from) {
		if (Object.prototype.hasOwnProperty.call(from, key)) {
			to[key] = from[key];
		}
	}

	return to;
}
