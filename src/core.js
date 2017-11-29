(function (window, undefined) {
	'use strict';

	// new Base({
	//  Big: Big, // An instance of either Big or BigNumber to be used to convert to a number's internal representation.
	//  extensions: [...], // Array of objects to pass to extend(); or array of functions returning objects to pass to extend().
	// })
	function Base(options) {
		var Big = this.Big = options.Big;

		// Settings.
		if (Big.DP) {
			// Big.js used for low precision.
			this.FRACTION_PRECISION = Math.floor(Big.DP * Math.log(10) / Math.log(2));
			if (!Big.prototype.floor) {
				Big.prototype.floor = function () {
					return this.round(0, 0);
				};
			}
		} else if (Big.config) {
			// BigNumber.js used for high precision.
			var config = Big.config();
			this.FRACTION_PRECISION = Math.floor(config.DECIMAL_PLACES * Math.log(10) / Math.log(2));
		} else {
			throw new TypeError('Expected options.Big to be Big or BigNumber');
		}

		this.ext = {
			// To internal representation.
			from: [],

			// From internal representation.
			to: [],

			// Direct conversion from one base to another.
			convert: [],

			// Suggest bases.
			suggest: [],

			// Get the name of a base.
			getName: [],

			// Validate a base.
			valid: [],
		};

		this.extend(options.extensions || []);
	}

	// base.extend({
	// 	from: function (fromBase, number) { },
	// 	to: function (toBase, number) { },
	// 	convert: function (fromBase, toBase, number) { },
	// 	suggest: function (baseText, reBaseText) { },
	// 	getName: function (baseId) { },
	// });
	Base.prototype.extend = function (extension) {
		// If extension is a function, call it and recurse.
		if (typeof extension === 'function') {
			this.extend(extension.call(this));
			return;
		}

		// If extension is an array, recurse.
		if (extension.length) {
			for (var i = 0; i < extension.length; i++) {
				this.extend(extension[i]);
			}
			return;
		}

		// Add the extensions.
		for (var key in this.ext) {
			if (key in extension) {
				this.ext[key].push(extension[key]);
			}
		}
	};

	Base.prototype.convert = function (fromBase, toBase, number) {
		fromBase += '';
		toBase += '';
		number += '';

		// Directly converted.
		var result = notUndefined(this.ext.convert, function (fn) {
			return fn(fromBase, toBase, number);
		});

		if (!result) {
			result = this.to(toBase, this.from(fromBase, number));
		}

		// Not directly converted, so first convert to internal, then to the target base.
		return result;
	};

	Base.prototype.convertToMultiple = function (fromBase, toBases, number) {
		var self = this;
		fromBase += '';
		number += '';

		var internal = false;

		var results = toBases.map(function (toBase) {
			toBase += '';

			// Directly converted.
			var result = notUndefined(self.ext.convert, function (fn) {
				return fn(fromBase, toBase, number);
			});

			if (!result) {
				// Not directly converted, so first convert to internal, then to the target base.
				if (internal === false) {
					internal = self.from(fromBase, number);
				}

				if (internal) {
					result = self.to(toBase, internal);
				}
			}

			return result;
		});

		return results;
	};

	Base.prototype.from = function (fromBase, number) {
		if (number == null) {
			return;
		}

		fromBase += '';
		number += '';

		return this.toBig(notUndefined(this.ext.from, function (fn) {
			return fn(fromBase, number);
		}));
	};

	Base.prototype.to = function (toBase, number) {
		if (number == null) {
			return;
		}

		toBase += '';
		number = this.toBig(number);

		return notUndefined(this.ext.to, function (fn) {
			return fn(toBase, number);
		});
	};

	Base.prototype.valid = function (base, number) {
		function execValid(fn) {
			return fn(base, number);
		}

		return (
			// Check extensions.
			this.ext.valid.some(execValid)

			// Just try to convert.
			|| this.convert(base, '10', number || '1') !== undefined
		);
	};

	Base.prototype.getName = function (baseId) {
		return notUndefined(this.ext.getName, function (fn) {
			return fn(baseId);
		});
	};

	Base.prototype.suggest = function (baseText) {
		baseText = baseText.toLowerCase();
		var reBaseText = new RegExp(regexpEscape(baseText), 'i');

		return this.ext.suggest.reduce(function (obj, fn) {

			var curSuggestions = fn(baseText, reBaseText);

			append(obj.match, curSuggestions.match);
			append(obj.proposed, curSuggestions.proposed);
			append(obj.good, curSuggestions.good);
			append(obj.other, curSuggestions.other);

			return obj;
		}, { match: [], proposed: [], good: [], other: [] });
	};

	Base.prototype.suggestList = function (baseText) {
		var categorized = this.suggest(baseText);

		var result = [];

		append(result, categorized.match);
		append(result, categorized.proposed);
		append(result, categorized.good);
		append(result, categorized.other);

		return result;
	};

	Base.prototype.toBig = function (number) {
		if (typeof number === 'number' || typeof number === 'string') {
			return new this.Big(
				number === 0 && 1/number < 0
					? '-0'
					: '' + number
			);
		} else {
			return number;
		}
	};


	// Public utilities.
	Base.addSpaces = function (input, numCharsInGroup, fromBeginning) {
		var parts = [];
		var index = 0;
		var remainderChars = input.length % numCharsInGroup;
		if (!fromBeginning && remainderChars) {
			parts.push(input.substr(0, remainderChars));
			index = remainderChars;
		}

		for (; index < input.length; index += numCharsInGroup) {
			parts.push(input.substr(index, numCharsInGroup));
		}

		return parts.join(' ');
	};


	// Utilities.

	function append(array, arrayToAppend) {
		if (arrayToAppend) {
			array.push.apply(array, arrayToAppend);
		}
	}

	function notUndefined(array, fn) {
		for (var i = 0; i < array.length; i++) {
			var result = fn(array[i]);
			if (result !== undefined) {
				return result;
			}
		}
	}

	function toBig(number) {
		if (typeof number === 'number' || typeof number === 'string') {

		}
	}

	// by jQuery UI
	function regexpEscape(value) {
		return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
	}


	window.Base = Base;

}(window));
