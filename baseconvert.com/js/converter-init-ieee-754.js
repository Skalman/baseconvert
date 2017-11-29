// Create the base converter object to be used in the app.
var converter = new Base({
	Big: BigNumber.another({ DECIMAL_PLACES: 1100, ERRORS: false }),
	extensions: [extIeee754]
});

var initialBases = [
	{
		id: 'dec',
		name: 'decimal',
		group: 'dec',
	},
	{
		id: 'dec32',
		name: 'decimal',
		explanation: 'exact',
		group: '32',
		readonly: true,
	},
	{
		id: 'bin32',
		name: 'binary',
		group: '32',
	},
	{
		id: 'hex32',
		name: 'hexadecimal',
		group: '32',
	},
	{
		id: 'dec64',
		name: 'decimal',
		explanation: 'exact',
		group: '64',
		readonly: true,
	},
	{
		id: 'bin64',
		name: 'binary',
		group: '64',
	},
	{
		id: 'hex64',
		name: 'hexadecimal',
		group: '64',
	},
];
