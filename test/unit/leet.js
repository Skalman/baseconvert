module('leet');

testConverters('Convert to and from leet', ['extLeet'], function (converter) {
	expect(11);
	var undefined;

	strictEqual(converter.convert(10, 10, 'lEeT'), 'leet', 'lEeT > leet');
	strEqual(converter.to(10, 1337), 'leet', '1337 > leet');
	strEqual(converter.from(10, 'LEET'), 1337, 'LEET > 1337');

	strictEqual(converter.convert(100, 100, 'lE:eT'), 'le : et', 'lE:eT > le:et');
	strEqual(converter.to(100, 1337), 'le : et', '1337 > le:et');
	strEqual(converter.from(100, 'LE:ET'), 1337, 'LE:ET > 1337');


	strictEqual(converter.from(10, ' leet'), undefined, 'preceding space > not 1337');
	strictEqual(converter.from(10, 'le:et'), undefined, 'le:et in base 10 > not 1337');

	strictEqual(converter.from(100, 'leet'), undefined, 'leet in base 100 > not 1337');
	strictEqual(converter.from(100, 'l:eet'), undefined, 'l:eet in base 100 > not 1337');
	strictEqual(converter.from(100, ':leet'), undefined, 'l:eet in base 100 > not 1337');
});

testConverters('Convert to leet rather than standard', ['extLeet', 'extStandard'], function (converter) {
	expect(1);

	strEqual(converter.convert(36, 10, '115'), 'leet', 'base 36 > leet');
});
