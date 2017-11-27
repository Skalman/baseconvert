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
		fn(convSrcBig, srcGlobals.Base);
	});

	test(name + ' (src; BigNumber.js)', function () {
		fn(convSrcBNo, srcGlobals.Base);
	});

	test(name + ' (min; Big.js)', function () {
		fn(convMinBig, minGlobals.Base);
	});

	test(name + ' (min; BigNumber.js)', function () {
		fn(convMinBNo, minGlobals.Base);
	});
}

function testConvertersOpts(opts) {
	var name = opts.name;
	var extensionNames = opts.extensionNames;
	var Big = opts.Big;
	var fn = opts.fn;

	var convSrc = new srcGlobals.Base({ Big: Big });
	var convMin = new minGlobals.Base({ Big: Big });

	extensionNames.forEach(function (extension) {
		convSrc.extend(srcGlobals[extension]);
		convMin.extend(minGlobals[extension]);
	});

	test(name + ' (src)', function () {
		fn(convSrc, srcGlobals.Base);
	});

	test(name + ' (min)', function () {
		fn(convMin, minGlobals.Base);
	});
}

