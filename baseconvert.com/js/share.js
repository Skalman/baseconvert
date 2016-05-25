app
.controller('ShareController', ['$scope', '$timeout',
function ($scope, $timeout) {
	$scope.forceShow = false;

	var forceShowTimeout;
	$scope.mouseenter = function () {
		$timeout.cancel(forceShowTimeout);
		$scope.forceShow = true;
	};
	$scope.mouseleave = function (wait) {
		if (wait == null)
			wait = 500;
		$timeout.cancel(forceShowTimeout);
		forceShowTimeout = $timeout(function () {
			$scope.forceShow = false;
		}, wait);
	};
}])

.directive('share', ['$document', function ($document) {
	function addScript(url) {
		var script = Array.prototype.slice.call($document[0].getElementsByTagName('script'))
			.find(function (script) {
				return script.src === url;
			});
		if (!script) {
			angular.element(document.head).append(
				angular.element('<script>').attr('src', url)
			);
		}
	}

	return function (scope, elem, attrs) {
		var url;
		var service = attrs.share;
		if (service === 'g-plusone') {
			url = 'https://apis.google.com/js/plusone.js';
		} else if (service === 'fb-like') {
			url = 'https://connect.facebook.net/en_US/all.js#xfbml=1';
		} else {
			throw new Error("Unknown sharing service '" + service + "'");
		}

		function enable() {
			addScript(url);
			if (service === 'g-plusone' && (attrs.shareMouseenter || attrs.shareMouseleave)) {
				function plusoneMouseEnterLeave(e) {
					var elem = angular.element(e.target);
					while (elem.length) {
						if (elem.hasClass('gc-bubbleDefault') || elem.hasClass('pls-container')) {
							// It's a match: The target or an ancestor is a G+ bubble.
							if (e.type === 'mouseover')
								scope.$apply(attrs.shareMouseenter);
							else
								scope.$apply(attrs.shareMouseleave);
							return;
						}
						elem = elem.parent();
					}
				}
				angular.element(document.body).on('mouseover mouseout', plusoneMouseEnterLeave);
				elem.on('$destroy', function () {
					angular.element(document.body).off('mouseover mouseout', plusoneMouseEnterLeave);
				});
			}
		}

		if ('shareEnableOnClick' in attrs) {
			elem
				.addClass('disabled')
				.one('click', function enableShare() {
					elem.removeClass('disabled');
					enable();
				});
		} else {
			enable();
		}
	};
}]);
