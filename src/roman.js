(function (Base) {
	"use strict";
	var undefined,
		Number = Base.Number,

		message_bad_order = "Found unexpected sorting order: '$1' followed by '$2' (using strict sorting order).",
		message_bad_order_nonstrict = "Found unexpected sorting order: '$1' followed by '$2' (using non-strict sorting order)",
		message_bad_repetition = "Found unexpected repetition: '$1' $2 times in a row",

		global_replace = "aa".replace("a", "", "g") === "" ?
			function global_replace(str, search, replace) {
				return str.replace(search, replace, "g");
			} :
			function global_replace(str, search, replace) {
				while (str !== (str = str.replace(search, replace))) {
				}
				return str;
			},
		language = function language(str) {
			var i,
				args = arguments;
			for (i = 1; i < args.length; i++) {
				str = global_replace(str, "$"+i, args[i]);
			}
			return str;
		},

		strict_conversions = {
			M: 1000, CM: 900, D: 500, CD: 400,
			C: 100, XC: 90, L: 50, XL: 40,
			X: 10, IX: 9, V: 5, IV: 4, I: 1
		},
		repetition_allowed = {
			M: 3, C: 4, X: 4, I: 4
		},
		classes = {
			M: 6,
			D: 5, C: 5,
			CM: 4, CD: 4,
			LM: 3, LD: 3, L: 3, X: 3,
			XM: 2, XD: 2, XC: 2, XL: 2,
			VM: 1, VD: 1, VC: 1, VL: 1, V: 1, I: 1,
			IM: 0, ID: 0, IC: 0, IL: 0, IX: 0, IV: 0
		},
		classes2 = {
			D: 3, CD: 3,
			L: 2, XL: 2,
			V: 1, IV: 1
		},
		nonstrict_conversions = {
			M: 1000, IM: 999, VM: 995, XM: 990, LM: 950, CM: 900,
			D: 500, ID: 499, VD: 495, XD: 490, LD: 450, CD: 400,
			C: 100, IC: 99, VC: 95, XC: 90,
			L: 50, IL: 49, VL: 45, XL: 40,
			X: 10, IX: 9, V: 5, IV: 4, I: 1
		};
	Base.extend({
		name: "roman",
		fractional: false,
		valid_base: function roman_valid_base(base) {
			return base === "roman";
		},
		valid_from: function roman_valid_from(base, number) {
			var valid = base === "roman" && /^[IVXLCDM]+$/i.test(number);
			if (valid) {
				try {
					// TODO is there a quicker way to do this? a regexp?
					Base.extensions.roman.to_internal("roman", number);
				} catch (e) {
					valid = false;
				}
			}
			return valid;
		},
		valid_to: function roman_valid_to(base, number) {
			// TODO remove number.is_int() when core supports fractional:false
			return base === "roman" && number.is_int() && number.cmp(0) > 0 && number.cmp(4000) < 0;
		},

		// from_base will always be "roman"
		/*
			always accept
				IIII = 4
			never accept
				IIIII = 5
				IXIX = 18
				IXIV = 13
		*/
		to_internal: function roman_to_internal(from_base, number) {
			// inspiration taken from Netzreport (http://netzreport.googlepages.com/index_en.html)
			number = number.toUpperCase();
			var
				result = 0, // we know that it's sufficient to use JavaScript's own numbers
				i,
				length = number.length,
				conv = this.options.strict ? strict_conversions : nonstrict_conversions,
				token,
				next,
				value,
				klass,
				class2,
				last_token,
				last_value = 1001, // something greater than M = 1000
				last_class = 7, // something greater than the greatest class, M: 6
				last_class2 = 4, // something greater than the greatest class, D: 3
				repetition_count;

			// tokenize
			for (i = 0; i < length; i++) {
				token = number.charAt(i);
				next = number.charAt(i+1);
				// lookahead one character to find this token's value
				if (i+1 < length && conv[token+next]) { // there's another character to look at
					// yep, this is a token: let's add the next character to i
					token += next;

					// and skip the next character since it's part of *this* token
					i++;
				}
				value = conv[token];
				klass = classes[token];
				class2 = classes2[token];
				last_value === value ?
					repetition_count++ :
					repetition_count = 1;

				if (last_value < value || last_class < klass) {
					throw language(this.options.strict ? message_bad_order : message_bad_order_nonstrict,
						last_token,
						token);
				} else if (last_class === klass) {
					if (!repetition_allowed[token]) {
						throw language(this.options.strict ? message_bad_order : message_bad_order_nonstrict,
							last_token,
							token);
					} else if (last_value === value) {
						 if (repetition_count > repetition_allowed[token]) {
							// we accept repetition 4 times (as in IIII instead of IV), but not 5
							throw language(message_bad_repetition, token, repetition_count);
						}
					}
				} else if (class2 !== undefined && last_class2 === class2) {
					throw language(this.options.strict ? message_bad_order : message_bad_order_nonstrict,
						last_token,
						token);
				}
				result += value;
				last_value = value;
				last_class = klass;
				last_class2 = class2;
			}
			return Number(result);
		},

		// to_base will always be "roman"
		from_internal: function roman_from_internal(to_base, number) {
			// the primitive value will always be sufficient for roman numerals
			number = number.valueOf();
			var i, result = "";
			for (i in strict_conversions) {
				while (number >= strict_conversions[i]) {
					number -= strict_conversions[i];
					result += i;
				}
			}
			return (this.options.uppercase ?
				result :
				result.toLowerCase());
		},
		get_name: function roman_get_name(base) {
			return "roman numerals";
		},
		suggest_base: function roman_suggest_base(base, tester) {
			if (/^rom/i.test(base)) {
				// close enough match
				return { match: [["roman", "roman numerals"]] };
			} else if (tester.test("roman numerals")) {
				return { proposed: [["roman", "roman numerals"]] };
			} else {
				return {};
			}
		},
		options: {
			uppercase: true,
			strict: true
		}
	});
})(Base);
