$(function () {
	function dump(v) {
		return JSON.stringify(v);
	}
	function scroll_to_view(elem) {
		// we only care about vertical scrolling; also 10px extra scrolling if we scroll at all
		elem = $(elem);
		var viewport_height, elem_height,
			$win = $(win),
			$doc = $(win.document),
			scroll_top = $doc.scrollTop(),
			offset = elem.offset();
		if (offset.top < scroll_top) {
			// elem was too far up
			$doc.scrollTop(offset.top - 10);
		} else {
			viewport_height = $win.height();
			elem_height = elem.height();
			if (scroll_top + viewport_height < offset.top + elem_height) {
				// elem was too far down
				// element offset + element height = scroll_top + viewport height
				$doc.scrollTop(offset.top + elem_height - viewport_height + 10);
			}
		}
	}
	function ucfirst(str) { // like PHP
		return str.charAt(0).toUpperCase() + str.substr(1);
	}
	var log = // window.console.log || 
		function() {};
	var undefined, push_state, replace_state, last_state_origin, last_suggest_layout,
		win = window,
		Model = win.Model,
		history = win.history,
		noop = function () {},
		row_tools_template = [
			'<div class="row_tools">',
				'<a href="" title="Remove this row" class="remove" tabindex="2">✕</a>',
				'<span title="Invalid number" class="invalid_number_symbol">!</span>',
			'</div>'].join(""),
		row_template = [
			'<div class="row" id="row_#id#">',
				'<div class="base">',
					'<label class="label" for="number_#id#">',
						'<input type="hidden" id="base_#id#" value="" tabindex="1">',
						'<strong class="name"></strong>',
					'</label>',
				'</div>',
				'<div class="number">',
					'<div class="label">',
						'<input id="number_#id#" value="" tabindex="1">',
					'</div>',
				'</div>',
				row_tools_template,
			'</div>'].join(""),
		suggestion_template = '<li data-id="#id#">#label#</li>',
		name_html_replace = [/(\(.+?\))/, "<small>$1</small>"],
		layout_change_count = 0;

	// Upon init: Add the row tools
	$(".row").append(row_tools_template);

	if (history.pushState && history.replaceState) {
		push_state = function (s) { history.pushState(undefined, undefined, s) };
		replace_state = function (s) { history.replaceState(undefined, undefined, s) };
	} else {
		push_state = replace_state = noop;
	}

	var listener = {
		base_change: function base_change(rows) {
			log("base change: " + dump(rows));
			var id, name;
			for (id in rows) {
				name = Model.get_name(id);
				if (name) {
					name = ucfirst(name).replace(name_html_replace[0], name_html_replace[1]);
				}
				$("#row_"+id+" .name").html(name);
				$("#base_"+id).val(rows[id]);
				if (rows[id] === "10") {
					$("#row_"+id).addClass("hilite");
				}
			}
		},
		base_suggest: function base_suggest(row_id, base_value, bases) {
			var i, html, input, offset,
				suggestions = $("#suggestions");
			if (layout_change_count !== last_suggest_layout || suggestions.data("row_id") !== row_id) {
				last_suggest_layout = layout_change_count;
				input = $("#base_" + row_id);
				offset = input.offset();
				offset.top += input.innerHeight();
				suggestions
					.data({
						row_id: row_id,
						selected: -1
					})
					.show()
					.width(input.width())
					.offset(offset);
			} else {
				suggestions.show();
			}
			if (bases.length === 0) {
				if (base_value === "") {
					bases = [["", "No suggestions"]];
				} else {
					bases = [["", "No matching bases"]];
				}
			}

			// add suggestions
			html = [];
			for (i = 0; i < bases.length; i++) {
				html.push(
					suggestion_template.replace("#id#", bases[i][0]).replace("#label#", ucfirst(bases[i][1]))
				);
			}
			suggestions.html(html.join(""));
			$("li", suggestions).first().trigger("mouseover");
			
			// scroll to the right position, if needed
			scroll_to_view(suggestions);
		},
		hide_base_suggest: function hide_base_suggest() {
			$("#suggestions").hide();
		},
		number_change: function number_change(rows) {
			log("number change: " + dump(rows));
			var i, row, new_origin, state, new_state_func;
			for (i in rows) {
				row = $("#number_"+i);
				if (row.val() !== rows[i]) {
					row.val(rows[i]);
				}
			}

			// TODO: listen for these changes by the browser as well!
			if (false) {
				new_origin = Model.get_origin();
				state = "#" + Model;
				if (new_origin === last_state_origin || last_state_origin === undefined) {
					replace_state(state);
				} else {
					push_state(state);
				}
				last_state_origin = new_origin;
			}
		},
		// we don't need to listen to origin_change
		row_delete: function row_delete(row_id) {
			log("row delete: row="+row_id);
			var row = $("#row_"+row_id),
				next_input = $(row.next().find("input:visible")[0]);
			row.remove();
			layout_change_count++;
			next_input.focus();
		},
		row_add: function row_add(row_id) {
			log("row add: row="+row_id);
			$(row_template.replace(/#id#/g, row_id)).appendTo("#convert");
			layout_change_count++;
		},
		new_change: function new_change(new_id, old_id) {
			log("new change: new_id="+new_id+"  old_id="+old_id);
			var row;
			if (old_id !== undefined) {
				row = $("#row_"+old_id).removeClass("new");
				row.find(".base .label").attr("for", "number_"+old_id);
				$("#base_"+old_id)
					.attr("type", "hidden")
					.removeAttr("title")
					.prependTo("#row_"+old_id+" .base");
			}
			row = $("#row_"+new_id).addClass("new");
			row.find(".base .label").attr("for", "base_"+new_id);
			row.find(".name").html("Enter a new base here");
			$("#base_"+new_id)
				.attr({type: "text", title:"Enter a new base here"});
			layout_change_count++;
		},
		invalid_number_row_change: function invalid_number_row_change(new_id, old_id) {
			log("invalid number row change: new_id="+new_id+"  old_id="+old_id);
			var row;
			if (old_id) {
				$("#convert .invalid_number").removeClass("invalid_number");
			}
			if (new_id) {
				$("#row_"+new_id).addClass("invalid_number");
			}
		}
	};
	Model.set_state("2|8|10|16|36");
	Model.listen(listener);
});
