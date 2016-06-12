/* each parameter may be an individual value or an array, but at least one of them must *not* be an array
	// flat values
	Base(10,      2,   "42")            "101010"

	// one array
	Base(10,      2,   ["42", "15"])    ["101010", "1111"]
	Base([10, 7], 2,      "42")         ["101010", "11110"]
	Base(10,      [2, 3], "42")         ["101010", "1120"]

	// two arrays - they must be of the same length
	Base([10, 7], 2,      ["42", "15"]) ["101010", "1100"]
	Base(10,      [2, 3], ["42", "15"]) ["101010", "120"]
	Base([10, 7], [2, 3], "42")         ["101010", "1010"]

*/
(function (window) {
	"use strict";
	var undefined,
		extensions_list = [],
		extensions_map = {},

		// quick reference to useful functions
		to_string = Object.prototype.toString,

		// functions inspired from jQuery
		is_array = Array.isArray || function is_array(obj) {
			return to_string.call(obj) === "[object Array]";
		},
		is_function = function is_function(obj) {
			return to_string.call(obj) === "[object Function]";
		},
		index_of = function index_of(elem, array) {
			if (array.indexOf) {
				return array.indexOf(elem);
			}

			for (var i = 0, length = array.length; i < length; i++) {
				if (array[i] === elem) {
					return i;
				}
			}
			return -1;
		},


		// private functions
		to_internal = function to_internal(from_base, number) {
			try {
				if (number != null && from_base != null) {
					number += "";
					from_base += "";
					var i;
					for (i = extensions_list.length - 1; i >= 0; i--) {
						if (extensions_list[i].valid_from(from_base, number)) {
							return extensions_list[i].to_internal(from_base, number);
						}
					}
				}
			} catch (e) {
				console.error(e);
			}
			return undefined;
		},
		from_internal = function from_internal(to_base, number) {
			try {
				if (number != null && to_base != null) {
					to_base += "";
					var i;
					for (i = extensions_list.length - 1; i >= 0; i--) {
						if (extensions_list[i].valid_to(to_base, number)) {
							return extensions_list[i].from_internal(to_base, number);
						}
					}
				}
			} catch (e) {
				console.error(e);
			}
			return undefined;
		},
		get_extension = function get_extension(base, prop) {
			var i;
			if (prop === undefined) {
				for (i = extensions_list.length - 1; i >= 0; i--) {
					if (extensions_list[i].valid_base(base)) {
						return extensions_list[i];
					}
				}
			} else {
				for (i = extensions_list.length - 1; i >= 0; i--) {
					if (extensions_list[i][prop] && extensions_list[i].valid_base(base)) {
						return extensions_list[i];
					}
				}
			}
			return undefined;
		},
		// by jQuery UI
		escape_regexp = function escape_regexp(value) {
			return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
		},


		// the Base function
		Base = window.Base = function Base(from, to, number) {
			var i,
				internal,
				result,
				number_is_array = is_array(number),
				from_is_array = is_array(from),
				to_is_array = is_array(to),
				length = number_is_array ? number.length :
					from_is_array ? from.length :
					to_is_array ? to.length :
					undefined;


			if (!number_is_array && !from_is_array && !to_is_array) {
				// this is the only case where we return a single value
				return from_internal(to, to_internal(from, number+""));
			} else if (number_is_array && from_is_array && to_is_array) {
				throw "Max two of the three parameters may be an array.";
			}

			// ...so the results must be an array
			result = [];

			// find the internal number(s)
			if (number_is_array || from_is_array) {
				// internal is an array
				internal = [];
				if (number_is_array && from_is_array) {
					for (i = 0; i < length; i++) {
						internal[i] = to_internal(from[i], number[i]);
					}
				} else if (number_is_array) {
					for (i = 0; i < length; i++) {
						internal[i] = to_internal(from, number[i]);
					}
				} else { // from_is_array
					for (i = 0; i < length; i++) {
						internal[i] = to_internal(from[i], number);
					}
				}

				// the results
				if (to_is_array) {
					for (i = 0; i < length; i++) {
						result[i] = from_internal(to[i], internal[i]);
					}
				} else {
					for (i = 0; i < length; i++) {
						result[i] = from_internal(to, internal[i]);
					}
				}
			} else {
				// internal is a single value
				internal = to_internal(from, number);
				// the results
				for (i = 0; i < length; i++) {
					result[i] = from_internal(to[i], internal);
				}
			}
			return result;
		};
		Base.to = function Base_to(to_base, number) {
			return from_internal(
				to_base,
				(number != null ? Big(number) : number)
			);
		};
		Base.from = function Base_from(from_base, number) {
			return to_internal(from_base, number);
		};
		Base.valid = function Base_valid(base, number) {
			var i = extensions_list.length - 1;
			base += "";
			if (number == null) {
				// test only the base
				for (; i >= 0; i--) {
					if (extensions_list[i].valid_base(base)) {
						return true;
					}
				}
			} else {
				// test base and number
				number += "";
				for (; i >= 0; i--) {
					if (extensions_list[i].valid_from(base, number)) {
						return true;
					}
				}
			}
			return false;
		};
		Base.get_name = function Base_get_name(base) {
			var extension = get_extension(base+"", "get_name");
			if (extension) {
				return extension.get_name(base);
			}
			return undefined;
		};
		Base.suggest = function Base_suggest(base, return_categories) {
			var i, j, length,
				regexp = new RegExp(escape_regexp(base), "i"),
				suggestions = [],
				result;
			for (i = extensions_list.length - 1; i >= 0; i--) {
				// console.log(i + " " + extensions_list[i].name + " " + extensions_list[i].suggest_base);
				if (extensions_list[i].suggest_base) {
					suggestions.push(extensions_list[i].suggest_base(base, regexp));
				}
			}
			length = suggestions.length;
			if (!return_categories) {
				result = [];
				for (i in { match:true, proposed:true, good:true, other:true }) {
					for (j = 0; j < length; j++) {
						if (suggestions[j][i]) {
							result.push(suggestions[j][i]);
						}
					}
				}
				result = [].concat.apply([], result);
			} else {
				result = { match: [], proposed: [], good: [], other: [] };
				for (i in result) {
					for (j = 0; j < length; j++) {
						if (suggestions[j][i]) {
							result[i].push(suggestions[j][i]);
						}
					}
					result[i] = [].concat.apply([], result[i]);
				}

			}
			return result;
		};
		/**
			Base.extend({
				name: "extension name"

				valid_base: tester | name, // valid base

				valid_number: tester | value, // valid number

				valid_internal_number: tester | value // valid internal number (i.e., it's better with no string testing; default: all)

				from_internal: function(number, base) { ... },
				to_internal: function(number, base) { ... },

				positional: true, // so that we can use the internationalized decimal symbol
				fractional: true,
				options: {}
			})
		*/
		Base.extend = function Base_extend(extension) {
				if (extensions_map[extension.name]) {
					throw "There is already an extension '" + extension.name + "'.";
				}
				extensions_list.push(extension);
				extensions_map[extension.name] = extension;
			};
		Base.extensions = extensions_map;
		Base.option = function Base_option(a, b) {
			if (arguments.length > 1) {
				a = {};
			}
		};

		// Settings
		var Big;
		if (window.Big) {
			// Used for low precision
			Big = window.Big();
			Base.FRACTION_PRECISION = Math.floor(Big.DP * Math.log(10) / Math.log(2));
			Big.prototype.floor = function () {
				return this.round(0, 0);
			};
		} else {
			// Used for high precision
			Big = window.BigNumber.another({ DECIMAL_PLACES: 1000, POW_PRECISION: 1000, ERRORS: false });
			Base.FRACTION_PRECISION = Math.floor(1000 * Math.log(10) / Math.log(2));
		}

		Base.Big = Big;

			/*
			add_conversion: function Base_add_conversion(conv) {
				Base.add_conversion({
					from_base: tester | extension name,
					to_base: tester | extension name,

				})
			}
			*/
})(this);
