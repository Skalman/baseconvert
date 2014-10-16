(function (Base) {
	"use strict";
	var log2 = Math.log2 || function (number) {
		return Math.log(number) / Math.log(2);
	};

	Base.extend({
		name: "two's complement",
		valid_base: function twos_complement_valid_base(base) {
			return base === "2-compl";
		},
		valid_from: function twos_complement_valid_from(base, number) {
			return base === "2-compl" && !/[^01]/.test(number.replace(/ /g, ''));
		},
		valid_to: function twos_complement_valid_to(base, number) {
			return base === "2-compl" && number.value % 1 === 0;
		},
		fractional: false,

		to_internal: function twos_complement_to_internal(from_base, number) {
			number = number
				.replace(/ /g, '')
				// Multiples of the same digit in the beginning of the number don't change anything.
				.replace(/^(.)\1+/, '$1');
			var sign = number[0];
			if (sign === '0') {
				return Base.from('2', number);
			} else {
				return new Base.Number(-Math.pow(2, number.length) + Base.from('2', number).value);
			}
		},
		from_internal: function twos_complement_from_internal(to_base, number) {
			number = number.value;
			var sign;
			if (number >= 0) {
				number = Base.to('2', number).replace(/ /g, '');
				sign = '0';
			} else {

				var minimum_digits = Math.floor(log2(-number)) + 1;

				var orig = number;

				number = Base.to('2',
					Math.pow(2, minimum_digits) + number
				).replace(/ /g, '');

				while (number.length < minimum_digits)
					number = '0' + number;

				sign = '1';
			}

			// Add at least two digits indicating sign
			number = sign + sign + number;

			// The result should be a number of digits, divisible by 4.
			while (number.length % 4 !== 0)
				number = sign + number;

			return number.replace(/[01]{4}(?=[01])/g, '$& ');
		},
		get_name: function twos_complement_get_name(base) {
			return "two's complement";
		},
		suggest_base: function twos_complement_suggest_base(base, tester) {
			if (/two|2/i.test(base) && /compl/i.test(base)) {
				// close enough match
				return { match: [["2-compl", "two's complement"]] };
			} else {
				var twos = /(2|two)'?s?/.exec(base);
				twos = twos ? twos[0] : "two's";
				if ((twos + " complement").indexOf(base) !== -1) {
					return { proposed: [["2-compl", "two's complement"]] };
				} else {
					return {};
				}
			}
		}
	});
})(Base);
