/**
 * The MIT License (MIT)
 *
 * Copyright (c) Sam Verschueren <sam.verschueren@gmail.com> (github.com/SamVerschueren)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { ParseOptions } from './query-string';

const token = '%[a-f0-9]{2}';
const singleMatcher = new RegExp(token, 'gi');
const multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components: string[], split?: number) {
	try {
		// Try to decode the entire string first
		return decodeURIComponent(components.join(''));
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	const left = components.slice(0, split);
	const right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function internalDecode(input: string) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		let tokens = input.match(singleMatcher);

		for (let i = 1; tokens && i < tokens.length; ++i) {
			input = decodeComponents(tokens, i).join('');
			tokens = input.match(singleMatcher);
		}

		return input;
	}
}

function customDecodeURIComponent(input: string) {
  let match;

	// Keep track of all the replacements and prefill the map with the `BOM`
	const replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	while (match = multiMatcher.exec(input)) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			const result = internalDecode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

  Object.keys(replaceMap).forEach(key => {
    // Replace all decoded components
    input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
  });

	return input;
}

export function decode(input: string, options: ParseOptions) {
	if (options.decode) {
    if (typeof input !== 'string') {
      throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof input + '`');
    }

    try {
      input = input.replace(/\+/g, ' ');

      // Try the built in decoder first
      return decodeURIComponent(input);
    } catch (err) {
      // Fallback to a more advanced decoder
      return customDecodeURIComponent(input);
    }
	}

	return input;
}
