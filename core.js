// TODO make jQuery independent
(function (window, undefined) {
	if (!window.log) {
		window.log = function log(msg) {
			window.console.log(msg);
		};
	}
	function equals(val) {
		return function (compare) {
			return val == compare;
		};
	}
	
	var extensions_list = [],
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
		};
	function tester(tester) {
		if (tester.test) {
			// RegExp or homebrewed such objects - /^2-4$
			return function (compare) {
				return tester.test(compare);
			};
		} else if (is_array(tester)) {
			// array - [2, 3, 4]
			return function (compare) {
				return index_of(compare, tester) !== -1;
			};
		} else if (is_function(tester)) {
			return tester;
		} else {
			// error, but we don't care (for now) TODO
			throw "Base: tester error.";
		}
	}
		/* each parameter may be an individual value or an array, but at least one of them must *not* be an array
			// flat values
			Base(
				"42",
				10,
				2)
					"101010"


			// one array
			Base(
				["42", "15"],
				10,
				2)
					["101010", "1111"]
			
			Base(
				"42",
				[10, 7],
				2)
					["101010", "11110"]
			
			Base(
				"42",
				10,
				[2, 3])
					["101010", "1120"]


			// two arrays - they must be of the same length
			Base(
				["42", "15"],
				[10, 7],
				2)
					["101010", "1100"]

			Base(
				["42", "15"],
				10,
				[2, 3])
					["101010", "120"]
			
			Base(
				"42",
				[10, 7],
				[2, 3])
					["101010", "1010"]
			

			
		*/
		function to_internal(from_base, number) {
			try {
				if (number != undefined && from_base != undefined) {
					var i;
					for (i = extensions_list.length - 1; i >= 0; i--) {
						if (extensions_list[i].valid_from(from_base, number)) {
							return extensions_list[i].to_internal(from_base, number);
						}
					}
				}
			} catch (e) {
			}
			// return undefined
		}
		function from_internal(to_base, number) {
			try {
				if (number != undefined && to_base != undefined) {
					var i;
					for (i = extensions_list.length - 1; i >= 0; i--) {
						if (extensions_list[i].valid_to(to_base, number)) {
							return extensions_list[i].from_internal(to_base, number);
						}
					}
				}
			} catch (e) {
			}
			// return undefined
		}
		var Base = window.Base = function Base(from, to, number) {
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
						internal[i] = to_internal(from[i], number[i]+"");
					}
				} else if (number_is_array) {
					for (i = 0; i < length; i++) {
						internal[i] = to_internal(from, number[i]+"");
					}
				} else { // from_is_array
					for (i = 0; i < length; i++) {
						internal[i] = to_internal(from[i], number+"");
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
				internal = to_internal(from, number+"");
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
				(number != undefined && Base.Number ? Base.Number(number) : number)
			);
		};
		Base.from = function Base_from(from_base, number) {
			return to_internal(from_base, number+"");
		};
		Base.valid = function Base_valid(base, number) {
			var i = extensions_list.length - 1;
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
		Base.extend = function Base_extend(extension) {
				if (extensions_map[extension.name]) {
					throw "There is already an extension '" + extension.name + "'.";
				}
				extensions_list.push(extension);
				extensions_map[extension.name] = extension;
				/*
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
			};
		Base.extensions = extensions_map;
		Base.option = function Base_option(a, b) {
			if (arguments.length > 1) {
				a = {};
			}
		};
			/*
			add_conversion: function Base_add_conversion(conv) {
				Base.add_conversion({
					from_base: tester | extension name,
					to_base: tester | extension name,
	
				})
			}
			*/
})(this);
