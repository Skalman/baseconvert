(function () {
	module('');

	var globals = {};
	for (var key in window) {
		globals[key] = true;
	}

	window.onload = function () {
		module('');

		test('Globals', function () {
			var allGood = true;
			var goodGlobals = {};
			var scripts = document.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; i++) {
				if (scripts[i].hasAttribute('data-expected-globals')) {
					var expected = scripts[i].getAttribute('data-expected-globals').split(',');
					for (var j = 0; j < expected.length; j++) {
						goodGlobals[expected[j]] = true;
					}
				}
			}

			for (i in window) {
				if (!(i in globals) && !(i in goodGlobals)) {
					ok(false, 'Unexpected global introduced: "' + i + '"');
					allGood = false;
				}
			}
			for (i in globals) {
				if (!(i in window)) {
					ok(false, 'Global deleted: "' + i + '"');
					allGood = false;
				}
			}
			for (i in goodGlobals) {
				if (!(i in window)) {
					ok(false, 'Global should have been created: "' + i + '"');
					allGood = false;
				}
			}
			if (allGood) {
				ok(true, 'No new globals (except those expected) introduced, and no globals were deleted');
			}
		});
	};
})();
