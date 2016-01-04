module("standard");

test("Basic requirements", function () {
	expect(2);
	ok(Base, "Base");
	ok(Base.extensions.standard, "Base.extensions.standard");
});

test("Valid base", function () {
	expect(7);

	strictEqual(Base.valid(2), true, "2");
	strictEqual(Base.valid(" 6"), false, "preceding space");
	strictEqual(Base.valid("36"), true, "36");
	strictEqual(Base.valid(10), true, "10");
	strictEqual(Base.valid(4.256), false, "4.256");
	strictEqual(Base.valid(-4), true, "-4");
	strictEqual(Base.valid(-45), true, "-45");
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
				"42.375": "10 1010.011",
				",75": "0.11"
			},
			{ from: 2, to: 36,
				"102": undefined,
				"-.0": "0",
				"-,0": "0",
				"-100100000100100100001110000010.101": "-A0B1C2.MI"
			},
			{ from: 10, to: 20,
				"0.61426": "0.C5E1C"
			},
			{ from: 20, to: 10,
				"0.C5E1C": "0.61426"
			},
			{ from: -2, to: 10,
				"10100100": "-156",
				"-10100100": "156",
				"10.1101": "-2.1875",
				" 1 0 , 1 1 0 1 ": "-2.1875"
			},
			{ from: 10, to: -10,
				"1234": "19 374",
				"-1234": "2 846",
				"1234.5": undefined
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

test("Edge cases - rounded results accepted", function () {
	var i, j, k, result, good,
		conversions = [
			{ from: 16, to: 10,
				"abcdef123456.1" : [
					"188 900 967 593 046.0625",
					"188 900 967 593 046.063",
					"188 900 967 593 046.06",
					"188 900 967 593 046.1",
					"188 900 967 593 046"
				],
				"ababababababababab" : [
					"3 166 763 406 159 644 437 419",
					"3 166 763 406 159 644 437 420",
					"3 166 763 406 159 644 437 400",
					"3 166 763 406 159 644 437 000",
					"3 166 763 406 159 644 440 000",
					"3 166 763 406 159 644 400 000",
					"3 166 763 406 159 644 000 000",
					"3 166 763 406 159 640 000 000",
					"3 166 763 406 159 600 000 000"
				],
				"500.0000000001": [
					"1 280.00000 00000 00909 49470 17729 28237 91503 90625",
					"1 280.00000 00000 00909 49470 17729 28237 91503 9063",
					"1 280.00000 00000 00909 49470 17729 28237 91503 906",
					"1 280.00000 00000 00909 49470 17729 28237 91503 91",
					"1 280.00000 00000 00909 49470 17729 28237 91503 9",
					"1 280.00000 00000 00909 49470 17729 28237 91504",
					"1 280.00000 00000 00909 49470 17729 28237 9150",
					"1 280.00000 00000 00909 49470 17729 28237 915",
					"1 280.00000 00000 00909 49470 17729 28237 92",
					"1 280.00000 00000 00909 49470 17729 28237 9",
					"1 280.00000 00000 00909 49470 17729 28238",
					"1 280.00000 00000 00909 49470 17729 2824",
					"1 280.00000 00000 00909 49470 17729 282",
					"1 280.00000 00000 00909 49470 17729 28",
					"1 280.00000 00000 00909 49470 17729 3",
					"1 280.00000 00000 00909 49470 17729",
					"1 280.00000 00000 00909 49470 1773",
					"1 280.00000 00000 00909 49470 177",
					"1 280.00000 00000 00909 49470 18",
					"1 280.00000 00000 00909 49470 2",
					"1 280.00000 00000 00909 49470",
					"1 280.00000 00000 00909 4947",
					"1 280.00000 00000 00909 495",
					"1 280.00000 00000 00909 49",
					"1 280.00000 00000 00909 5",
					"1 280.00000 00000 00909",
					"1 280.00000 00000 0091",
					"1 280.00000 00000 009",
					"1 280.00000 00000 01",
					"1 280",
				],
				"5F5E0FF.FFFFFF" : [
					"99 999 999.99999 99403 95355 22460 9375",
					"99 999 999.99999 99403 95355 22460 938",
					"99 999 999.99999 99403 95355 22460 94",
					"99 999 999.99999 99403 95355 22460 9",
					"99 999 999.99999 99403 95355 2246",
					"99 999 999.99999 99403 95355 225",
					"99 999 999.99999 99403 95355 22",
					"99 999 999.99999 99403 95355 2",
					"99 999 999.99999 99403 95355",
					"99 999 999.99999 99403 9536",
					"99 999 999.99999 99403 953",
					"99 999 999.99999 99403 95",
					"99 999 999.99999 99404",
					"99 999 999.99999 994",
					"99 999 999.99999 99",
					"100 000 000"
				]
			},
			{ from: "10", to: "16",
				"65535.9999999999" : [
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF8 D2BB D972",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF8 D2BB D97",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF8 D2BB D9",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF8 D2BB E",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF8 D2BC",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF8 D2C",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF8 D3",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF8 D",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5DF9",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 5E",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546 6",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A546",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A54",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A5",
					"FFFF.FFFF FFFF 920C 8098 A109 1520 A",
					"FFFF.FFFF FFFF 920C 8098 A109 1521",
					"FFFF.FFFF FFFF 920C 8098 A109 152",
					"FFFF.FFFF FFFF 920C 8098 A109 15",
					"FFFF.FFFF FFFF 920C 8098 A109 1",
					"FFFF.FFFF FFFF 920C 8098 A109",
					"FFFF.FFFF FFFF 920C 8098 A11",
					"FFFF.FFFF FFFF 920C 8098 A1",
					"FFFF.FFFF FFFF 920C 8098 A",
					"FFFF.FFFF FFFF 920C 8099",
					"FFFF.FFFF FFFF 920C 80A",
					"FFFF.FFFF FFFF 920C 8",
					"FFFF.FFFF FFFF 920D",
					"FFFF.FFFF FFFF 92",
					"FFFF.FFFF FFFF 9",
					"FFFF.FFFF FFFF",
					"1 0000"
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
			good = in_array(result, conversions[i][j]);
			equal(result, good ? result : conversions[i][j][0],
				"converting '" + j + "' (" + conversions[i].from + " > " + conversions[i].to + "; rounded results accepted)");
		}
	}
});
