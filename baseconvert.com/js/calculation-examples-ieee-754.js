var CALCULATION_EXAMPLES_DEFAULT = [
	{ name: 'decimal', number: '-0.1', baseId: 'dec' },
	{ name: 'decimal', number: '1e+100', baseId: 'dec' },
	{ name: 'decimal', number: 'NaN', baseId: 'dec' },
	{ name: 'decimal', number: '∞', baseId: 'dec' },
];

var CALCULATION_EXAMPLES = [
	{ name: 'decimal', number: Math.PI + '', numberDisplay: '3.14...', baseId: 'dec' },
	{ name: 'decimal', number: Math.E + '', numberDisplay: '2.718...', baseId: 'dec' },
	{ name: 'decimal', number: '1.7976931348623157e+308', numberDisplay: '1.797...e+308', baseId: 'dec' },
	// More examples added below.
];

(function () {
	var examples = {
		'decimal': {
			dec: ['0', '-0', '-∞', 'Infinity', '1.45e-100'],
		},
		'32 bit binary': {
			bin32: ['1 01010101 01010101010101010101010', '0 01111111 00000000000000000000000'],
		},
		'64 bit binary': {
			bin64: ['1 00000000000 0000000000000000000000000000000000000000000000000000'],
		},
		'32 bit hexadecimal': {
			hex32: ['FFFFFFFF'],
		},
		'64 bit hexadecimal': {
			hex64: ['3FD5555555555555'],
		},
	};

	angular.forEach(examples, function (value, name) {
		angular.forEach(value, function (value, baseId) {
			value.forEach(function (number) {
				CALCULATION_EXAMPLES.push({
					name: name,
					baseId: baseId,
					number: number,
					numberDisplay: (
						baseId === 'dec' || number.length < 9
							? number
							: number.replace(' ', '').substr(0, 5) + '...'
					),
				});
			});
		});
	});
}());
