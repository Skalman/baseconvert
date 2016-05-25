// Based on http://stackoverflow.com/a/18295416
app
.directive('focusOn', function() {
	return function (scope, elem, attr) {
		var off = scope.$on('focusOn', function (e, name) {
			if (name === attr.focusOn) {
				elem[0].focus();
			}
		});
		elem.on('$destroy', off);
	};
})
.service('focus', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
	return function (name) {
		$timeout(function () {
			$rootScope.$broadcast('focusOn', name);
		});
	};
}])


// Applies once, if it is detected that the user is human.
.directive('isHuman', ['$document', function ($document) {
	return function (scope, elem, attr) {
		function apply(e) {
			scope.$apply(attr.isHuman);
		}
		$document.one('mousemove scroll click keydown', apply);
		elem.on('$destroy', function () {
			$document.off('mousemove scroll click keydown', apply);
		});
	};
}])


// Scrolls the viewport vertically so that an element will be completely visible.
.directive('scrollIntoViewOn', function() {
	var elemsToScroll = {};

	return function (scope, elem, attr) {
		var off = scope.$on('scrollIntoViewOn', function (e, name) {
			var opts = (attr.scrollIntoViewOn || '').split(/\s*,\s*/);
			if (name === opts[0]) {
				// Set options.
				var prio = 0;
				var margin = 10;
				for (var i = 1; i < opts.length; i++) {
					if (/^prio\s*=/.test(opts[i]))
						prio = +opts[i].replace(/^prio\s*=/, '') || 0;
					else if (/^margin\s*=/.test(opts[i]))
						margin = +opts[i].replace(/^margin\s*=/, '') || 0;
				}

				// Get offset.
				var docElem = document.documentElement;
				var box = elem[0].getBoundingClientRect();
				var scrollTop = window.pageYOffset || docElem.scrollTop;

				var set = {
					top: scrollTop + box.top - margin,
					bottom: scrollTop + box.bottom + margin,
					prio: prio,
				};
				if (!elemsToScroll[name]) {
					elemsToScroll[name] = [set];
					// Let all prios add first
					setTimeout(function () {
						// var scrollTop1 = top - margin; // Align top.
						// var scrollTop2 = top + height + margin - viewportHeight; // Align bottom.

						var viewportHeight = document.documentElement.clientHeight;
						var sets = elemsToScroll[name];
						elemsToScroll[name] = null;
						sets.sort(function (a, b) {
							return b.prio - a.prio;
						});

						var newTop, newBottom;
						var top = sets[0].top;
						var bottom = top; // Cannot force a lower bottom without checking.
						for (var i = 0; i < sets.length; i++) {
							newTop = Math.min(top, sets[i].top);
							newBottom = Math.max(bottom, sets[i].bottom);

							if (newBottom - newTop < viewportHeight) {
								// We can show everything.
								top = newTop;
								bottom = newBottom;
							} else if (bottom - newTop < viewportHeight) {
								// We can show the new top, but not the new bottom.
								top = newTop;
								bottom = top + viewportHeight;
								break;
							} else {
								// We can't show the new top, but scroll as high up as possible.
								top = bottom - viewportHeight;
								break;
							}
						}
						// At least scroll this far to still show the bottom.
						var scrollMin = bottom - viewportHeight;
						// At most scroll this far to still show the top;
						var scrollMax = top;

						if (scrollTop < scrollMin) {
							// Scrolled too little, scroll down.
							docElem.scrollTop = scrollMin;
						} else if (scrollMax < scrollTop) {
							// Scrolled too far, scroll up.
							docElem.scrollTop = scrollMax;
						} else {
							// It's fine. Don't scroll.
						}
					}, 0);
				} else {
					elemsToScroll[name].push(set);
				}
			}
		});
		elem.on('$destroy', off);
	};
})
.service('scrollIntoView', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
	return function (name) {
		$timeout(function () {
			$rootScope.$broadcast('scrollIntoViewOn', name);
		});
	};
}])


// Based on http://stackoverflow.com/a/20212285
.directive('mousedownElsewhere', ['$document', function ($document) {
	return function (scope, elem, attr) {
		function onMousedown(event) {
			// If the target is neither the element nor a descendant, apply.
			if (!elem[0].contains(event.target)) {
				scope.$apply(attr.mousedownElsewhere);
			}
		}
		var unwatch = scope.$watch(
			function () { return attr.isMousedownElsewhereActive },
			function (newValue, oldValue) {
				if (newValue !== oldValue) {
					if (newValue === 'true')
						$document.on('mousedown', onMousedown);
					else if (newValue === 'false')
						$document.off('mousedown', onMousedown);
				}
			}
		);
		elem.on('$destroy', function () {
			$document.off('mousedown', onMousedown);
			unwatch();
		});
	};
}])


.directive('hasJs', function () {
	return function (scope, elem, attr) {
		elem.removeClass('no-js').addClass('js');
	};
});
