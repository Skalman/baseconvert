module('core');

testConverters('Basic requirements', [], function (converter, Base) {
	expect(13);
	ok(Base, 'Base');
	ok(new Base({ Big: Big }), 'new with Big.js');
	ok(new Base({ Big: BigNumber }), 'new with BigNumber.js');
	equal(new Base({ Big: Big }).Big, Big, 'converter.Big');
	ok(Base.prototype.extend, 'Base.prototype.extend');
	ok(Base.prototype.convert, 'Base.prototype.convert');
	ok(Base.prototype.convertToMultiple, 'Base.prototype.convertToMultiple');
	ok(Base.prototype.from, 'Base.prototype.from');
	ok(Base.prototype.to, 'Base.prototype.to');
	ok(Base.prototype.valid, 'Base.prototype.valid');
	ok(Base.prototype.getName, 'Base.prototype.getName');
	ok(Base.prototype.suggest, 'Base.prototype.valid');
	ok(Base.prototype.suggestList, 'Base.prototype.suggestList');
});

testConverters('Base.addSpaces', [], function (converter, Base) {
	expect(10);
	equal(Base.addSpaces('123456789', 3, true), '123 456 789', 'From beginning: Even number of groups');
	equal(Base.addSpaces('12345678', 3, true), '123 456 78', 'From beginning: Shorter last group');
	equal(Base.addSpaces('1234567', 3, true), '123 456 7', 'From beginning: Single character last group');
	equal(Base.addSpaces('123', 3, true), '123', 'From beginning: Single group');
	equal(Base.addSpaces('1', 3, true), '1', 'From beginning: Single character');

	equal(Base.addSpaces('1234567890', 5), '12345 67890', 'From end: Even number of groups');
	equal(Base.addSpaces('12345678', 5), '123 45678', 'From end: Shorter first group');
	equal(Base.addSpaces('123456', 5), '1 23456', 'From end: Single character first group');
	equal(Base.addSpaces('12345', 5), '12345', 'From end: Single group');
	equal(Base.addSpaces('1', 5), '1', 'From end: Single character');
})
