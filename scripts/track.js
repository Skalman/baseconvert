$(function () {
	var undefined,
		win = window,
		$window = $(win),
		wlocation = win.location,
		$convert = $("#convert"),
		state =
			page_id === "index" ? win.Model :
//			page_id === "floating-point-calculator" ? win.calculator_expression :
			undefined,

		// if you won't stay on the page for 10 seconds you're not really interested
		interest_delay = 10000,

		// if you won't use it for 10 seconds you just used it accidentally
		use_delay = 10000,
		data = {
			screen: $window.width() + "x" + $window.height(),
			uri: wlocation.pathname + wlocation.search + wlocation.hash,
			referrer: win.document.referrer,
			random: Math.floor(Math.random() * 4294967296)
			// event and state set later
		};


	$window.on("mousemove scroll click keydown", track);
	$convert.on("change", "input", track);
	function track(event) {
		var type = data.event = event.type;
		if (type === "change") {
			// input changed somewhere
			$convert.off("change", "input");
			setTimeout(function () {
				data.state = state+"";
				$.post("track?action=use", data);
			}, use_delay);
		} else {
			// just some activity on the page
			$window.off("mousemove scroll click keydown");
			$.post("track?action=human", data);
			setTimeout(function () {
				data.state = state+"";
				$.post("track?action=interested", data);
			}, interest_delay);
		}
	}
});
