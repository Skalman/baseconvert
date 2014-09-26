$(function () {
	var examples = {
		"fractions": {
			"10": ["3.14", "1.618", "-1.4142"]
		},
		"fractional binary": {
			"2": ["1100.01101", "-0.011101101", "100.1", "1001.101"]
		},
		"binary": {
			"2": ["101010", "101", "11111111", "-1000", "1000011101010"]
		},
		"octal": {
			"8": ["644"]
		},
		"hexadecimal": {
			"16": ["8BA53"]
		},
		"duodecimal": {
			"12": ["100.A"]
		},
		"roman numerals": {
			"roman": ["IV", "IIII", "LXII", "XII", "MDCCLXXVI", Base("10", "roman", new Date().getFullYear())]
		},
		"any base": {
			"13": ["42.0009c3"],
			"36": ["CON.VERT", "333"],
			"85": ["45:1.76:15"],
			"100": ["4:9", "12:95"],
			"1337": ["6:1294.126"]
		}
	};
	// transform the examples into a list which is more easy to handle
	var i, j, k,
		list = [];
	for (i in examples) {
		for (j in examples[i]) {
			for (k = 0; k < examples[i][j].length; k++) {
				list.push([i, j, examples[i][j][k]]);
			}
		}
	}
	examples = list;

	// examples
	function find_base(base) {
		return $("#convert .base input").filter(function () {
			return $(this).val() === base;
		}).first();
	}
	// $("#convert .base input").filter(function () { return $(this).val() === '2'; }).first().attr('id');
	function new_example(elem) {
		var example = examples[ Math.floor(Math.random() * examples.length) ];
		elem
			.data({
				base: example[1],
				number: example[2]
			})
			.attr("title", example[2] + " in " + (example[1] === 'roman' ? 'roman numerals' : 'base ' + example[1]));
			// TODO
		$("strong", elem).text(example[0]);
		$("span", elem).text(example[2]);
	}
	function show_example() {
		var number, parent,
			base_value = $(this).data("base")+"",
			number_value = $(this).data("number")+"",
			base = find_base(base_value),
			is_new = false; // existing base element, or the new one
		new_example($(this));
		if (!base.length) {
			base = $("#convert .new .base input");
			is_new = true;
		}
		
		parent = base.parents(".row").first();
		number = parent.find(".number input").first();
		$.delay.clear("example");
		$("#convert .example").removeClass("example");
		$.delay("example", function () {
			parent.addClass("example");
		});
		if (is_new) {
			$.delay("example", [
				function () {
					base.focus();
				},
				800,
				function () {
					var i = 1, interval = setInterval(function () {
						if (i <= base_value.length) {
							base
								.val(base_value.substr(0, i))
								.change();
							i++;
						} else {
							clearInterval(interval);
						}
					}, 400/base_value.length);
				},
				1000,
				function () {
					$("#suggestions li:first-child").click();
				},
				300
			]);
		}
		$.delay("example", [
			function () {
				number.focus();
			},
			800,
			function () {
				var i = 1, interval = setInterval(function () {
					if (i <= number_value.length) {
						number
							.val(number_value.substr(0, i))
							.change();
						i++;
					} else {
						clearInterval(interval);
					}
				}, 800/number_value.length);
			},
			3000,
			function () {
				parent.removeClass("example");
			}
		]);
		return false;
	}
	
	$("#examples a")
		.on("click", show_example)
		.attr("href", "");
});
