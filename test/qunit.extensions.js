function strEqual(actual, expected, message) {
	equal(actual+'', expected+'', message);
}

function testConverters(name, extensionNames, fn) {
	var convSrcBig = new srcGlobals.Base({ Big: Big });
	var convSrcBNo = new srcGlobals.Base({ Big: BigNumber.another({ DECIMAL_PLACES: 1000, POW_PRECISION: 1000, ERRORS: false }) });
	var convMinBig = new minGlobals.Base({ Big: Big });
	var convMinBNo = new minGlobals.Base({ Big: BigNumber.another({ DECIMAL_PLACES: 1000, POW_PRECISION: 1000, ERRORS: false }) });

	extensionNames.forEach(function (extension) {
		convSrcBig.extend(srcGlobals[extension]);
		convSrcBNo.extend(srcGlobals[extension]);
		convMinBig.extend(minGlobals[extension]);
		convMinBNo.extend(minGlobals[extension]);
	});

	test(name + ' (src; Big.js)', function () {
		fn(convSrcBig);
	});

	test(name + ' (src; BigNumber.js)', function () {
		fn(convSrcBNo);
	});

	test(name + ' (min; Big.js)', function () {
		fn(convMinBig);
	});

	test(name + ' (min; BigNumber.js)', function () {
		fn(convMinBNo);
	});
}
