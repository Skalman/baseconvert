module("big_base");

test("Basic requirements", function () {
	expect(2);
	ok(Base, "Base");
	ok(Base.extensions.big_base, "Base.extensions.big_base");
});

test("Valid base", function () {
	expect(6);
	
	strictEqual(Base.valid(" 46"), false, "preceding space");
	strictEqual(Base.valid(37), true, "37");
	strictEqual(Base.valid(4.256), false, "4.256");
	strictEqual(Base.valid(50), true, "50");
	strictEqual(Base.valid(85), true, "85");
	strictEqual(Base.valid(1337), true, "1337");
});

test("Convert from bases", function () {
	var i, kv, from, to, undefined,
		conversions = [
			{ from: 100, to: 10,
				"-000005.0000": "-5",
				"-0": "0",
				"-.5": "-0.05",
				".62:50": "0.625",
				".61:42:60": "0.61426", // better precision, round well
				"4:65.": "465",
				"" : undefined,
				"." : undefined,
				"-." : undefined,
				"-" : undefined,
				"A": undefined,
				"BCD": undefined,
				"0..5": undefined,
				"42.375": undefined
			},
			{ from: 37, to: 10,
				"36:36": "1368",
				"-.0": "0",
				"-2.37": undefined
			},
			
			{ from: 10, to: 100,
				"0.61426": "0.61:42:60" // tests rounding
			}
		];
	
//	strictEqual(Base.valid(100, "12:3"), true, "Base.valid(100, '12:3')");
	strEqual(Base.from(100, "-.5"), "-0.05", "testing");
//	strEqual(Base.to(100, 1203), "12:3", "testing 1203 > 12:3");
	return;
	expect(conversions.length);
	
	function keys_and_values(obj) {
		var k = [], v = [], i;
		for (i in obj) {
			if (i === "to" || i === "from") {
				continue;
			}
			k.push(i);
			v.push(obj[i]);
		}
		return [k, v];
	}
	
	for (i = 0; i < conversions.length; i++) {
		kv = keys_and_values(conversions[i]);
		to = conversions[i].to;
		from = conversions[i].from;
		deepEqual(Base(from, to, kv[0]), kv[1], "base "+from+" > base "+to);
	}
});
