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

test("Edge cases - rounded results accepted", function () {
	var i, j, k, result,
		conversions = [
			{ from: 16, to: 10,
				"abcdef123456.1" : [
					"188900967593046.0625",
					"188900967593046.063",
					"188900967593046.06",
					"188900967593046.1",
					"188900967593046"
				],
				"500.0000000001": [
					"1280.000000000000909494701772928237915039062",
					"1280.00000000000090949470177292823791503906",
					"1280.0000000000009094947017729282379150391",
					"1280.000000000000909494701772928237915039",
					"1280.00000000000090949470177292823791504",
					"1280.0000000000009094947017729282379150",
					"1280.000000000000909494701772928237915",
					"1280.00000000000090949470177292823792",
					"1280.0000000000009094947017729282379",
					"1280.000000000000909494701772928238",
					"1280.00000000000090949470177292824",
					"1280.0000000000009094947017729282",
					"1280.000000000000909494701772928",
					"1280.00000000000090949470177293",
					"1280.0000000000009094947017729",
					"1280.000000000000909494701773",
					"1280.00000000000090949470177",
					"1280.0000000000009094947018",
					"1280.000000000000909494702",
					"1280.00000000000090949470",
					"1280.0000000000009094947",
					"1280.000000000000909495",
					"1280.00000000000090949",
					"1280.0000000000009095",
					"1280.000000000000909",
					"1280.00000000000091",
					"1280.0000000000009",
					"1280.000000000001",
					"1280",
				]
			}
		];
	function in_array(elem, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] === elem) {
				return true;
			}
		}
		return false;
	}
	for (i = 0; i < conversions.length; i++) {
		for (j in conversions[i]) {
			if (j === "from" || j === "to") {
				continue;
			}
			result = Base(conversions[i].from, conversions[i].to, j);
			if (in_array(result, conversions[i][j])) {
				ok(true, "correct conversion of '" + j + "'");
			} else {
				equal(result, conversions[i][j][0], "conversion of '" + j + "' (rounded results accepted)");
			}
		}
	}
});
