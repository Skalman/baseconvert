function extLeet() {
	'use strict';

	var converter = this;

	return {
		// Normally takes parameters base and number (it'll always be 10/100 and 'leet'/'le:et' respectively).
		from: function (fromBase, number) {
			number = number.toLowerCase();
			if ((fromBase === '10' && number === 'leet') || (fromBase === '100' && number.replace(/ /g, '') === 'le:et')) {
				return converter.Big(1337);
			}
		},

		// Normally takes parameters base and number (it'll always be 10/100 and 1337 respectively).
		to: function (toBase, number) {
			if (number instanceof converter.Big && number.eq(1337)) {
				if (toBase === '10') {
					return 'leet';
				} else if (toBase === '100') {
					return 'le : et';
				}
			}
		},
	};
}
