function id(id) {
	return document.getElementById(id);
}

function add_event(obj, evt, fn) {
	if (Object.prototype.toString.call(obj) === "[object Array]") {
		for (var i = 0; i < obj.length; i++) {
			add_event(obj[i], evt, fn);
		}
	} else if (typeof evt === "object") {
		for (var i in evt) {
			add_event(obj, evt[i], fn);
		}
	} else {
		// see http://www.quirksmode.org/js/eventSimple.html
		if (obj.addEventListener) {
			obj.addEventListener(evt, fn, false);
		} else if (obj.attachEvent) {
			obj.attachEvent("on"+evt, fn);
		}
	}
}
function value_to_string(v, recursed) {
	var s = Object.prototype.toString.call(v);
	if (s == "[object Array]") {
		s = [];
		for (var i = 0; i < v.length; i++) {
			s.push(value_to_string(v[i], true));
		}
		if (recursed) {
			return "[" + s.join(", ") + "]";
		} else {
			return s.join(", ");
		}
	} else {
		return v + "";
	}
}
function input(obj_id) {
	var v = id(obj_id).value;
	return v.indexOf(",") === -1 ? v : v.split(/\s*,\s*/);
}
function output(obj_id, params, fn) {
	var obj = id(obj_id), i;
	if (!obj) {
		throw obj_id + " can't be found"
	}
	for (i = 0; i < params.length; i++) {
		params[i] = id(params[i]).value;
		if (params[i] === "") {
			obj.innerHTML = "";
			return;
		}
	}
	try {
		obj.innerHTML = value_to_string(fn.apply(this, params));
	} catch (e) {
		obj.innerHTML = "Exception: " + e;
	}
}
function calculate_base() {
	output("base_result", ["base_from", "base_to", "base_number"], function (from, to, number) {
		return Base(from, to, number);
	});
}
function calculate_to() {
	output("to_result", ["to_to", "to_number"], function (to, number) {
		return Base.to(to, number);
	});
}
function calculate_from() {
	output("from_result", ["from_from", "from_number"], function (from, number) {
		return Base.from(from, number);
	});
}
function calculate_get_name() {
	output("get_name_result", ["get_name_base"], function (base) {
		return Base.get_name(base);
	});
}
function calculate_suggest() {
	output("suggest_result", ["suggest_base"], function (base) {
		return Base.suggest(base);
	});
}

var events = ["keypress", "keyup", "focus", "blur"];
add_event([
	id("base_from"),
	id("base_to"),
	id("base_number")
	], events, calculate_base);
add_event([
	id("to_to"),
	id("to_number")
	], events, calculate_to);
add_event([
	id("from_from"),
	id("from_number")
	], events, calculate_from);
add_event([
	id("get_name_base")
	], events, calculate_get_name);
add_event([
	id("suggest_base")
	], events, calculate_suggest);

// calculate initial values, if any
calculate_base();
calculate_to();
calculate_from();
calculate_get_name();
calculate_suggest();
