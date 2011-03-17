/* TODO
	ceil()
	max()
	min()
	round() // with precision, like PHP
	sqrt()
*/
(function (window) {
	"use strict";
	function throw_message(message) {
		throw message;
	}

	function tried_to_modify_immutable_number() {
		throw "Can't modify immutable number.";
	}

	var Base = window.Base,
		Number = Base.Number = function Base_Number(value) {
			if (!(this instanceof Number)) { // called as a function, not a contructor
				return new Number(value);
			}
			this.value = (value instanceof Number) ? value.value
				: typeof value === "number" ? value
				: value == null ? 0 // null or undefined

				// TODO make sure that the following is the real JavaScript number algorithm
				: /\-?(\d+|\d*.\d+)([eE][\-+]?\d+)?/.test(value) ? +value // valid JavaScript number as a string
				: throw_message("Can't create a Base.Number with the value '" + value + "'.");
		},
		slice = Array.prototype.slice,
		operations_x = ["add", "mul"], // operations with x operators
		operations_2 = ["sub", "div", "mod", "pow"], // operations with 2 operators
		operations_1 = ["neg", "abs", "floor"], // operations with 1 operator
		operations = [
			{ // add, mul
				methods: operations_x,
				static_method: function (op) {
					return function (x) {
						x = new Number(x);
						return x[op].apply(x, slice.call(arguments, 1));
					};
				}
			},
			{ // sub, div, mod, pow
				methods: operations_2,
				static_method: function (op) {
					return function (x, y) {
						return new Number(x)[op](y);
					};
				}
			},
			{ // neg, abs, floor
				methods: operations_1,
				static_method: function (op) {
					return function (x) {
						return new Number(x)[op]();
					};
				}
			}
		],
		i, j;

	function getvalue(x) {
		return (x instanceof Number) ? x.value
			: typeof x === "number" ? x
			: new Number(x).value;
	}

	// add static methods such as Number.add()
	for (i = 0; i < operations.length; i++) {
		for (j = 0; j < operations[i].methods.length; j++) {
			Number[ operations[i].methods[j] ] = operations[i].static_method( operations[i].methods[j] );
		}
	}

	Number.prototype = {
		// private
		value: 0,

		toString: function toString() {
			return this.value + "";
		},
		// TODO - check specification of this method - compare with e.g. RegExp (returns empty object), Date (returns number)
		valueOf: function valueOf() {
			return this.get_number();
		},

		// operations on the Number, all returning the Number object itself (chainable)
		add: function add() {
			var i,
				args = arguments,
				value = this.value; // can't change this.value at each addition, since x.add(x, x) will fail
			for (i = args.length - 1; i >= 0; i--) {
				value += getvalue(args[i]);
			}
			this.value = value;
			return this;
		},
		sub: function sub(other) {
			this.value -= getvalue(other);
			return this;
		},
		mul: function mul() {
			var i,
				args = arguments,
				value = this.value;
			for (i = args.length - 1; i >= 0; i--) {
				value *= getvalue(args[i]);
			}
			this.value = value;
			return this;
		},
		div: function div(other) {
			other = getvalue(other);
			if (other === 0) {
				throw "division by zero";
			} else {
				this.value /= other;
				return this;
			}
		},
		mod: function mod(other) {
			other = getvalue(other);
			if (other === 0) {
				throw "dividend can't be zero";
			} else if (this.value < 0 || other < 0) {
				throw "operators in mod can't be negative";
			} else {
				this.value %= other;
				return this;
			}
		},
		pow: function pow(exp) {
			exp = getvalue(exp);
			this.value = Math.pow(this.value, exp);
			return this;
		},
		abs: function abs() {
			if (this.value < 0) {
				this.value = -this.value;
			}
			return this;
		},
		neg: function neg() {
			this.value = -this.value;
			return this;
		},
		floor: function floor() {
			this.value = Math.floor(this.value);
			return this;
		},

		// other operations, returning other values
		cmp: function cmp(other) {
			return this.value - getvalue(other);
		},
		equals: function equals(other) {
			return !!(this === other ||
				getvalue(other) === this.value);
		},
		is_int: function is_int() {
			return !(this.value % 1);
		},
		get_number: function get_number() {
			return this.value;
		},
		clone: function clone() {
			return new Number(this.value);
		},
		make_immutable: function make_immutable() {
			var i, j;
			for (i = operations.length - 1; i >= 0; i--) {
				for (j = operations[i].methods.length - 1; j >= 0; j--) {
					this[operations[i].methods[j]] = tried_to_modify_immutable_number;
				}
			}
			return this;
		}

	};
	Number.ZERO = new Number().make_immutable();
}(this));
