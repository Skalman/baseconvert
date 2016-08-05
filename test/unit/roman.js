module('roman');

testConverters('All roman numerals', ['extRoman'], function (converter) {
	expect(1);
	var N = converter.Number,
		i, roman, internal;
	for (i = 1; i <= 3999; i++) {
		roman = converter.to('roman', i);
		internal = converter.from('roman', roman);
		if (!internal || !internal.eq(i)) {
			ok(false, 'Conversion error: '+i+' > '+roman+' > '+internal);
			return;
		}
	}
	ok(true, 'Passed all');
});

testConverters('To roman numerals', ['extRoman'], function (converter) {
	expect(13);
	var undefined, N = converter.Number;


	strictEqual(converter.to('roman', 0), undefined, '0 > undefined');
	strictEqual(converter.to('roman', 1.0), 'I', '1.0 > I');
	strictEqual(converter.to('roman', 1.1), undefined, '1.1 > undefined');
	strictEqual(converter.to('roman', 17), 'XVII', '17 > XVII');
	strictEqual(converter.to('roman', 24), 'XXIV', '24 > XXIV');
	strictEqual(converter.to('roman', 495), 'CDXCV', '495 > CDXCV');
	strictEqual(converter.to('roman', 505), 'DV', '505 > DV');
	strictEqual(converter.to('roman', 1444), 'MCDXLIV', '1444 > MCDXLIV'); // smallest pandigital number
	strictEqual(converter.to('roman', 1666), 'MDCLXVI', '1666 > MDCLXVI'); // largest efficient pandigital number
	strictEqual(converter.to('roman', 1988), 'MCMLXXXVIII', '1988 > MCMLXXXVIII');
	strictEqual(converter.to('roman', 1999), 'MCMXCIX', '1999 > MCMXCIX');
	strictEqual(converter.to('roman', 3000), 'MMM', '3000 > MMM');
	strictEqual(converter.to('roman', 3999), 'MMMCMXCIX', '3999 > MMMCMXCIX');
});

testConverters('From roman numerals, bad values', ['extRoman'], function (converter) {
	expect(13);
	var undefined, N = converter.Number;

	strEqual(converter.from('roman', 'abc'), undefined, 'abc > undefined');
	strEqual(converter.from('roman', 'IIIII'), undefined, 'IIIII > undefined (instead of 5)');
	strEqual(converter.from('roman', 'IVII'), undefined, 'IVII > undefined (instead of 6)');
	strEqual(converter.from('roman', 'VIV'), undefined, 'VIV > undefined (instead of 9)');
	strEqual(converter.from('roman', 'VV'), undefined, 'VV > undefined (instead of 10)');
	strEqual(converter.from('roman', 'IXI'), undefined, 'IXI > undefined (instead of 10)');
	strEqual(converter.from('roman', 'IXIV'), undefined, 'IXIV > undefined (instead of 13)');
	strEqual(converter.from('roman', 'IXIX'), undefined, 'IXIX > undefined (instead of 18)');
	strEqual(converter.from('roman', 'CCCCC'), undefined, 'CCCCC > undefined (instead of 500)');
	strEqual(converter.from('roman', 'CCCCCC'), undefined, 'CCCCCC > undefined (instead of 600)');
	strEqual(converter.from('roman', 'DCD'), undefined, 'DCD > undefined (instead of 900)');
	strEqual(converter.from('roman', 'MIMIM'), undefined, 'MIMIM > undefined (instead of 2998)');
	strEqual(converter.from('roman', 'MMMM'), undefined, 'MMMM > undefined (instead of 4000)');

});

testConverters('From roman numerals, good values', ['extRoman'], function (converter) {
	expect(13);
	var undefined, N = converter.Number;

	strEqual(converter.from('roman', 'I'), 1, 'I > 1');
	strEqual(converter.from('roman', 'IIII'), 4, 'IIII > 4');
	strEqual(converter.from('roman', 'VIIII'), 9, 'VIIII > 9');
	strEqual(converter.from('roman', 'XVII'), 17, 'XVII > 17');
	strEqual(converter.from('roman', 'XXIV'), 24, 'XXIV > 24');
	strEqual(converter.from('roman', 'CDXCV'), 495, 'CDXCV > 495');
	strEqual(converter.from('roman', 'D'), 500, 'D > 500');
	strEqual(converter.from('roman', 'DV'), 505, 'DV > 505');
	strEqual(converter.from('roman', 'MCMLXXXVIII'), 1988, 'MCMLXXXVIII > 1988');
	strEqual(converter.from('roman', 'MCMXCIX'), 1999, 'MCMXCIX > 1999');
	strEqual(converter.from('roman', 'MMM'), 3000, 'MMM > 3000');
	strEqual(converter.from('roman', 'MMMDCCCCLXXXXVIIII'), 3999, 'MMMDCCCCLXXXXVIIII > 3999');
	strEqual(converter.from('roman', 'MMMCMXCIX'), 3999, 'MMMCMXCIX > 3999');
});
