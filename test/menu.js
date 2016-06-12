(function () {
	var curFile = location.pathname.replace(/^.*\//, "") || "index.html";
	var curFilter = curFile + (location.search || '?');

	var modules = {
		core: "Core",
		standard: "Standard (2-36)",
		standard_big: "Standard (> 36)",
		roman: "Roman numerals",
		leet: "Leet",
		twos_complement: "Two's complement",
	};

	document.body.appendChild(createMenu());



	function createMenu() {
		var p = document.createElement("p");
		p.style.position = "absolute";
		p.style.top = 0;

		link("index.html", "Small");
		text(" (");
		link("index.min.html", "minified");
		text(")")
		text(" - ");
		link("high-precision.html", "High precision");
		text(" (");
		link("high-precision.min.html", "minified");
		text(")")

		text(" \xa0 — \xa0 ");

		link(curFile + '?', "All");

		// Generate module links dynamically from script tags with the same name (unit/core.js contains the core module)
		var scripts = document.getElementsByTagName("script");
		for (var i = 0; i < scripts.length; i++) {
			console.log(scripts.length)
			if (/(^|\/)unit\//.test(scripts[i].src)) {
				var basename = scripts[i].src.replace(/^.*\//, "").replace(".js", "");
				if (modules[basename]) {
					text(" - ");
					link(curFile + "?filter=" + basename + ":", modules[basename]);
				}
			}
		}

		return p;

		function link(href, text) {
			var a = document.createElement(href === curFile || href === curFilter ? "b" : "a");
			a.href = href.replace(/\?$/, '');
			a.textContent = text;
			p.appendChild(a);
		}

		function text(text) {
			var t = document.createTextNode(text);
			p.appendChild(t);
		}
	}

}());
