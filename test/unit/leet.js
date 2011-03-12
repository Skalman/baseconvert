module("leet");

test("Basic requirements", function () {
	expect(2);
	ok(Base, "Base");
	ok(Base.extensions.leet, "Base.extensions.leet");
});

test("Convert to and from leet", function () {
	expect(12);
	var undefined;

	strictEqual(Base(10, 10, "lEeT"), "leet", "lEeT > leet");
	strEqual(Base.to(10, 1337), "leet", "1337 > leet");
	strEqual(Base.from(10, "LEET"), 1337, "LEET > 1337");

	strictEqual(Base(100, 100, "lE:eT"), "le:et", "lE:eT > le:et");
	strEqual(Base.to(100, 1337), "le:et", "1337 > le:et");
	strEqual(Base.from(100, "LE:ET"), 1337, "LE:ET > 1337");


	strictEqual(Base.from(10, " leet"), undefined, "preceding space > not 1337");
	strictEqual(Base.from(10, "le:et"), undefined, "le:et in base 10 > not 1337");

	strictEqual(Base.from(100, "leet"), undefined, "leet in base 100 > not 1337");
	strictEqual(Base.from(100, "l:eet"), undefined, "l:eet in base 100 > not 1337");
	strictEqual(Base.from(100, ":leet"), undefined, "l:eet in base 100 > not 1337");

	// assuming the extension 'standard'
	strEqual(Base(36, 10, "115"), "leet", "base 36 > leet");
});
