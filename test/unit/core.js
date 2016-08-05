module('core');

testConverters('Basic requirements', [], function () {
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
