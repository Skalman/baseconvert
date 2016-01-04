(function (Base) {
	"use strict";
	var undefined,
		Big = Base.Big,
		dictionary = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		dictionary_arr = dictionary.split(""),
		valid_number = [],
		valid_number_big = /^\-?(\d+(\:\d+)*)?\.?(\d+(\:\d+)*)?$/,
		base_names = {2: "binary", 8: "octal", 10: "decimal", 12: "duodecimal", 16: "hexadecimal", "-2": "negabinary", "-10": "negadecimal"},
		base_name_generic = "base #base#",
		base_suggestions = {
			proposed: "2 8 10 12 16".split(" "),
			good: "20 36 60 100".split(" "),
			other: "11 13 14 15 18 30 40 50 70 80 90".split(" ")
		},
		base_name_specified = "#name# (base #base#)",
		spacer_re = {
			3: /.../g,
			4: /..../g,
			5: /...../g
		},
		spacing = {
			2: 4,
			4: 4,
			8: 4,
			16: 4,
			10: 3
		},
		spacing_fraction = {
			2: 4,
			4: 4,
			8: 4,
			16: 4,
			10: 5
		};

	function floor(num) {
		return num.round(0, 0);
	}

	function is_int(num) {
		return num.eq(floor(num)) &&
			num.gte(-9007199254740991) &&
			num.lte(9007199254740991);
	}

	function spacer(input, num_chars, from_beginning) {
		var edge,
			diff = input.length % num_chars;

		if (diff) {
			if (from_beginning) {
				edge = input.substr(-diff);
				input = input.substr(0, input.length - diff);
			} else {
				edge = input.substr(0, diff);
				input = input.substr(diff);
			}
		}

		input = input.match(spacer_re[num_chars]) || [];

		if (diff) {
			if (from_beginning)
				input.push(edge);
			else
				input.unshift(edge);
		}

		return input.join(" ");
	}

	function get_validator(base) {
		var chars = "[" + dictionary.substr(0, Math.abs(base)) + "]*";
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
		var i, j, tmp, number, bases,
			matches = {proposed: []},
			all = {};
		number = /(\-?\d+)/.exec(base);
		if (number) {
			number = number[1];
			if (number < -1 || 1 < number) {
				matches.match = [[number, standard_get_name(number)]];
				matches.proposed.push([-number, standard_get_name(-number)]);
				all[number] = all[-number] = true;
			}
			for (i in base_suggestions) {
				tmp = base_suggestions[i];
				for (j = 0; j < tmp.length; j++) {
					if (tmp[j].indexOf(number) !== -1 && !all[tmp[j]]) {
						if (!matches[i]) {
							matches[i] = [];
						}
						matches[i].push([tmp[j], standard_get_name(tmp[j])]);
						all[tmp[j]] = true;
					}
				}
			}
		}
		for (i in base_names) {
			tmp = base_name_specified.replace("#name#", base_names[i]).replace("#base#", i);
			if (!all[i] && tester.test(tmp)) {
				matches.proposed.push([i, tmp]);
				all[i] = true;
			}
		}
		return matches;
	}
	function standard_from_internal_generic_negative(to_base, number) {
		var digits = [];
		var count = 0;

		while (!number.eq(0)) {
			var remainder = +number.mod(to_base).valueOf();
			number = number.sub(remainder).div(to_base);

			if (remainder < 0) {
				remainder += -to_base;
				number = number.add(1);
			}

			digits.push(remainder);
			count++;
		}

		digits.reverse();
		return digits;
	}
	function standard_from_internal_generic(to_base, number) {
		if (number.eq(0)) {
			return {
				digits: [0],
				neg: false,
				pt: false
			};
		}

		if (to_base < 0) {
			return {
				digits: standard_from_internal_generic_negative(to_base, number),
				neg: false,
				pt: false
			};
		}

		var tmp, i, integer_length,
			digits = [],
			is_negative = number.lt(0),
			integ = floor(number.abs()), // the integer part; make the number non-negative
			fract = number.abs().mod(1), // the fractional part; we don't need the 'number' variable any more
			significant_digits = 0,

			// number of significant digits we can safely handle (53 bits)
			// TODO - don't hard code this - perhaps number.PRECISION? How to handle those that do integer part and fractional part separately?
			max_significant_fraction_digits = Math.floor( Base.FRACTION_PRECISION * Math.log(2) / Math.log(to_base) );

		// find the integer part of the result
		while (integ.gt(0)) {
			tmp = +integ.mod(to_base).valueOf(); // sufficiently small
			digits.unshift(tmp);
			integ = integ.sub(tmp).div(to_base);
		}
		integer_length = digits.length;
		
		// find the fractional part of the result
		for (; significant_digits < max_significant_fraction_digits && !fract.eq(0); significant_digits++) {
			fract = fract.mul(to_base);
			tmp = floor(fract);
			fract = fract.sub(tmp);
			digits.push(+tmp.valueOf()); // sufficiently small
		}

		if (significant_digits >= max_significant_fraction_digits) {
			// round (away from zero)

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
			var abs = Math.abs(base);
			return 2 <= abs && abs <= 36 && parseInt(base, 10)+"" === base;
		},
		/* bool valid_from(int, string) */
		valid_from: function standard_valid_from(base, number) {
			var abs = Math.abs(base);
			number = number.replace(/ /g, "").replace(",", ".");
			return (
				// eliminate the strings that the RegExp can't handle
				number !== "" && number !== "." && number !== "-." && number !== "-" &&

				// valid base
				2 <= abs && abs <= 36 &&
				parseInt(base, 10)+"" === base &&

				// get the validator RegExp
				(valid_number[base] || get_validator(base))
					// and test the number on that RegExp
					.test(number)
			);
		},
		/* bool valid_to(int, internal_number) */
		valid_to: function standard_valid_to(base, number) {
			var abs = Math.abs(base);
			return (
				// for negative bases, require integer values, and within range (since we cannot round)
				(
					base > 0 || is_int(number)
				) &&

				// valid base
				2 <= abs && abs <= 36 &&
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
				.replace(/ /g, "")
				.replace(",", ".")
				.toUpperCase()
				.split(".");
			var i, fract_result,
				positive = (number[0].charAt(0) !== "-"),
				result = Big(0),
				integ = ( positive ? // skip first character or not?
					number[0] :
					number[0].substr(1) ),
				fract = number[1];

			// find the integer part of the result
			for (i = 0; i < integ.length; i++) {
				result = result.mul(from_base).add(dictionary.indexOf( integ.charAt(i) ));
			}

			// find the fractional part of the result
			if (fract) {
				fract_result = Big(0);
				for (i = 0; i < fract.length; i++) {
					fract_result = fract_result.mul(from_base).add(dictionary.indexOf( fract.charAt(i) ));
				}
				fract_result = fract_result.div(Big(from_base).pow(fract.length));
				result = result.add(fract_result);
			}

			return ( positive ?
				result :
				result.mul(-1) );
		},


		from_internal: function standard_from_internal(to_base, number) {
			var i, length,
				result = standard_from_internal_generic(+to_base, number),
				digits = result.digits,
				pt = result.pt;
			for (i = 0, length = digits.length; i < length; i++) {
				digits[i] = dictionary_arr[ digits[i] ];
			}
			var int_part = (pt ? digits.slice(0, pt) : digits).join(""),
				fract_part = pt ? digits.slice(pt).join("") : "";

			var abs_base = Math.abs(to_base);
			if (spacing[abs_base]) {
				int_part = spacer(int_part, spacing[abs_base]);
				if (fract_part && spacing_fraction[abs_base]) {
					fract_part = spacer(fract_part, spacing_fraction[abs_base], true);
				}
			}

			return (
				(result.neg ? "-" : "") +
				int_part +
				(pt ? "." + fract_part : "")
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
			var abs = Math.abs(base);
			return 36 < abs && parseInt(base, 10)+"" === base;
		},
		/* bool valid_from(string, string)*/
		valid_from: function standard_big_valid_from(base, number) {
			var abs = Math.abs(base);
			number = number.replace(/ /g, "").replace(",", ".");
			if (
				// eliminate the strings that the RegExp can't handle
				number !== "" && number !== "." && number !== "-." && number !== "-" &&

				// valid base
				36 < abs &&
				parseInt(base, 10)+"" === base &&

				valid_number_big.test(number)
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
		},
		/* bool valid_to(string, internal_number) */
		valid_to: function standard_big_valid_to(base, number) {
			var abs = Math.abs(base);
			return (
				// for negative bases, require integer values, and within range (since we cannot round)
				(
					base > 0 || is_int(number)
				) &&

				// valid base
				36 < abs &&
				parseInt(base, 10)+"" === base
			);
		},
		fractional: true,

		// parameters number and base
		to_internal: function standard_big_to_internal(from_base, number) {
			from_base = +from_base;
			number = number.split(/[.,]/);
			
			var i, fract_result,
				positive = (number[0].charAt(0) !== "-"),
				result = Big(0),
				integ = ( positive ? // skip first character or not?
					number[0] :
					number[0].substr(1) ),
				fract = (number[1] ? number[1].split(":") : false);
			integ = (integ ? integ.split(":") : []);

			// find the integer part of the result
			for (i = 0; i < integ.length; i++) {
				result = result.mul(from_base).add(+integ[i]);
			}
			// find the fractional part of the result
			if (fract) {
				fract_result = Big(0);
				for (i = 0; i < fract.length; i++) {
					fract_result = fract_result.mul(from_base).add(+fract[i]);
				}
				fract_result = fract_result.div(Big(from_base).pow(fract.length));
				result = result.add(fract_result);
			}

			return ( positive ?
				result :
				result.mul(-1) );
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
					digits.slice(0, pt).join(" : ") + " . " + digits.slice(pt).join(" : ") :
					// no decimal point - just join
					digits.join(" : "))
			);
		},
		get_name: standard_get_name,
		options: {
		}
	});
})(Base);
