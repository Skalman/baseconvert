(function (Base) {
	"use strict";
	var log2 = Math.log2 || function (number) {
		return Math.log(number) / Math.log(2);
	};

	Base.extend({
		name: "twos_complement",
		valid_base: function twos_complement_valid_base(base) {
			return base === "2-compl";
		},
		valid_from: function twos_complement_valid_from(base, number) {
			return base === "2-compl" && /^[01]+\.?[01]*$/.test(number.replace(/ /g, ''));
		},
		valid_to: function twos_complement_valid_to(base, number) {
			return base === "2-compl";
		},
		fractional: true,

		to_internal: function twos_complement_to_internal(from_base, number) {
			number = number
				.replace(/ /g, "")
				// Multiples of the same digit in the beginning of the number don't change anything.
				.replace(/^(.)\1+/, "$1");

			var sign = number[0];
			if (sign === "0") {
				return Base.from("2", number);
			} else {
				var integer_length = number.indexOf(".");
				if (integer_length === -1)
					integer_length = number.length;
				return new Base.Number(-Math.pow(2, integer_length) + Base.from("2", number).value);
			}
		},
		from_internal: function twos_complement_from_internal(to_base, number) {
			number = number.value;
			var sign;
			if (number >= 0) {
				number = Base.to("2", number).replace(/ /g, "");
				sign = "0";
			} else {
				var decimal_places = 0;
				while (number % 1) {
					number *= 2;
					decimal_places++;
				}

				var minimum_digits = Math.floor(log2(-number)) + 1;

				number = Base.to("2",
					Math.pow(2, minimum_digits) + number
				).replace(/ /g, "");

				while (number.length < minimum_digits) {
					number = "0" + number;
				}

				while (number.length < decimal_places) {
					number = "1" + number;
				}

				if (decimal_places) {
					number =
						number.substr(0, number.length - decimal_places) +
						"." +
						number.substr(number.length - decimal_places);
				}

				sign = "1";
			}

			var parts = number.split(".");
			var integer = parts[0];
			var fraction = parts[1];

			// Add at least two digits indicating sign / for padding
			integer = sign + sign + integer;
			fraction = fraction && fraction + "00";

			// The result should be a number of digits, divisible by 4.
			while (integer.length % 4 !== 0)
				integer = sign + integer;
			while (fraction && fraction.length % 4 !== 0)
				fraction += "0";

			integer = integer.replace(/[01]{4}(?=[01])/g, '$& ');
			fraction = fraction && fraction.replace(/[01]{4}(?=[01])/g, '$& ');

			return integer + (fraction ? "." + fraction : "");
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
