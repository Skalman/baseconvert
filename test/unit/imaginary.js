module('imaginary');

testConverters('Valid base', ['extImaginary', 'extStandard'], function (converter) {
	expect(1);

	strictEqual(converter.valid('2i'), true, '2i');
});

testConverters('Valid number', ['extImaginary', 'extStandard'], function (converter) {
	expect(3);

	strictEqual(converter.valid('2i', '1 23 03 21'), true, '1 23 03 21');
	strictEqual(converter.valid('2i', '4'), false, '4');
	strictEqual(converter.valid('10', '123 - 456i'), true, '123 - 456i');
});

testConverters('Convert between bases', ['extImaginary', 'extStandard'], function (converter) {
	var i,
		conversions = [
			{
				10: '31 + 12i',
				'2i': '12 3123',
			},
			{
				10: '-99',
				'2i': '202 0101',
			},
			{
				10: '-98i',
				'2i': '1010 1030',
			},
			{
				10: '-40 297 527 320 487 639 156 872 - 10 074 381 830 121 909 789 218i',
				'2i': '1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230 1230',
			},
		];

	expect(conversions.length);

	for (i = 0; i < conversions.length; i++) {
		deepEqual(
			{
				10: converter.convert('2i', 10, conversions[i]['2i']),
				'2i': converter.convert(10, '2i', conversions[i][10]),
			},
			conversions[i],
			conversions[i][10] + ' <-> ' + conversions[i]['2i']);
	}
});
