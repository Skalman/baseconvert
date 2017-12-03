function extIeee754() {
	'use strict';

	var converter = this;

	function normalize(number) {
		return number
			.replace(/ /g, '')
			.replace(',', '.')
			.replace(/nan/i, 'NaN')
			.replace(/∞|infinity/i, 'Infinity');
	}

	function parseToView(digitsPerByte, fromBase, number) {
		if (/^0[bx]/i.test(number)) {
			number = number.substr(2);
		}

		var arr = new Uint8Array(number.length / digitsPerByte);

		for (var i = 0; i < arr.length; i++) {
			arr[i] = parseInt(
				number.substr(i * digitsPerByte, digitsPerByte),
				fromBase
			);
		}

		return new DataView(arr.buffer);
	}

	function numberToArr32(number) {
		var arr = new Uint8Array(4);
		var view = new DataView(arr.buffer);
		view.setFloat32(0, +number);
		return arr;
	}

	function numberToArr64(number) {
		var arr = new Uint8Array(8);
		var view = new DataView(arr.buffer);
		view.setFloat64(0, +number);
		return arr;
	}

	function arrToBase(toBase, arr) {
		var result = '';
		for (var i = 0; i < arr.length; i++) {
			result += (256 + arr[i]).toString(toBase).substr(1).toUpperCase();
		}

		return result;
	}

	function getExactDec(number) {
		return (
			number === 0 && 1/number < 0
				? '-0'
				: new converter.Big(
					number.toString(16),
					16
				).toString(10)
		);
	}

	function valid(base, number) {
		if (number === undefined) {
			return base === 'dec' || /^(dec|bin|hex)(32|64)$/.test(base);
		}

		number = normalize(number);

		if (number) {
			if (base === 'dec') {
				return number === 'NaN' || !isNaN(+number);
			} else if (base === 'bin32') {
				return /^(0b)?[01]{32}$/i.test(number);
			} else if (base === 'bin64') {
				return /^(0b)?[01]{64}$/i.test(number);
			} else if (base === 'hex32') {
				return /^(0x)?[0-9a-f]{8}$/i.test(number);
			} else if (base === 'hex64') {
				return /^(0x)?[0-9a-f]{16}$/i.test(number);
			}
		}

		return false;
	}

	return {
		from: function (fromBase, number) {
			number = normalize(number);

			if (!valid(fromBase, number)) {
				return;
			}

			if (fromBase === 'dec') {
				return +number;
			} else if (fromBase === 'bin32') {
				return parseToView(8, 2, number).getFloat32(0);
			} else if (fromBase === 'bin64') {
				return parseToView(8, 2, number).getFloat64(0);
			} else if (fromBase === 'hex32') {
				return parseToView(2, 16, number).getFloat32(0);
			} else if (fromBase === 'hex64') {
				return parseToView(2, 16, number).getFloat64(0);
			}
		},

		to: function (toBase, number) {
			if (toBase === 'dec') {
				return '' + number;
			} else {
				number = +number;

				if (toBase === 'dec32') {
					return getExactDec(new DataView(numberToArr32(number).buffer).getFloat32(0));
				} else if (toBase === 'dec64') {
					return getExactDec(number);
				} else if (toBase === 'bin32') {
					return arrToBase(2, numberToArr32(number)).replace(/^(.)(.{8})(.+)$/, '$1 $2 $3');
				} else if (toBase === 'bin64') {
					return arrToBase(2, numberToArr64(number)).replace(/^(.)(.{11})(.+)$/, '$1 $2 $3');
				} else if (toBase === 'hex32') {
					return arrToBase(16, numberToArr32(number));
				} else if (toBase === 'hex64') {
					return arrToBase(16, numberToArr64(number));
				}
			}
		},

		valid: valid,
	};
}
