function extImaginary() {
	'use strict';

	var converter = this;
	var Base = converter.constructor;

	return {
		// Only convert directly between base 10 and base 2i.
		convert: function (fromBase, toBase, number) {
			if (fromBase === '2i' && toBase === '10') {
				return quatImagToDec(number);
			} else if (fromBase === '10' && toBase === '2i') {
				return decToQuatImag(number);
			} else {
				return;
			}
		},

		from: function (fromBase, number) {
			if (fromBase === '2i') {
				var dec = quatImagToDec(number);
				if (dec && dec.indexOf('i') === -1) {
					return converter.Big(dec.replace(/ /g, ''));
				}
			}
		},

		to: function (toBase, number) {
			if (toBase === '2i') {
				return decToQuatImag(number + '');
			}
		},

		valid: function (base, number) {
			if (base === '10' && number) {
				// Make sure that e.g. 4i is a valid number in base 10.
				return decToQuatImag(number) !== undefined;
			}
		},

		getName: function (base) {
			if (base === '2i') {
				return 'quater-imaginary (base 2i)';
			}
		},

		suggest: function (baseText, reBaseText) {
			if (/\b2i/i.test(baseText) || (/quat/i.test(baseText) && /imag/i.test(baseText))) {
				// Close enough match.
				return { match: [['2i', 'quater-imaginary (base 2i)']] };
			} else if ('2i quater-imaginary'.indexOf(baseText) !== -1) {
				// Partly a match (or no text entered).
				return { proposed: [['2i', 'quater-imaginary (base 2i)']] };
			} else {
				return {};
			}
		},
	};

	function rev(str) {
		return str.split('').reverse().join('');
	}


	function decToQuatImag(num) {
		num	= num.replace(/ /g, '');
		var imag, real;
		var match = num.match(/^(\-?[0-9.]+)([\+\-][0-9.]*)i$/);
		if (match) {
			real = match[1];
			imag = match[2];
			if (imag.length === 1) {
				imag += '1';
			}
			if (imag[0] === '+') {
				imag = imag.substr(1);
			}
		} else {
			match = num.match(/^(\-?[0-9.]*)(i?)$/);
			if (!match) {
				return;
			} else if (match[2] === 'i') {
				real = '0';
				if (match[1] === '' || match[1] === '-') {
					imag = match[1] + '1';
				} else {
					imag = match[1];
				}
			} else {
				real = match[1];
				imag = '0';
			}
		}

		var imag_quat = converter.to('-4', converter.Big(imag).div(2));
		var real_quat = converter.convert('10', '-4', real);

		if (!imag_quat || !real_quat) {
			return;
		}

		imag_quat = imag_quat.replace(/ /g, '').split('.');
		real_quat = real_quat.replace(/ /g, '').split('.');

		var imag_quat_integ = imag_quat[0];
		var real_quat_integ = real_quat[0];
		var imag_quat_fract = imag_quat[1] || '0';
		var real_quat_fract = real_quat[1] || '0';

		var integ = '';
		for (var i = Math.max(imag_quat_integ.length, real_quat_integ.length) - 1; i >= 0; i--) {
			integ += imag_quat_integ[imag_quat_integ.length-1 - i] || '0';
			integ += real_quat_integ[real_quat_integ.length-1 - i] || '0';
		}
		integ = integ.replace(/^0(.)/, '$1');

		var fract = '';
		for (var i = 0; i < Math.max(imag_quat_fract.length, real_quat_fract.length); i++) {
			fract += imag_quat_fract[i] || '0';
			fract += real_quat_fract[i] || '0';
		}
		fract = fract.replace(/(.)0$/, '$1');

		integ = Base.addSpaces(integ, 4);
		fract = Base.addSpaces(fract, 4, true);

		if (fract === '0') {
			return integ;
		} else {
			return integ + '.' + fract;
		}
	}


	function quatImagToDec(num) {
		num	= num.replace(/ /g, '');
		if (!num) {
			return;
		}

		num = num.split('.');
		var integ = num[0] || '0';
		var integ_rev = rev(integ);

		var imag_integ_rev = integ_rev.replace(/[0-3]([0-3])?/g, '$1');
		var real_integ_rev = integ_rev.replace(/([0-3])[0-3]?/g, '$1');

		var imag_integ = rev(imag_integ_rev);
		var real_integ = rev(real_integ_rev);

		var fract = num[1];
		if (fract) {
			var imag_fract = '.' + fract.replace(/([0-3])[0-3]?/g, '$1');
			var real_fract = '.' + fract.replace(/[0-3]([0-3])?/g, '$1');
		}

		var imag_half = converter.from('-4', (imag_integ || '0') + (imag_fract || ''));
		var real = converter.convert('-4', '10', (real_integ || '0') + (real_fract || ''));

		if (!imag_half || !real) {
			return;
		}

		var imag = converter.to('10', imag_half.mul(2));

		if (imag === '0') {
			return real;
		} else if (real === '0') {
			return imag + 'i';
		} else if (imag[0] !== '-') {
			return real + ' + ' + imag + 'i';
		} else {
			return real + ' - ' + imag.substr(1) + 'i';
		}
	}
}
