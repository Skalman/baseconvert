function extTwosComplement() {
	'use strict';

	var converter = this;

	return {
		from: function (fromBase, number) {
			if (fromBase !== '2-compl') {
				return;
			}

			number = number
				.replace(/ /g, '')
				.replace(',', '.')
				// Multiples of the same digit in the beginning of the number don't change anything.
				.replace(/^(.)\1+/, '$1');

			if (!number) {
				return;
			}

			var sign = number[0];
			var asBinary = converter.from('2', number);
			if (sign === '0' || !asBinary) {
				return asBinary;
			} else {
				var integerLength = number.indexOf('.');
				if (integerLength === -1) {
					integerLength = number.length;
				}

				return converter.Big(2).pow(integerLength).mul(-1).add(asBinary);
			}
		},

		to: function (toBase, number) {
			if (toBase !== '2-compl') {
				return;
			}

			var sign;
			if (number.gte(0)) {
				number = converter.to('2', number).replace(/ /g, '');
				sign = '0';
			} else {
				var decimalPlaces = 0;
				for (var i = 0; i < converter.FRACTION_PRECISION && !number.mod(1).eq(0); i++) {
					number = number.mul(2);
					decimalPlaces++;
				}
				number = number.round();

				var minimumDigits = converter.to('2', number).replace(/[ \.\-]/g, '').length;

				number = converter.to('2',
					converter.Big(2).pow(minimumDigits).add(number)
				).replace(/ /g, '');

				while (number.length < minimumDigits) {
					number = '0' + number;
				}

				while (number.length < decimalPlaces) {
					number = '1' + number;
				}

				if (decimalPlaces) {
					number =
						number.substr(0, number.length - decimalPlaces) +
						'.' +
						number.substr(number.length - decimalPlaces);
				}

				sign = '1';
			}

			var parts = number.split(/[.,]/);
			var integer = parts[0];
			var fraction = parts[1];

			// Add at least two digits indicating sign / for padding.
			integer = sign + sign + integer;
			fraction = fraction && fraction + '00';

			// The result should be a number of digits, divisible by 4.
			while (integer.length % 4 !== 0) {
				integer = sign + integer;
			}
			while (fraction && fraction.length % 4 !== 0) {
				fraction += '0';
			}

			integer = integer.replace(/[01]{4}(?=[01])/g, '$& ');
			fraction = fraction && fraction.replace(/[01]{4}(?=[01])/g, '$& ');

			return integer + (fraction ? '.' + fraction : '');
		},

		getName: function (base) {
			if (base === '2-compl') {
				return "two's complement";
			}
		},

		suggest: function (baseText, reBaseText) {
			if (/two|2/i.test(baseText) && /compl/i.test(baseText)) {
				// Close enough match.
				return { match: [['2-compl', "two's complement"]] };
			} else {
				var twos = /(2|two)'?s?/.exec(baseText);
				twos = twos ? twos[0] : "two's";
				if ((twos + ' complement').indexOf(baseText) !== -1) {
					return { proposed: [['2-compl', "two's complement"]] };
				} else {
					return {};
				}
			}
		},
	};
}
