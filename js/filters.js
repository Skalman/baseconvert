app
.filter('ucFirst', [function() {
	return function (input) {
		if (input && angular.isString(input))
			return input[0].toUpperCase() + input.substr(1);
		else
			return input;
	};
}])

.filter('nospace', function () {
	return function (input) {
		return input.replace(/ /g, '');
	};
});
