$(function () {
	"use strict";

	var undefined, focus_timeout, suggestions_timeout,
		convert = $("#convert"),
		suggestions = $($.parseHTML([
			'<div id="suggestions" tabindex="2">',
				'<ul></ul>',
			'</div>'].join(""))).appendTo('#convert'),
		KEY_TAB = 9,
		KEY_BACKSPACE = 8,
		KEY_DELETE = 46,
		KEY_ENTER = 13,
		KEY_ESCAPE = 27,
		KEY_PAGEUP = 33,
		KEY_PAGEDOWN = 34,
		KEY_LEFT = 37,
		KEY_UP = 38,
		KEY_RIGHT = 39,
		KEY_DOWN = 40;

	function remove_row(elem) {
		try {
			Model.delete_row($(elem).parents(".row").attr("id").replace("row_", ""));
		} catch (e) {
		}
	}
	function suggestion_hover(index, is_elem) {
		var elem;
		if (!is_elem) {
			elem = $("li", suggestions).eq(index);
		} else {
			elem = $(index);
			index = elem.index();
		}
		if (!elem.hasClass("selected")) {
			$(".selected", suggestions).removeClass("selected");
			elem.addClass("selected");
			suggestions.data("selected", index);
		}
	}
	function suggestion_select(index, is_elem) {
		var elem, base_id,
			row_id = suggestions.data("row_id");
		if (!is_elem) {
			elem = $("li", suggestions).eq(index);
		} else {
			elem = $(index);
		}
		base_id = elem.data("id") + ""; // if it looks like a number jQuery makes it into one
		if (base_id !== "") {
			Model.base_change(row_id, base_id);
			$("#number_" + row_id).focus();
			return base_id;
		}
		return false;
	}


	convert
		.on({
			focus: function () {
				var f = $(".focus", convert)[0],
					p = $(this).parents(".row")[0];
				clearTimeout(focus_timeout);
				if (f !== p) {
					if (f) {
						$(f).removeClass("focus");
					}
					$(p).addClass("focus");
				}
			},
			blur: function () {
				var that = this;
				focus_timeout = setTimeout(function () {
					$(that).parents(".row").removeClass("focus");
				}, 100); // 100 ms is barely noticeable, and leaves plenty of time for the next element to focus
			}
		}, "input, .remove")

		.on("keydown", ".number input", function (e) {
			if ((e.which === KEY_BACKSPACE || e.which === KEY_DELETE) && this.value === "") {
				$(this).blur().parents(".row").find(".remove").focus();
				return false;
			}
		})

		.on("blur keypress keyup click change", ".number input", function (event) {
			if ($(this).parents(".new").length === 0) {
				Model.number_change(this.id.replace("number_", ""), this.value);
			}
		})

		.on({
			keydown: function (e) {
				this.autocomplete = "off";

				var index, length, base_id, row_id, wrap,
					key = e.which;
				if (key === KEY_DOWN || key === KEY_UP || key === KEY_PAGEDOWN || key === KEY_PAGEUP) {
					e.preventDefault();
					index = suggestions.data("selected") +
							(key === KEY_DOWN ? 1 :
								key === KEY_UP ? -1 :
								key === KEY_PAGEDOWN ? 5 :
								-5); // KEY_PAGEUP
					wrap = key === KEY_DOWN || key === KEY_UP; // don't wrap pgdown/up
					length = $("li", suggestions).length;
					if (index < 0) {
						index = wrap ? length - 1 : 0;
					} else if (length <= index) {
						index = wrap ? 0 : length - 1;
					}
					suggestion_hover(index);
				} else if (key === KEY_ENTER || (key === KEY_TAB && this.value !== "")) {
					index = suggestions.data("selected");
					if (suggestion_select(index)) {
						e.preventDefault();
					}
				} else if (key === KEY_ESCAPE) {
					Model.hide_base_suggest();
				}
			},
			blur: function () {
				var that = this;
				suggestions_timeout = setTimeout(function () {
					Model.hide_base_suggest();
				}, 100); // 100 ms is barely noticeable, and leaves plenty of time for the next element to focus
			}
		}, ".base input")

		.on("focus keypress keyup click change", ".base input", function (e) {
			if (e.which === KEY_ESCAPE) {
				Model.hide_base_suggest();
			} else if (e.type === "keypress" && e.which === 0) {
				// don't do anything
			} else {
				Model.base_suggest(this.id.replace("base_", ""), this.value);
			}
		})

		.on({
			focus: function () {
				$(this).attr("tabindex", 1);
			},
			blur: function () {
				$(this).attr("tabindex", 2);
			},
			click: function () {
				remove_row(this);
				return false;
			},
			keydown: function (e) {
				if (e.which === KEY_BACKSPACE || e.which === KEY_DELETE) {
					remove_row(this);
					return false;
				}
			}
		}, ".remove");


	suggestions
		.on("focus", function () {
			clearTimeout(suggestions_timeout);
			$("#base_" + suggestions.data("row_id")).focus();
		})

		.on({
			mouseover: function () {
				suggestion_hover(this, true);
			},
			click: function () {
				suggestion_select(this, true);
			}
		}, "li");
});
