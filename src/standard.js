function extStandard() {
	'use strict';
	var undefined;
	var converter = this;
	var Base = converter.constructor;
	var dictionary = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var dictionaryArr = dictionary.split('');


	var reValidNumber = {
		// allow binary and hexadecimal numbers to begin with 0b and 0x respectively
		2: /^(\-?[01]*\.?[01]*|\-?0b[01]+\.?[01]*)$/i,
		16: /^(\-?[0-9a-f]*\.?[0-9a-f]*|\-?0x[0-9a-f]+\.?[0-9a-f]*)$/i,
	};
	var reValidNumberBig = /^\-?(\d+(\:\d+)*)?\.?(\d+(\:\d+)*)?$/;
	var baseNames = { 2: 'binary', 8: 'octal', 10: 'decimal', 12: 'duodecimal', 16: 'hexadecimal', '-2': 'negabinary', '-10': 'negadecimal' };
	var baseSuggestions = {
		proposed: '2 8 10 12 16'.split(' '),
		good: '20 36 60 100'.split(' '),
		other: '11 13 14 15 18 30 40 50 70 80 90'.split(' '),
	};
	var spacing = {
		2: 4,
		4: 4,
		8: 4,
		16: 4,
		10: 3,
	};
	var spacingFraction = {
		2: 4,
		4: 4,
		8: 4,
		16: 4,
		10: 5,
	};


	function isInt(num) {
		return num.eq(num.floor());
	}

	function getValidator(base) {
		var chars = '[' + dictionary.substr(0, Math.abs(base)) + ']*';
		return (reValidNumber[base] = new RegExp('^\\-?' + chars + '\\.?' + chars + '$', 'i'));
	}
	function getName(base) {
		if (parseInt(base, 10) + '' === base && base < -1 || base > 1) {
			if (baseNames[base]) {
				return baseNames[base] + ' (base ' + base + ')';
			} else {
				return 'base ' + base;
			}
		}
	}

	function toGenericNegative(toBase, number) {
		var digits = [];

		while (!number.eq(0)) {
			var remainder = +number.mod(toBase).valueOf();
			number = number.sub(remainder).div(toBase);

			if (remainder < 0) {
				remainder += -toBase;
				number = number.add(1);
			}

			digits.push(remainder);
		}

		digits.reverse();
		return digits;
	}
	function toGeneric(toBase, number) {
		if (number.eq(0)) {
			return {
				digits: [0],
				neg: false,
				pt: false
			};
		}

		if (toBase < 0) {
			return {
				digits: toGenericNegative(toBase, number),
				neg: false,
				pt: false
			};
		}

		var tmp, integerLength,
			digits = [],
			isNegative = number.lt(0),
			integ = number.abs().floor(), // the integer part; make the number non-negative
			fract = number.abs().mod(1), // the fractional part; we don't need the 'number' variable any more
			significantDigits = 0,

			// number of significant digits we can safely handle
			maxSignificantFractionDigits = Math.floor(converter.FRACTION_PRECISION * Math.log(2) / Math.log(toBase));

		// find the integer part of the result
		while (integ.gt(0)) {
			tmp = +integ.mod(toBase).valueOf(); // sufficiently small
			digits.unshift(tmp);
			integ = integ.sub(tmp).div(toBase);
		}
		integerLength = digits.length;

		// find the fractional part of the result
		for (; significantDigits < maxSignificantFractionDigits && !fract.eq(0); significantDigits++) {
			fract = fract.mul(toBase);
			tmp = fract.floor();
			fract = fract.sub(tmp);
			digits.push(+tmp.valueOf()); // sufficiently small
		}

		if (significantDigits >= maxSignificantFractionDigits) {
			// round (away from zero)

			// fraction
			if (digits.pop() >= toBase / 2) {
				// 3199.9995 -> 3200; 0.129999 -> 0.13; 9999.9999 -> 10000
				// round up
				tmp = digits.length;
				// add 1 to the last element, but if it's toBase, we'll have to remove it, and check the next
				while (++digits[--tmp] === toBase) {
					digits[tmp] = 0;
				}
				digits.length = Math.max(tmp + 1, integerLength); // truncate the array
			} else {
				// 3120.0004 -> 3120; 0.120004 -> 0.12
				// round down
				tmp = digits.length;
				while (digits[--tmp] === 0 && tmp >= integerLength) {
				}
				digits.length = tmp + 1;
			}
		}
		if (digits[-1] !== undefined) {
			digits.unshift(1);
			integerLength++;
		}
		if (integerLength === 0) {
			// .16 -> 0.16
			digits.unshift(0);
			integerLength++;
		}
		return {
			digits: digits,
			neg: isNegative,
			pt: integerLength === digits.length ? false : integerLength
		};
	}

	function validFrom(fromBase, number) {
		var abs = Math.abs(fromBase);
		number = number.replace(/ /g, '').replace(',', '.');
		return (
			// eliminate the strings that the RegExp can't handle
			number !== '' && number !== '.' && number !== '-.' && number !== '-' &&

			// valid base
			2 <= abs && abs <= 36 &&
			parseInt(fromBase, 10) + '' === fromBase &&

			// get the validator RegExp
			(reValidNumber[fromBase] || getValidator(fromBase))
				// and test the number on that RegExp
				.test(number)
		);
	}

	function validTo(toBase, number) {
		var abs = Math.abs(toBase);
		return (
			number instanceof converter.Big &&

			// for negative bases, require integer values, and within range (since we cannot round)
			(
				toBase > 0 || isInt(number)
			) &&

			// valid base
			2 <= abs && abs <= 36 &&
			parseInt(toBase, 10) + '' === toBase
		);
	}

	function validFromBig(fromBase, number) {
		var abs = Math.abs(fromBase);
		number = number.replace(/ /g, '').replace(',', '.');
		if (
			// eliminate the strings that the RegExp can't handle
			number !== '' && number !== '.' && number !== '-.' && number !== '-' &&

			// valid base
			36 < abs &&
			parseInt(fromBase, 10) + '' === fromBase &&

			reValidNumberBig.test(number)
		) {
			number = number.split(/[\-\.\:]/);
			for (var i = number.length - 1; i >= 0; i--) {
				if (number[i] >= abs) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	function validToBig(toBase, number) {
		var abs = Math.abs(toBase);
		return (
			number instanceof converter.Big &&

			// for negative bases, require integer values, and within range (since we cannot round)
			(
				toBase > 0 || isInt(number)
			) &&

			// valid base
			36 < abs &&
			parseInt(toBase, 10) + '' === toBase
		);
	}



	return [
		// Bases 2..36, and -2..-36.
		{
			from: function (fromBase, number) {
				if (typeof number !== 'string') {
					number += '';
				}

				if (!validFrom(fromBase, number)) {
					return;
				}

				fromBase = +fromBase;

				number = number
					.replace(/ /g, '')
					.replace(',', '.')
					.toUpperCase()
					.split('.');
				var i, fractResult,
					positive = (number[0].charAt(0) !== '-'),
					result = converter.Big(0),
					integ = (positive ? // skip first character or not?
						number[0] :
						number[0].substr(1)),
					fract = number[1];

				// allow binary and hexadecimal prefixes
				if (
					(fromBase === 2 && /^0b/i.test(integ)) ||
					(fromBase === 16 && /^0x/i.test(integ))
					) {
					integ = integ.substr(2);
				}

				// find the integer part of the result
				for (i = 0; i < integ.length; i++) {
					result = result.mul(fromBase).add(dictionary.indexOf(integ.charAt(i)));
				}

				// find the fractional part of the result
				if (fract) {
					fractResult = converter.Big(0);
					for (i = 0; i < fract.length; i++) {
						fractResult = fractResult.mul(fromBase).add(dictionary.indexOf(fract.charAt(i)));
					}
					fractResult = fractResult.div(converter.Big(fromBase).pow(fract.length));
					result = result.add(fractResult);
				}

				return (positive ?
					result :
					result.mul(-1));
			},


			to: function (toBase, number) {
				if (!validTo(toBase, number)) {
					return;
				}

				var i, length,
					result = toGeneric(+toBase, number),
					digits = result.digits,
					pt = result.pt;
				for (i = 0, length = digits.length; i < length; i++) {
					digits[i] = dictionaryArr[digits[i]];
				}
				var intPart = (pt ? digits.slice(0, pt) : digits).join(''),
					fractPart = pt ? digits.slice(pt).join('') : '';

				var absBase = Math.abs(toBase);
				if (spacing[absBase]) {
					intPart = Base.addSpaces(intPart, spacing[absBase]);
					if (fractPart && spacingFraction[absBase]) {
						fractPart = Base.addSpaces(fractPart, spacingFraction[absBase], true);
					}
				}

				return (
					(result.neg ? '-' : '') +
					intPart +
					(pt ? '.' + fractPart : '')
				);
			},

			getName: getName,

			suggest: function (baseText, reBaseText) {
				var i, j, tmp;
				var matches = {
					match: [],
					proposed: []
				};
				var all = {};
				var numberMatch = /(\-?\d+)(i?)/i.exec(baseText);

				if (numberMatch) {
					var number = numberMatch[1];
					if (number < -1 || 1 < number) {
						if (numberMatch[2] === 'i') {
							// E.g. "2i" isn't an exact match.
							matches.proposed.push([number, getName(number)]);
						} else {
							matches.match.push([number, getName(number)]);
						}
						matches.proposed.push([-number + '', getName(-number + '')]);
						all[number] = all[-number] = true;
					}
					for (i in baseSuggestions) {
						tmp = baseSuggestions[i];
						for (j = 0; j < tmp.length; j++) {
							if (tmp[j].indexOf(number) !== -1 && !all[tmp[j]]) {
								if (!matches[i]) {
									matches[i] = [];
								}
								matches[i].push([tmp[j], getName(tmp[j])]);
								all[tmp[j]] = true;
							}
						}
					}
				}

				for (i in baseNames) {
					tmp = getName(i);
					if (!all[i] && reBaseText.test(tmp)) {
						matches.proposed.push([i, tmp]);
						all[i] = true;
					}
				}

				return matches;
			},
		},


		// Bases 37..X and -37..-X.
		{
			// parameters number and base
			from: function (fromBase, number) {
				if (!validFromBig(fromBase, number)) {
					return;
				}

				fromBase = +fromBase;
				number = number.split(/[.,]/);

				var i, fractResult,
					positive = (number[0].charAt(0) !== '-'),
					result = converter.Big(0),
					integ = (positive ? // skip first character or not?
						number[0] :
						number[0].substr(1)),
					fract = (number[1] ? number[1].split(':') : false);
				integ = (integ ? integ.split(':') : []);

				// find the integer part of the result
				for (i = 0; i < integ.length; i++) {
					result = result.mul(fromBase).add(+integ[i]);
				}
				// find the fractional part of the result
				if (fract) {
					fractResult = converter.Big(0);
					for (i = 0; i < fract.length; i++) {
						fractResult = fractResult.mul(fromBase).add(+fract[i]);
					}
					fractResult = fractResult.div(converter.Big(fromBase).pow(fract.length));
					result = result.add(fractResult);
				}

				return (positive ?
					result :
					result.mul(-1));
			},


			to: function (toBase, number) {
				if (!validToBig(toBase, number)) {
					return;
				}

				var result = toGeneric(+toBase, number),
					digits = result.digits,
					pt = result.pt;
				return (
					(result.neg ? '-' : '') +
					(pt ?
						// a decimal point
						digits.slice(0, pt).join(' : ') + ' . ' + digits.slice(pt).join(' : ') :
						// no decimal point - just join
						digits.join(' : '))
				);
			},
		}
	];
}
