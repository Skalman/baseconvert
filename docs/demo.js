var bc = new Base({
	Big: Big,
	extensions: [extRoman, extTwosComplement, extStandard, extLeet]
});

function id(id) {
	return document.getElementById(id);
}

function addEvent(obj, evt, fn) {
	if (Object.prototype.toString.call(obj) === '[object Array]') {
		for (var i = 0; i < obj.length; i++) {
			addEvent(obj[i], evt, fn);
		}
	} else if (typeof evt === 'object') {
		for (var i in evt) {
			addEvent(obj, evt[i], fn);
		}
	} else {
		// see http://www.quirksmode.org/js/eventSimple.html
		if (obj.addEventListener) {
			obj.addEventListener(evt, fn, false);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + evt, fn);
		}
	}
}
function valueToString(v) {
	if (!v || typeof v !== 'object' || v instanceof bc.Big) {
		return v + '';
	} else {
		return JSON.stringify(v, null, '  ')
			.replace(/\[\s+('[^']*'),\s+('[^']*')\s+\]/g, '[$1, $2]');
	}
}
function output(objId, params, fn) {
	var obj = id(objId), i;
	if (!obj) {
		throw objId + " can't be found";
	}
	for (i = 0; i < params.length; i++) {
		params[i] = id(params[i]).value;
		if (params[i] === '') {
			obj.innerHTML = '';
			return;
		}
	}
	try {
		obj.innerHTML = valueToString(fn.apply(this, params));
	} catch (e) {
		obj.innerHTML = 'Exception: ' + e;
	}
}

function calculateBase() {
	output('convert_result', ['convert_from', 'convert_to', 'convert_number'], function (from, to, number) {
		return bc.convert(from, to, number);
	});
}
function calculateTo() {
	output('to_result', ['to_to', 'to_number'], function (to, number) {
		return bc.to(to, number);
	});
}
function calculateFrom() {
	output('from_result', ['from_from', 'from_number'], function (from, number) {
		return bc.from(from, number);
	});
}
function calculateGetName() {
	output('getName_result', ['getName_base'], function (base) {
		return bc.getName(base);
	});
}
function calculateSuggest() {
	output('suggest_result', ['suggest_base'], function (base) {
		return bc.suggest(base);
	});
}

var events = ['keypress', 'keyup', 'focus', 'blur'];
addEvent([
	id('convert_from'),
	id('convert_to'),
	id('convert_number')
	], events, calculateBase);
addEvent([
	id('to_to'),
	id('to_number')
	], events, calculateTo);
addEvent([
	id('from_from'),
	id('from_number')
	], events, calculateFrom);
addEvent([
	id('getName_base')
	], events, calculateGetName);
addEvent([
	id('suggest_base')
	], events, calculateSuggest);

// calculate initial values, if any
calculateBase();
calculateTo();
calculateFrom();
calculateGetName();
calculateSuggest();
