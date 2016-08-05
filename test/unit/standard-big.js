module('standard-big');

testConverters('Valid base', ['extStandard'], function (converter) {
	expect(6);

	strictEqual(converter.valid(' 46'), false, 'preceding space');
	strictEqual(converter.valid(37), true, '37');
	strictEqual(converter.valid(44.256), false, '44.256');
	strictEqual(converter.valid('50'), true, '"50"');
	strictEqual(converter.valid(85), true, '85');
	strictEqual(converter.valid(1337), true, '1337');
});

testConverters('Valid base and number', ['extStandard'], function (converter) {
	expect(6);

	strictEqual(converter.valid(' 46', '6'), false, 'preceding space');
	strictEqual(converter.valid(37, '36:4:1:0.1:6:1:000:006'), true, '36:4:1:0.1:6:1:000:006 in base 37');
	strictEqual(converter.valid(4.256, '1'), false, '1 in base 4.256');
	strictEqual(converter.valid('50', '50'), false, '50 in base 50');
	strictEqual(converter.valid(85, '.84:84'), true, '.84:84 in base 85');
	strictEqual(converter.valid(1337, '1234.1330:512'), true, '1234.1330:512 in base 1337');
});

testConverters('Convert to and from bases', ['extStandard'], function (converter) {
	var i, kv, from, to, undefined,
		conversions = [
			{ from: 100, to: 10,
				'-000005.0000': '-5',
				'-0:000:00:0005': '-5',
				'-0': '0',
				'12 : 34 . 5 : 67': '1 234.0567',
				'-.5': '-0.05',
				'.62:50': '0.625',
				'.61:42:60': '0.61426', // better precision, round well
				'4:65.': '465',
				'' : undefined,
				'.' : undefined,
				'-.' : undefined,
				'-' : undefined,
				'A': undefined,
				'BCD': undefined,
				'0..5': undefined,
				'42.375': undefined,
				'00055555': undefined
			},
			{ from: '100', to: '10',
				'00555': undefined,
				'15': '15',
				'6': '6'
			},
			{ from: 37, to: 10,
				'36:36': '1 368',
				'-.0': '0',
				'-2.37': undefined
			},
			{ from: 10, to: 100,
				'0.61426': '0 . 61 : 42 : 60' // tests rounding
			},
			{ from: -100, to: 10,
				'4:56:78.9': '34 477.91',
				'3:4:56:78.90:12:3': '-2 965 522.89880 3',
				'3:4:56:78,90:12:3': '-2 965 522.89880 3'
			},
			{ from: 10, to: -100,
				'1234': '1 : 88 : 34',
				'-1234': '13 : 66',
				'1234.5': undefined
			}
		];

	expect(conversions.length);

	function keys_and_values(obj) {
		var k = [], v = [], i;
		for (i in obj) {
			if (i === 'to' || i === 'from') {
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

		var results = kv[0].map(function (number) {
			return converter.convert(from, to, number);
		});

		deepEqual(results, kv[1], 'base '+from+' > base '+to);
	}
});

testConverters('Edge cases - rounded results accepted', ['extStandard'], function (converter) {
	var i, j, k, result,
		conversions = [
			{ from: 16, to: 100,
				'abcdef12345.1' : [
					'11 : 80 : 63 : 10 : 47 : 45 : 65 . 6 : 25',
					'11 : 80 : 63 : 10 : 47 : 45 : 65 . 6',
					'11 : 80 : 63 : 10 : 47 : 45 : 65'
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
			if (j === 'from' || j === 'to') {
				continue;
			}
			result = converter.convert(conversions[i].from, conversions[i].to, j);
			if (in_array(result, conversions[i][j])) {
				ok(true, 'correct conversion of "' + j + '"');
			} else {
				equal(result, conversions[i][j][0], 'conversion of "' + j + '" (rounded results accepted)');
			}
		}
	}
});
