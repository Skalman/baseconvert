var CALCULATION_EXAMPLES_DEFAULT = [
	{ name: 'fractional binary', number: '1100.0101', baseId: '2' },
	{ name: 'hexadecimal', number: '8BA53', baseId: '16' },
	{ name: 'fractions', numberDisplay: '3.14', number: '3.14159 26535 89793 23846', baseId: '10' },
	{ name: 'any base', number: '45 : 1 . 76 : 15', baseId: '85' },
];


var CALCULATION_EXAMPLES = [
	{ name: 'fractions', numberDisplay: '1.618', number: '1.61803 39887 49894 84820', baseId: '10' },
	{ name: 'fractions', numberDisplay: '-1.4142', number: '-1.41421 35623 73095 04880', baseId: '10' },
	// More examples added below
];

(function () {
	var examples = {
		'fractional binary': {
			2: ['-0.0111 0110 11', '100.1', '1001.101'],
		},
		binary: {
			2: ['10 1010', '101', '1111 1111', '-1000', '1 0000 1110 1010'],
		},
		octal: {
			8: ['644'],
		},
		hexadecimal: {
			16: ['1B45E'],
		},
		duodecimal: {
			12: ['100.A'],
		},
		'roman numerals': {
			roman: [
				'IV', 'IIII', 'MCMLXXXVIII', 'LXII', 'XII', 'MDCCLXXVI',
				Base('10', 'roman', new Date().getFullYear()),
			],
		},
		'any base': {
			13: ['42.0009c3'],
			36: ['CON.VERT', '333'],
			100: ['4 : 9', '12 : 95'],
			1337: ['6 : 1294 . 126'],
		}
	};

	angular.forEach(examples, function (value, name) {
		angular.forEach(value, function (value, baseId) {
			value.forEach(function (number) {
				CALCULATION_EXAMPLES.push({
					name: name,
					baseId: baseId,
					number: number,
				});
			});
		});
	});
}());

