import { StringifyOptions } from './query-string';

export function encode(input: any, options: StringifyOptions) {
	if (!options.encode) {
		return input;
	}

	if (options.strict) {
		return encodeURIComponent(input)
			.replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
	}

	return encodeURIComponent(input);
}
