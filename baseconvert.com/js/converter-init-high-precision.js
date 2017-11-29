// Create the base converter object to be used in the app.
var converter = new Base({
	Big: BigNumber.another({ DECIMAL_PLACES: 1000, POW_PRECISION: 1000, ERRORS: false }),
	extensions: [extTwosComplement, extImaginary, extStandard, extLeet]
});

var initialBases = [
	{
		id: '2',
		name: 'binary',
		explanation: 'base 2',
	},
	{
		id: '8',
		name: 'octal',
		explanation: 'base 8',
	},
	{
		id: '10',
		name: 'decimal',
		explanation: 'base 10',
	},
	{
		id: '16',
		name: 'hexadecimal',
		explanation: 'base 16',
	},
];