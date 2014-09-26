// split this file into two parts - one quite unintelligent data layer and one Base layer
(function (window, Base) {
	// like in PHP
	function array_combine(keys, values) {
		var obj = {}, i = 0;
		for (; i < keys.length; i++) {
			obj[ keys[i] ] = values[i];
		}
		return obj;
	}

	// TODO make 'data' more intelligent
	var undefined,
		data = {
			length: 0, // row count
			id_counter: 0, // last id
			origin: undefined, // id
			nu: undefined, // new
			ids: [],
			bases: {},
			rows: {},
			suggestions: [undefined, ""],
			invalid_number_row: undefined // undefined or the id of the faulting row
		},
		listeners = [];
	/*
	var example_data = {
		54: {
			index: 1,
			base: 2,
			number: "1001.1",
			is_origin: false,
			is_new: false,
			name: "binary (base 2)"
		},
		60: {
			index: 0,
			base: 10,
			number: "9.5",
			is_origin: true,
			is_new: false,
			name: "decimal (base 10)"
		},
		61: {
			index: 2,
			base: "",
			number: "",
			is_origin: false,
			is_new: false,
			name: ""
		}
	};
	*/
	function clear_data(ignore_listener) {
		var i;
		for (i = 0; i < data.length; i++) {
			trigger_ignore("row_delete", ignore_listener, data.ids[i]);
		}
		data.length = 0;
		data.ids = [];
		data.rows = {};
		data.bases = {};
	}
	function trigger(event, ignore_listener) {
		var i, args = Array.prototype.slice.call(arguments, 1);
		for (i = 0; i < listeners.length; i++) {
			if (listeners[i][event]) {
				listeners[i][event].apply(listeners[i], args);
			}
		}
	}
	function trigger_ignore(event, ignore_listener) {
		var i, args = Array.prototype.slice.call(arguments, 2);
		for (i = 0; i < listeners.length; i++) {
			if (listeners[i][event] && listeners[i] !== ignore_listener) {
				listeners[i][event].apply(listeners[i], args);
			}
		}
	}
	function add_row() {
		var id = ++data.id_counter,
			index = data.length++;
		data.rows[id] = {index: index, base: "", number: "", is_origin: false, is_new: false};
		data.ids[index] = id;
		data.bases[""] = true;
		trigger("row_add", id);
		return id;
	}
	function delete_row(id) {
		var i,
			rows = data.rows,
			ids = data.ids,
			bases = data.bases;
		for (i = rows[id].index; i < data.length - 1; i++) {
			ids[i] = ids[i+1];
			rows[ ids[i] ].index--;
		}
		ids.pop();
		delete bases[ rows[id].base ];
		delete rows[id];
		if (data.origin === id) {
			data.origin = undefined;
		}
		if (data.nu === id) {
			data.nu = undefined;
		}
		data.length--;
		trigger("row_delete", id);
	}
	function get_id(index) {
		return index === data.length ? add_row() : data.ids[index];
	}
	function set_bases(bases) {
		var id, row,
			changed_bases = {},
			changed = false;
		for (id in bases) {
			row = data.rows[id];
			if (row.bases !== bases[id]) {
				delete data.bases[ row.base ];
				data.bases[ bases[id] ] = true;
				row.base = bases[id];
				row.name = Base.get_name(bases[id]);
				changed_bases[id] = bases[id];
				changed = true;
			}
		}
		if (changed) {
			trigger("base_change", changed_bases);
		}
	}
	function set_base(row, base) {
		var b = {};
		b[row] = base;
		set_bases(b);
	}
	function set_numbers(numbers) {
		var id,
			changed_numbers = {},
			changed = false;
		for (id in numbers) {
			if (data.rows[id].number !== numbers[id]) {
				data.rows[id].number = numbers[id];
				changed_numbers[id] = numbers[id];
				changed = true;
			}
		}
		if (changed) {
			trigger("number_change", changed_numbers);
		}
	}
	function set_origin(id) {
		if (data.origin !== id) {
			var old_origin = data.origin;
			if (old_origin !== undefined && data.rows[old_origin]) {
				data.rows[old_origin].is_origin = false;
			}
			if (id !== undefined) {
				data.rows[id].is_origin = true;
			}
			data.origin = id;
			trigger("origin_change", id, old_origin);
		}
	}
	function set_new(id) {
		if (data.nu !== id) {
			var old_new = data.nu;
			if (old_new !== undefined && data.rows[old_new]) {
				data.rows[old_new].is_new = false;
			}
			data.rows[id].is_new = true;
			data.nu = id;
			trigger("new_change", id, old_new);
		}
	}
	function set_suggestions(row_id, base_value, suggestions_callback) {
		var suggestions, suggestions_list, i, j;
		if (data.suggestions[0] !== row_id || data.suggestions[1] !== base_value) {
			data.suggestions[0] = row_id;
			data.suggestions[1] = base_value;
			suggestions = suggestions_callback(base_value);
			suggestions_list = suggestions.match || [];
			// TODO
			// TODO console.log(JSON.stringify(data.bases));
			for (i in { proposed: true, good: true, other: true }) {
				if (suggestions[i]) {
					for (j = 0; j < suggestions[i].length; j++) {
						if (!data.bases[ suggestions[i][j][0] ]) {
							suggestions_list.push(suggestions[i][j]);
						}
					}
				}
			}
			trigger("base_suggest", row_id, base_value, suggestions_list);
		}
	}
	function set_invalid_number_row(row_id) {
		var old_row_id = data.invalid_number_row;
		if (row_id !== old_row_id) {
			data.invalid_number_row = row_id;
			trigger("invalid_number_row_change", row_id, old_row_id);
		}
	}
	function hide_suggestions() {
		if (data.suggestions[0] !== undefined || data.suggestions[1] !== "") {
			data.suggestions = [undefined, ""];
			trigger("hide_base_suggest");
		}
	}
	function unserialize(serialization) {
		var i, tmp,
			id = 0,
			state = [];
		serialization = serialization.split("|");
		for (i = 0; i < serialization.length; i++) {
			tmp = serialization[i].split("=");
			if (Base.valid(tmp[0], tmp[1])) { // test base, or (if the value exists) base+value
				if (tmp[1] !== undefined) {
					// origin base
					state.push({
						id: id++,
						base: tmp[0],
						number: tmp[1],
						is_origin: true
					});
				} else {
					// normal base
					state.push({
						id: id++,
						base: tmp[0]
					});
				}
			}
		}
		state.push({
			id: id++,
			is_new: true
		});
		return state;
	}

	var Model = window.Model = {
		_data: data, // for easy access
		number_change: function Model_number_change(row_id, number_value) {
			if (data.rows[row_id].number === number_value) {
				// do nothing if the value hasn't changed
				return;
			}

			// TODO make special case of number_value==="" (don't go via Base)
			if (number_value !== "" && !Base.valid(data.rows[row_id].base, number_value)) {
				// if this the number_value is invalid for the base of row_id, show error
				data.rows[row_id].number = number_value;
				set_invalid_number_row(row_id);
				return;
			}

			var obj = {},
				bases = [],
				i,
				numbers,
				row_index = data.rows[row_id].index;

			for (i = 0; i < data.length; i++) {
				if (i !== row_index) {
					bases.push(data.rows[ data.ids[i] ].base);
				} else {
					bases.push(undefined);
				}
			}

			obj[row_id] = number_value;
			numbers = Base(data.rows[row_id].base, bases, number_value);
			numbers[row_index] = number_value;
			set_origin(number_value === "" ? undefined : row_id);
			set_invalid_number_row(undefined);
			set_numbers(array_combine(data.ids, numbers));
		},
		base_suggest: function Model_base_suggest(row_id, base_value) {
			set_suggestions(row_id, base_value, function () {
				return Base.suggest(base_value, true);
			});
		},
		hide_base_suggest: hide_suggestions,
		base_change: function Model_base_change(row_id, base) {
			if (data.rows[row_id].is_new) {
				hide_suggestions();
				var new_row = add_row();
				set_base(row_id, base);
				set_new(new_row);
				if (data.origin !== undefined) {
					var origin = data.rows[data.origin];
					set_numbers(array_combine([row_id], [Base(origin.base, base, origin.number)]));
				}
			}
		},
		delete_row: function Model_delete_row(row_id) {
			delete_row(row_id);
		},
		listen: function listen(listener) {
			listeners.push(listener);
		},

		// example: 2|10=9.5|roman
		set_state: function Model_set_state(state, ignore_listener) {
			// TODO simplify to only accept strings
			if (typeof state === "string") {
				state = unserialize(state);
			}
			clear_data(ignore_listener);
			var i, row, id, base, number, name, is_origin, is_new, origin_id,
				changed_bases = {};
			for (i = 0; i < state.length; i++) {
				row = state[i];

				// id
				if (row.id !== undefined) {
					id = row.id;
					data.id_counter = Math.max(data.id_counter, id);
				} else {
					id = ++data.id_counter;
				}
				base = row.base === undefined ? "" : row.base;
				number = row.number === undefined ? "" : row.number;
				name = row.name === undefined ? Base.get_name(base) : row.name;
				is_origin = row.is_origin === undefined ? false : row.is_origin;
				is_new = row.is_new === undefined ? false : row.is_new;
				if (is_origin && origin_id === undefined) {
					// two rows may not be the origin - only use the first
					origin_id = data.origin = id;
				}
				if (is_new) {
					data.nu = id;
				}
				data.ids.push(id);
				data.rows[id] = {
					index: i,
					base: base,
					number: number,
					name: name,
					is_origin: is_origin,
					is_new: is_new
				};
				data.bases[base] = true;
				if (!is_new) {
					changed_bases[id] = base;
				}

				// trigger
				trigger_ignore("row_add", ignore_listener, id);
				// origin will be triggered later on, while changing numbers
				if (is_new) {
					trigger_ignore("new_change", ignore_listener, id, undefined);
				}
			}
			data.length = state.length;

			trigger_ignore("base_change", ignore_listener, changed_bases);

			if (origin_id !== undefined) {
				// calculate!
				number = data.rows[origin_id].number;
				data.rows[origin_id].number = undefined;
				Model.number_change(origin_id, number);
			}
		},
		get_name: function Model_get_name(row_id) {
			return data.rows[row_id].name;
		},
		get_origin: function Model_get_origin() {
			return data.origin;
		},
		toString: function Model_toString() {
			var i, str = [];
			for (i = 0; i < data.ids.length; i++) {
				if (data.rows[data.ids[i]].is_origin) {
					str.push(data.rows[data.ids[i]].base + "=" + data.rows[data.ids[i]].number);
				} else if (!data.rows[data.ids[i]].is_new) {
					str.push(data.rows[data.ids[i]].base);
				}
			}
			return str.join("|");
		}
	};

	// listen to
/*	base_change
		fn({row_id: new_base_id, row_id2: new_base_id2})
	base_suggest
		fn(row_id, {base_id: base_name, base_id2: base_name2})
	number_change
		fn({row_id: new_number, row_id2: new_number2})
	origin_change
		fn(new_id, old_id)
	row_delete
		fn(row_id)
	row_add
		fn(row_id)
	new_change
		fn(new_id, old_id)
*/
})(this, Base);
