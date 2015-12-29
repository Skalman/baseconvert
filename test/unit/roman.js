module("roman");

test("Basic requirements", function () {
	expect(2);
	ok(Base, "Base");
	ok(Base.extensions.roman, "Base.extensions.roman");
});

test("All roman numerals", function () {
	expect(1);
	var N = Base.Number,
		i, roman, internal;
	for (i = 1; i <= 3999; i++) {
		roman = Base.to("roman", i);
		internal = Base.from("roman", roman);
		if (!internal || !internal.eq(i)) {
			ok(false, "Conversion error: "+i+" > "+roman+" > "+internal);
			return;
		}
	}
	ok(true, "Passed all");
});

test("To roman numerals", function () {
	expect(13);
	var undefined, N = Base.Number;


	strictEqual(Base.to("roman", 0), undefined, "0 > undefined");
	strictEqual(Base.to("roman", 1.0), "I", "1.0 > I");
	strictEqual(Base.to("roman", 1.1), undefined, "1.1 > undefined");
	strictEqual(Base.to("roman", 17), "XVII", "17 > XVII");
	strictEqual(Base.to("roman", 24), "XXIV", "24 > XXIV");
	strictEqual(Base.to("roman", 495), "CDXCV", "495 > CDXCV");
	strictEqual(Base.to("roman", 505), "DV", "505 > DV");
	strictEqual(Base.to("roman", 1444), "MCDXLIV", "1444 > MCDXLIV"); // smallest pandigital number
	strictEqual(Base.to("roman", 1666), "MDCLXVI", "1666 > MDCLXVI"); // largest efficient pandigital number
	strictEqual(Base.to("roman", 1988), "MCMLXXXVIII", "1988 > MCMLXXXVIII");
	strictEqual(Base.to("roman", 1999), "MCMXCIX", "1999 > MCMXCIX");
	strictEqual(Base.to("roman", 3000), "MMM", "3000 > MMM");
	strictEqual(Base.to("roman", 3999), "MMMCMXCIX", "3999 > MMMCMXCIX");
});

test("From roman numerals, bad values", function () {
	expect(13);
	var undefined, N = Base.Number;

	strEqual(Base.from("roman", "abc"), undefined, "abc > undefined");
	strEqual(Base.from("roman", "IIIII"), undefined, "IIIII > undefined (instead of 5)");
	strEqual(Base.from("roman", "IVII"), undefined, "IVII > undefined (instead of 6)");
	strEqual(Base.from("roman", "VIV"), undefined, "VIV > undefined (instead of 9)");
	strEqual(Base.from("roman", "VV"), undefined, "VV > undefined (instead of 10)");
	strEqual(Base.from("roman", "IXI"), undefined, "IXI > undefined (instead of 10)");
	strEqual(Base.from("roman", "IXIV"), undefined, "IXIV > undefined (instead of 13)");
	strEqual(Base.from("roman", "IXIX"), undefined, "IXIX > undefined (instead of 18)");
	strEqual(Base.from("roman", "CCCCC"), undefined, "CCCCC > undefined (instead of 500)");
	strEqual(Base.from("roman", "CCCCCC"), undefined, "CCCCCC > undefined (instead of 600)");
	strEqual(Base.from("roman", "DCD"), undefined, "DCD > undefined (instead of 900)");
	strEqual(Base.from("roman", "MIMIM"), undefined, "MIMIM > undefined (instead of 2998)");
	strEqual(Base.from("roman", "MMMM"), undefined, "MMMM > undefined (instead of 4000)");

});

test("From roman numerals, good values", function () {
	expect(13);
	var undefined, N = Base.Number;

	strEqual(Base.from("roman", "I"), 1, "I > 1");
	strEqual(Base.from("roman", "IIII"), 4, "IIII > 4");
	strEqual(Base.from("roman", "VIIII"), 9, "VIIII > 9");
	strEqual(Base.from("roman", "XVII"), 17, "XVII > 17");
	strEqual(Base.from("roman", "XXIV"), 24, "XXIV > 24");
	strEqual(Base.from("roman", "CDXCV"), 495, "CDXCV > 495");
	strEqual(Base.from("roman", "D"), 500, "D > 500");
	strEqual(Base.from("roman", "DV"), 505, "DV > 505");
	strEqual(Base.from("roman", "MCMLXXXVIII"), 1988, "MCMLXXXVIII > 1988");
	strEqual(Base.from("roman", "MCMXCIX"), 1999, "MCMXCIX > 1999");
	strEqual(Base.from("roman", "MMM"), 3000, "MMM > 3000");
	strEqual(Base.from("roman", "MMMDCCCCLXXXXVIIII"), 3999, "MMMDCCCCLXXXXVIIII > 3999");
	strEqual(Base.from("roman", "MMMCMXCIX"), 3999, "MMMCMXCIX > 3999");
});
