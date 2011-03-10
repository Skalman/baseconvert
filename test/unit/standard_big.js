module("standard_big");

test("Basic requirements", function () {
	expect(2);
	ok(Base, "Base");
	ok(Base.extensions.standard_big, "Base.extensions.standard_big");
});

test("Valid base", function () {
	expect(6);
	
	strictEqual(Base.valid(" 46"), false, "preceding space");
	strictEqual(Base.valid(37), true, "37");
	strictEqual(Base.valid(4.256), false, "4.256");
	strictEqual(Base.valid("50"), true, '"50"');
	strictEqual(Base.valid(85), true, "85");
	strictEqual(Base.valid(1337), true, "1337");
});

test("Valid base and number", function () {
	expect(6);
	
	strictEqual(Base.valid(" 46", "6"), false, "preceding space");
	strictEqual(Base.valid(37, "36:4:1:0.1:6:1:000:006"), true, "36:4:1:0.1:6:1:000:006 in base 37");
	strictEqual(Base.valid(4.256, "1"), false, "1 in base 4.256");
	strictEqual(Base.valid("50", "50"), false, "50 in base 50");
	strictEqual(Base.valid(85, ".84:84"), true, ".84:84 in base 85");
	strictEqual(Base.valid(1337, "1234.1330:512"), true, "1234.1330:512 in base 1337");
});

test("Convert to and from bases", function () {
	var i, kv, from, to, undefined,
		conversions = [
			{ from: 100, to: 10,
				"-000005.0000": "-5",
				"-0:000:00:0005": "-5",
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
				"42.375": undefined,
				"00055555": undefined
			},
			{ from: "100", to: "10",
				"00555": undefined,
				"15": "15",
				"6": "6"
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
