import * as decodeComponent from 'decode-uri-component';
import { ParseOptions } from './query-string';

export function decode(input: string, options: ParseOptions) {
	if (options.decode) {
		return decodeComponent(input);
	}

	return input;
}
