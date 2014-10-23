// For IE.
Array.prototype.find = Array.prototype.find || function(fn, thisArg) {
	var length = this.length;
	var value;

	for (var i = 0; i < length; i++) {
		value = this[i];
		if (fn.call(thisArg, value, i, this)) {
			return value;
		}
	}
};
