function extRoman() {
	'use strict';

	var converter = this;
	var optionUppercase = true;
	var optionStrict = true;


	var undefined;
	var messageBadOrder = "Found unexpected sorting order: '$1' followed by '$2' (using strict sorting order).";
	var messageBadOrderNonstrict = "Found unexpected sorting order: '$1' followed by '$2' (using non-strict sorting order)";
	var messageBadRepetition = "Found unexpected repetition: '$1' $2 times in a row";

	var strictConversions = {
		M: 1000, CM: 900, D: 500, CD: 400,
		C: 100, XC: 90, L: 50, XL: 40,
		X: 10, IX: 9, V: 5, IV: 4, I: 1,
	};
	var repetitionAllowed = {
		M: 3, C: 4, X: 4, I: 4,
	};
	var classes = {
		M: 6,
		D: 5, C: 5,
		CM: 4, CD: 4,
		LM: 3, LD: 3, L: 3, X: 3,
		XM: 2, XD: 2, XC: 2, XL: 2,
		VM: 1, VD: 1, VC: 1, VL: 1, V: 1, I: 1,
		IM: 0, ID: 0, IC: 0, IL: 0, IX: 0, IV: 0,
	};
	var classes2 = {
		D: 3, CD: 3,
		L: 2, XL: 2,
		V: 1, IV: 1,
	};
	var nonstrictConversions = {
		M: 1000, IM: 999, VM: 995, XM: 990, LM: 950, CM: 900,
		D: 500, ID: 499, VD: 495, XD: 490, LD: 450, CD: 400,
		C: 100, IC: 99, VC: 95, XC: 90,
		L: 50, IL: 49, VL: 45, XL: 40,
		X: 10, IX: 9, V: 5, IV: 4, I: 1,
	};


	function isValidTo(toBase, number) {
		return (
			toBase === 'roman'
			&& number instanceof converter.Big
			&& number.gt(0)
			&& number.lt(4000)
			&& number.eq(number.floor()) // Is integer.
		);
	}

	function log(message, $1, $2) {
		console.log(
			'[Base:roman]',
			message
				.replace('$1', $1)
				.replace('$2', $2)
		);
	}

	return {
		/*
			always accept
				IIII = 4
			never accept
				IIIII = 5
				IXIX = 18
				IXIV = 13
		*/
		from: function (fromBase, number) {
			if (fromBase !== 'roman' || !/^[IVXLCDM]+$/i.test(number)) {
				return;
			}

			// inspiration taken from Netzreport (http://netzreport.googlepages.com/index_en.html)
			number = number.toUpperCase();
			var
				result = 0, // we know that it's sufficient to use JavaScript's own numbers
				conv = optionStrict ? strictConversions : nonstrictConversions,
				token,
				next,
				value,
				klass,
				class2,
				lastToken,
				lastValue = 10000, // something greater than M = 1000
				lastClass = 7, // something greater than the greatest class, M: 6
				lastClass2 = 4, // something greater than the greatest class, D: 3
				repetitionCount;

			// tokenize
			for (var i = 0; i < number.length; i++) {
				token = number.charAt(i);
				next = number.charAt(i+1);
				// lookahead one character to find this token's value
				if (i+1 < number.length && conv[token+next]) { // there's another character to look at
					// yep, this is a token: let's add the next character to i
					token += next;

					// and skip the next character since it's part of *this* token
					i++;
				}
				value = conv[token];
				klass = classes[token];
				class2 = classes2[token];
				if (lastValue === value) {
					repetitionCount++;
				} else {
					repetitionCount = 1;
				}

				if (lastValue < value || lastClass < klass) {
					return log(optionStrict ? messageBadOrder : messageBadOrderNonstrict,
						lastToken,
						token);
				} else if (lastClass === klass) {
					if (!repetitionAllowed[token]) {
						return log(optionStrict ? messageBadOrder : messageBadOrderNonstrict,
							lastToken,
							token);
					} else if (lastValue === value && repetitionCount > repetitionAllowed[token]) {
						// We accept repetition 4 times (as in IIII instead of IV), but not 5.
						return log(messageBadRepetition, token, repetitionCount);
					}
				} else if (class2 !== undefined && lastClass2 === class2) {
					return log(optionStrict ? messageBadOrder : messageBadOrderNonstrict,
						lastToken,
						token);
				}
				result += value;
				lastValue = value;
				lastClass = klass;
				lastClass2 = class2;
			}
			return converter.Big(result);
		},

		// toBase will always be 'roman'
		to: function (toBase, number) {
			if (!isValidTo(toBase, number)) {
				return;
			}

			// the primitive value will always be sufficient for roman numerals
			number = +number.valueOf();
			var i, result = '';
			for (i in strictConversions) {
				while (number >= strictConversions[i]) {
					number -= strictConversions[i];
					result += i;
				}
			}
			return (optionUppercase ?
				result :
				result.toLowerCase());
		},

		getName: function (base) {
			if (base === 'roman') {
				return 'roman numerals';
			}
		},

		suggest: function (baseText, reBaseText) {
			if (/^rom/i.test(baseText)) {
				// Close enough match.
				return { match: [['roman', 'roman numerals']] };
			} else if (reBaseText.test('roman numerals')) {
				return { proposed: [['roman', 'roman numerals']] };
			} else {
				return {};
			}
		},
	};
}
