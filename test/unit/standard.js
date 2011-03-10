module("standard");

test("Basic requirements", function () {
	expect(2);
	ok(Base, "Base");
	ok(Base.extensions.standard, "Base.extensions.standard");
});

test("Valid base", function () {
	expect(5);
	
	strictEqual(Base.valid(2), true, "2");
	strictEqual(Base.valid(" 6"), false, "preceding space");
	strictEqual(Base.valid("36"), true, "36");
	strictEqual(Base.valid(10), true, "10");
	strictEqual(Base.valid(4.256), false, "4.256");
});

test("Convert between bases", function () {
	var i, kv, from, to, undefined,
		conversions = [
			{ from: 10, to: 2,
				"-000005.0000": "-101",
				"-0": "0",
				"-.5": "-0.1",
				".0625": "0.0001",
				"4.": "100",
				"" : undefined,
				"." : undefined,
				"-." : undefined,
				"-" : undefined,
				"A": undefined,
				"BCD": undefined,
				"0..5": undefined,
				"42.375": "101010.011"
			},
			{ from: 2, to: 36,
				"102": undefined,
				"-.0": "0",
				"-100100000100100100001110000010.101": "-A0B1C2.MI"
			},
			{ from: 10, to: 20,
				"0.61426": "0.C5E1C"
			},
			{ from: 20, to: 10,
				"0.C5E1C": "0.61426"
			}
		];
	
//	strictEqual(Base("A", 10, 2), undefined, "testing A");
//	strictEqual(Base("A", 10, 2), undefined, "testing A");
//	return;
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
