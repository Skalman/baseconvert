module("twos_complement");

test("Basic requirements", function () {
	expect(2);
	ok(Base, "Base");
	ok(Base.extensions.twos_complement, "Base.extensions.twos_complement");
});

test("Valid base", function () {
	expect(1);

	strictEqual(Base.valid("2-compl"), true, "2-compl");
});

test("Convert between bases", function () {
	var i, kv, from, to, undefined,
		conversions = [
			{ from: 2, to: "2-compl",
				"10 1010 0011": "0010 1010 0011",
				"-10 1010 0011": "1101 0101 1101",
			},
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
