(function (Base) {
	Base.extend({
		name: "leet",
		valid_base: function leet_valid_base(base) {
			return base == "10" || base == "100";
		},
		valid_from: function leet_valid_from(base, number) {
			// override base 10
			return number.toLowerCase() === (base == "10" ? "leet" : base == "100" ? "le:et" : false);
		},
		valid_to: function leet_valid_to(base, number) {
			// override base 10
			return (base == "10" || base == "100") && number.equals(1337);
		},
		fractional: false,
		
		// normally takes parameters base and number (it'll always be 10/100 and "leet"/"le:et" respectively)
		to_internal: function leet_to_internal(from_base, number) {
			return Base.Number(1337);
		},
		// normally takes parameters base and number (it'll always be 10/100 and 1337 respectively)
		from_internal: function leet_from_internal(to_base, number) {
			return to_base == "10" ? "leet" : "le:et";
		},
		options: {
		}
	});
})(Base);
