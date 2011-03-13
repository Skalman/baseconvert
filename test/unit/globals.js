(function (window) {
	module(); // all
	var all_good = true;
	test("Globals", function () {
		var i,
			globals = window.test_globals,
			good_globals = {Base: true};
		for (i in window) {
			if (!(i in globals) && !(i in good_globals)) {
				ok(false, "New global introduced: '" + i + "'");
				all_good = false;
			}
		}
		for (i in globals) {
			if (!(i in window)) {
				ok(false, "Global deleted: '" + i + "'");
				all_good = false;
			}
		}
		for (i in good_globals) {
		    if (!(i in window)) {
		        ok(false, "Global should have been created: '" + i + "'");
		        all_good = false;
		    }
		}
		if (all_good) {
		    ok(true, "No new globals (except those expected) introduced, and no globals were deleted");
		}
	});
})(this);
