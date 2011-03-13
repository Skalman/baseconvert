(function (window) {
	var i, globals = window.test_globals = {};
	for (i in window) {
		globals[i] = true;
	}

})(this);
