import { mergeOptions } from './util';
import { StringifyOptions } from './query-string';
import { encode } from './uri-encoder';

function getEncoderForArrayFormat(options: StringifyOptions):
  (key: string, value: any, index: number) => string {

	switch (options.arrayFormat) {
		case 'index':
			return (key: string, value: any, index: number) => {
				return value === null ? [
					encode(key, options),
					'[',
					index,
					']'
				].join('') : [
					encode(key, options),
					'[',
					encode(index, options),
					']=',
					encode(value, options)
				].join('');
			};
		case 'bracket':
			return (key: string, value: any, _index: number) => {
				return value === null ? [
					encode(key, options),
					'[]'
				].join('') : [
					encode(key, options),
					'[]=',
					encode(value, options)
				].join('');
			};
		default:
			return (key: string, value: any, _index: number) => {
				return value === null ? encode(key, options) : [
					encode(key, options),
					'=',
					encode(value, options)
				].join('');
			};
	}
}

export function stringify(obj: Object, options: StringifyOptions) {
	if (!obj) {
		return '';
	}

	const mergedOptions = mergeOptions({
		encode: true,
		strict: true,
		sort: true,
		arrayFormat: 'none'
	}, options) as StringifyOptions;

	const keys = Object.keys(obj);

	if (mergedOptions.sort === true || mergedOptions.sort === undefined) {
		keys.sort();
	}

	if (typeof mergedOptions.sort === 'function') {
		keys.sort(mergedOptions.sort);
	}

	return keys.map(key => {
		const value = obj[key];

		if (value === undefined) {
			return '';
		}

		if (value === null) {
			return encode(key, mergedOptions);
		}

		if (Array.isArray(value)) {
			const encode = getEncoderForArrayFormat(mergedOptions);
			const result: string[] = [];

			for (let index = 0; index < value.length; ++index) {
				if (value[index] === undefined) {
					continue;
				}

				result.push(encode(key, value[index], result.length));
			}

      return result.join('&');
		}

		return encode(key, mergedOptions) + '=' + encode(value, mergedOptions);
	}).filter(x => x.length > 0).join('&');
}

export default { stringify };
