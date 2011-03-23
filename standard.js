(function (Base) {
	"use strict";
	var undefined,
		dictionary = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		dictionary_arr = dictionary.split(""),
		Number = Base.Number,
		ZERO = Number.ZERO,
		valid_number = [],
		valid_number_big = /^\-?(\d+(\:\d+)*)?\.?(\d+(\:\d+)*)?$/,
		base_names = {2: "binary", 8: "octal", 10: "decimal", 16: "hexadecimal"},
		base_name_generic = "base #base#",
		base_name_specified = "#name# (base #base#)";

	function get_validator(base) {
		var chars = "[" + dictionary.substr(0, base) + "]*";
		return (valid_number[base] = new RegExp("^\\-?"+chars+"\\.?"+chars+"$", "i"));
	}
	function standard_get_name(base) {
		if (base_names[base]) {
			return base_name_specified.replace("#name#", base_names[base]).replace("#base#", base);
		} else {
			return base_name_generic.replace("#base#", base);
		}
	}
	function standard_suggest_base(base, tester) {
		var i, tmp,
			matches = [];
		for (i in base_names) {
			tmp = base_name_specified.replace("#name#", base_names[i]).replace("#base#", i);
			if (tester.test(tmp)) {
				matches.push([i, tmp]);
			}
		}
		return matches;
	}
	function standard_from_internal_generic(to_base, number) {
		if (number.equals(ZERO)) {
			return {
				digits: [0],
				neg: false,
				pt: false
			};
		}
		number = number.clone(); // we must work on a copy
		var tmp, i, integer_length,
			digits = [],
			is_negative = number.cmp(0) < 0,
			integ = Number.floor(number.abs()), // the integer part; make the number non-negative
			fract = number.mod(1), // the fractional part; we don't need the 'number' variable any more
			significant_digits = 0,

			// number of significant digits we can safely handle (53 bits)
			// TODO - don't hard code this - perhaps number.PRECISION? How to handle those that do integer part and fractional part separately?
			max_significant_digits = Math.floor( 53 * Math.log(2) / Math.log(to_base) );

		// find the integer part of the result
		for (; integ.cmp(ZERO) > 0; significant_digits++) {
			tmp = Number.mod(integ, to_base).get_number();
			digits.unshift(tmp);
			integ.sub(tmp).div(to_base);
		}
		integer_length = digits.length;
		
		// find the fractional part of the result
		for (; significant_digits < max_significant_digits && !fract.equals(ZERO); significant_digits++) {
			fract.mul(to_base);
			tmp = Number.floor(fract);
			fract.sub(tmp);
			digits.push(tmp.get_number());
		}

		if (significant_digits >= max_significant_digits) {
			// round (away from zero)

			if (significant_digits > integer_length) {
				// fraction
				if (digits.pop() >= to_base / 2) {
					// 3199.9995 -> 3200; 0.129999 -> 0.13; 9999.9999 -> 10000
					// round up
					tmp = digits.length;
					// add 1 to the last element, but if it's to_base, we'll have to remove it, and check the next
					while (++digits[--tmp] === to_base) {
						digits[tmp] = 0;
					}
					digits.length = Math.max(tmp + 1, integer_length); // truncate the array
				} else {
					// 3120.0004 -> 3120; 0.120004 -> 0.12
					// round down
					tmp = digits.length;
					while (digits[--tmp] === 0 && tmp >= integer_length) {
					}
					digits.length = tmp + 1;
				}
			} else {
				// integer
				if (digits[max_significant_digits] >= to_base / 2) {
					// 31999995xxxx -> 32000005xxxx; 31234568xxxx -> 31234578xxxx; 99999 -> 100000
					// round up
					// leave digits[max_significant_digits] alone
					tmp = max_significant_digits - 1;
					while (++digits[--tmp] === to_base) {
						digits[tmp] = 0;
					}
				}

				// xxxxxxx51234 -> xxxxxxx00000; xxxxxxx83333 -> xxxxxxx00000
				for (i = max_significant_digits; i < digits.length; i++) {
					digits[i] = 0;
				}
			}
		}
		if (digits[-1] !== undefined) {
			digits.unshift(1);
			integer_length++;
		}
		if (integer_length === 0) {
			// .16 -> 0.16
			digits.unshift(0);
			integer_length++;
		}
		return {
			digits: digits,
			neg: is_negative,
			pt: integer_length === digits.length ? false : integer_length
		};
	}
	Base.extend({
		name: "standard",
		/* bool valid_base(string) */
		valid_base: function standard_valid_base(base) {
			return 2 <= base && base <= 36 && parseInt(base, 10)+"" === base;
		},
		/* bool valid_from(int, string)*/
		valid_from: function standard_valid_from(base, number) {
			return (
				// eliminate the strings that the RegExp can't handle
				number !== "" && number !== "." && number !== "-." && number !== "-" &&

				// valid base
				2 <= base && base <= 36 &&
				parseInt(base, 10)+"" === base &&

				// get the validator RegExp
				(valid_number[base] ? valid_number[base] : get_validator(base))
					// and test the number on that RegExp
					.test(number)
			);
		},
		/* bool valid_to(int, internal_number) */
		valid_to: function standard_valid_to(base, number) {
			return (
				// any real number is fine
				// valid base
				2 <= base && base <= 36 &&
				parseInt(base, 10)+"" === base
			);
		},
		fractional: true,

		// parameters number and base
		to_internal: function standard_to_internal(from_base, number) {
			from_base = +from_base;
			if (typeof number !== "string") {
				number += "";
			}
			number = number
				.toUpperCase()
				.split(".");
			var i, fract_result,
				positive = (number[0].charAt(0) !== "-"),
				result = Number(),
				integ = ( positive ? // skip first character or not?
					number[0] :
					number[0].substr(1) ),
				fract = number[1];

			// find the integer part of the result
			for (i = 0; i < integ.length; i++) {
				result.mul(from_base).add(dictionary.indexOf( integ.charAt(i) ));
			}

			// find the fractional part of the result
			if (fract) {
				fract_result = Number();
				for (i = 0; i < fract.length; i++) {
					fract_result.mul(from_base).add(dictionary.indexOf( fract.charAt(i) ));
				}
				fract_result.mul(Number.pow(from_base, -fract.length));
				result.add(fract_result);
			}

			return ( positive ?
				result :
				result.neg() );
		},


		from_internal: function standard_from_internal(to_base, number) {
			var i, length,
				result = standard_from_internal_generic(+to_base, number),
				digits = result.digits,
				pt = result.pt;
			for (i = 0, length = digits.length; i < length; i++) {
				digits[i] = dictionary_arr[ digits[i] ];
			}
			return (
				(result.neg ? "-" : "") +
				(pt ?
					// a decimal point
					digits.slice(0, pt).join("") + "." + digits.slice(pt).join("") :
					// no decimal point - just join
					digits.join(""))
			);
		},
		get_name: standard_get_name,
		suggest_base: standard_suggest_base,
		options: {
			uppercase: true
		}
	});


	// standard_big
	Base.extend({
		name: "standard_big",
		/* bool valid_base(string) */
		valid_base: function standard_big_valid_base(base) {
			return 36 < base && parseInt(base, 10)+"" === base;
		},
		/* bool valid_from(string, string)*/
		valid_from: function standard_big_valid_from(base, number) {
			if (
				// eliminate the strings that the RegExp can't handle
				number !== "" && number !== "." && number !== "-." && number !== "-" &&

				// valid base
				36 < base &&
				parseInt(base, 10)+"" === base &&

				valid_number_big.test(number)
			) {
				number = number.split(/[\-\.\:]/);
				base = parseInt(base, 10);
				for (var i = number.length - 1; i >= 0; i--) {
					if (number[i] >= base) {
						return false;
					}
				}
				return true;
			}
			return false;
		},
		/* bool valid_to(string, internal_number) */
		valid_to: function standard_big_valid_to(base, number) {
			return (
				// any real number is fine
				// valid base
				36 < base &&
				parseInt(base, 10)+"" === base
			);
		},
		fractional: true,

		// parameters number and base
		to_internal: function standard_big_to_internal(from_base, number) {
			from_base = +from_base;
			number = number.split(".");
			
			var i, fract_result,
				positive = (number[0].charAt(0) !== "-"),
				result = Number(),
				integ = ( positive ? // skip first character or not?
					number[0] :
					number[0].substr(1) ),
				fract = (number[1] ? number[1].split(":") : false);
			integ = (integ ? integ.split(":") : []);

			// find the integer part of the result
			for (i = 0; i < integ.length; i++) {
				result.mul(from_base).add(integ[i]);
			}
			// find the fractional part of the result
			if (fract) {
				fract_result = Number();
				for (i = 0; i < fract.length; i++) {
					fract_result.mul(from_base).add(fract[i]);
				}
				fract_result.mul(Number.pow(from_base, -fract.length));
				result.add(fract_result);
			}

			return ( positive ?
				result :
				result.neg() );
		},


		from_internal: function standard_big_from_internal(to_base, number) {
			var i, length,
				result = standard_from_internal_generic(+to_base, number),
				digits = result.digits,
				pt = result.pt;
			return (
				(result.neg ? "-" : "") +
				(pt ?
					// a decimal point
					digits.slice(0, pt).join(":") + "." + digits.slice(pt).join(":") :
					// no decimal point - just join
					digits.join(":"))
			);
		},
		get_name: standard_get_name,
		options: {
		}
	});
})(Base);
