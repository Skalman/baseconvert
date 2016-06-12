var app = angular.module('baseconvertApp', []);

app.controller('ConversionController', ['$scope', '$window', '$document', '$http', '$timeout', 'focus', 'scrollIntoView',
function ($scope, $window, $document, $http, $timeout, focus, scrollIntoView) {
	$scope.bases = [
		{
			id: '2',
			name: 'binary',
			explanation: 'base 2',
		},
		{
			id: '8',
			name: 'octal',
			explanation: 'base 8',
		},
		{
			id: '10',
			name: 'decimal',
			explanation: 'base 10',
		},
		{
			id: '16',
			name: 'hexadecimal',
			explanation: 'base 16',
		}
	];

	$scope.originBase = undefined;

	function serialize() {
		return $scope.bases
			.map(function (base) {
				if (base === $scope.originBase)
					return base.id + '=' + base.number;
				else
					return base.id;
			})
			.join('|');
	}

	var trackData;
	function track(action) {
		if (!trackData) {
			var loc = $window.location;
			trackData = {
				screen: $document[0].documentElement.clientWidth + "x" + $document[0].documentElement.clientHeight,
				uri: loc.pathname + loc.search + loc.hash,
				referrer: $document[0].referrer,
				random: Math.floor(Math.random() * 1e9),
				// Action and state set later.
			};
		}
		trackData.action = action;
		trackData.state = serialize();
		$http.post('track', trackData);
	}
	$scope.track = function (action) {
		if (action === 'human') {
			track('human');

			// If the user stays on the page for 10 seconds, they are interested.
			setTimeout(track.bind(null, 'interested'), 10e3);
		} else if (action === 'use') {
			// Wait for 10 seconds to get a more interesting state. The use will
			// probably use it for longer than 10 seconds anyway, if they are
			// interested in the result.
			setTimeout(track.bind(null, 'use'), 10e3);
		}
	};

	$scope.showSuggestions = false;
	$scope.selectedSuggestion = undefined;
	$scope.newBaseName = '';
	$scope.suggestions = [];
	$scope.expanded = undefined;

	$scope.$watch('newBaseName', calculateSuggestions);

	function calculateSuggestions(newValue, oldValue) {
		if (newValue !== undefined && newValue === oldValue) {
			// No actual change.
			return;
		}
		var sug = Base.suggest($scope.newBaseName || '', true);
		var existing = {};
		$scope.bases.forEach(function (base) {
			existing[base.id] = true;
		});
		var all = sug.proposed.concat(sug.good, sug.other)
			.filter(function (suggestion) {
				return !existing[suggestion[0]];
			});
		var suggestions = sug.match.concat(all)
			.map(function (suggestion) {
				// 'octal (base 8)' > name and explanation.
				var match = /^(.+?)( \(([^\)]+)\))?$/.exec(suggestion[1]);
				return {
					id: suggestion[0],
					name: match[1],
					explanation: match[3],
				};
			});

		// Will be undefined, if there are no suggestions.
		$scope.selectedSuggestion = suggestions[0];
		$scope.suggestions = suggestions;
	}

	$scope.addBase = function (base) {
		function isAddedBase(compBase) {
			return base.id === compBase.id;
		}

		// Only add another base if it doesn't already exist.
		var existingBase = $scope.bases.find(isAddedBase);
		if (!existingBase) {
			if ($scope.originBase) {
				base.number = Base($scope.originBase.id, base.id, $scope.originBase.number);
			}
			$scope.bases.push(base);
			$scope.bases.sort(function (a, b) {
				a = a.id;
				b = b.id;
				return a - b || (+a ? -1 : +b ? 1 : a < b ? -1 : a > b ? 1 : 0);
			});
			existingBase = base;
		}

		return $timeout(function () {
			focus(existingBase.id);
			$scope.showSuggestions = false;
			$scope.newBaseName = '';
		});
	};

	$scope.notSuggestionMousedown = function () {
		$scope.newBaseNameBlur();
	};

	$scope.selectSuggestion = function (id) {
		$scope.selectedSuggestion = id;
	};

	var hideSuggestionsTimeout;
	var lastSuggestionMousedown;
	function showSuggestions() {
		$timeout.cancel(hideSuggestionsTimeout);
		$scope.showSuggestions = true;
		scrollIntoView('suggestions');
	}
	$scope.suggestionMousedown = function () {
		lastSuggestionMousedown = +new Date();
		showSuggestions();
	};
	$scope.newBaseNameFocus = function () {
		calculateSuggestions();
		showSuggestions();
	};

	$scope.newBaseNameBlur = function () {
		// Only blur if we didn't just click a suggestion.
		if (lastSuggestionMousedown + 100 > new Date())
			return;

		hideSuggestionsTimeout = $timeout(function () {
			$scope.showSuggestions = false;
		}, 100);
	};

	$scope.newBaseNameKeydown = function (e) {
		var key = e.keyCode;
		if (key === KEY_DOWN || key === KEY_UP) {
			var selectedIndex = 0;

			if ($scope.showSuggestions) {
				selectedIndex = $scope.suggestions.indexOf($scope.selectedSuggestion);

				if (selectedIndex === -1) {
					// If nothing is currently selected, select the first item.
					selectedIndex = 0;
				} else {
					// Move up or down.
					selectedIndex += key === KEY_DOWN
						? 1 : -1;
				}
			}
			if ((selectedIndex === -1 || !$scope.suggestions.length) && $scope.bases.length) {
				// Focus the last base.
				focus($scope.bases[$scope.bases.length - 1].id);
			} else if ($scope.suggestions[selectedIndex]) {
				$scope.selectedSuggestion = $scope.suggestions[selectedIndex];
			}
		} else if ($scope.showSuggestions && (key === KEY_ENTER || (key === KEY_TAB && !e.shiftKey))) {
			if ($scope.suggestions.length) {
				$scope.addBase($scope.selectedSuggestion);				
			} else if (e.shiftKey) {
				focus($scope.bases[$scope.bases.length - 1].id);
			}
		}

		$scope.showSuggestions = key !== KEY_ESC;
	};

	var firstChange = true;
	$scope.numberChange = function (originBase) {
		if (firstChange) {
			$scope.track('use');
			firstChange = false;
		}
		$scope.originBase = originBase;

		originBase.hasError = originBase.number && !Base.valid(originBase.id, originBase.number);

		var notOrigin = $scope.bases.filter(function (base) {
			return base !== originBase;
		});
		var notOriginIds = notOrigin.map(function (base) {
			return base.id;
		});

		// Base(from, to, number)
		Base(originBase.id, notOriginIds, originBase.number)
			.forEach(function (number, index) {
				notOrigin[index].hasError = false;
				notOrigin[index].number = number;
			});
	};

	$scope.numberFocus = function (base) {
		$timeout.cancel(base.blurTimeout);
		base.hasFocus = true;
	};

	$scope.numberBlur = function (base) {
		base.blurTimeout = $timeout(function () {
			base.hasFocus = false;
		}, 100);
	};

	$scope.numberKeydown = function (base, e) {
		var key = e.keyCode;
		if (!base.number && (key === KEY_DEL || key === KEY_BACKSPACE || key === KEY_RIGHT)) {
			focus(base.id + '-delete');
		} else if (key === KEY_DOWN || key === KEY_UP || key === KEY_ENTER) {
			e.preventDefault();
			var i = (
				$scope.bases.indexOf(base) +
				(key === KEY_DOWN || key === KEY_ENTER && !e.shiftKey ? 1 : -1)
			);

			if (i === $scope.bases.length) {
				focus('new');
			} else if (i >= 0) {
				focus($scope.bases[i].id);
			}
		}
	};

	$scope.numberExpandedKeydown = function (base, e) {
		if (e.keyCode === KEY_ESC) {
			$scope.expanded = undefined;
			focus(base.id);
		}
	}

	$scope.baseDeleteKeydown = function (base, e) {
		if (e.keyCode === KEY_DEL || e.keyCode === KEY_BACKSPACE) {
			e.preventDefault();
			$scope.baseDelete(base);
		} else if (e.keyCode === KEY_ESC || e.keyCode === KEY_LEFT) {
			focus(base.id);
		}
	};

	$scope.baseMouseenter = function (base) {
		base.lastMouseenter = +new Date();
	};

	$scope.baseDeleteClick = function (base) {
		// If the delete button just showed up, the click was probably by mistake.
		if (base.lastMouseenter + 300 > new Date())
			return;

		$scope.baseDelete(base);
	};

	$scope.baseDelete = function (base) {
		var i = $scope.bases.indexOf(base);
		$scope.bases.splice(i, 1);
		if ($scope.bases[i])
			focus($scope.bases[i].id);
		else
			focus('new');
	};

	$scope.baseExpand = function (base) {
		if ($scope.expanded === base) {
			$scope.expanded = undefined;
		} else {
			$scope.expanded = base;
		}
	};


	$scope.examples = CALCULATION_EXAMPLES_DEFAULT;

	var lastExampleTimeout;
	$scope.runExample = function (example, enterAllAtOnce) {
		// Cancel any currently running example.
		$timeout.cancel(lastExampleTimeout);

		example.running = true;
		function timeout(ms) {
			lastExampleTimeout = $timeout(angular.noop, ms);
			return lastExampleTimeout;
		}
		var base = $scope.bases.find(function (base) {
			return base.id === example.baseId;
		});

		// Animation.
		var promise = timeout();
		if (!base) {
			promise = promise.then(function () {
				focus('new');
				$scope.curExample = 'new';
				return timeout(800);
			}).then(function () {
				// Enter a character at a time.
				$scope.newBaseName = '';
				return example.baseId.split('').reduce(function (promise, char) {
					return promise.then(function () {
						$scope.newBaseName += char;
						return timeout(400 / example.baseId.length);
					});
				}, timeout());
			}).then(function () {
				return timeout(1000);
			}).then(function () {
				base = $scope.suggestions[0];
				return $scope.addBase(base);
			}).then(function () {
				return timeout(300);
			});
		}

		promise.then(function () {
			focus(base.id);
			$scope.curExample = base;
			return timeout(800);
		}).then(function () {
			base.number = '';
			if (enterAllAtOnce) {
				// Enter the whole number.
				$scope.numberChange(base);
				return timeout(100).then(function () {
					base.number = example.number;
					$scope.numberChange(base);
				});
			} else {
				// Enter a digit at a time.
				return example.number.split('').reduce(function (promise, char) {
					return promise.then(function () {
						base.number += char;
						$scope.numberChange(base);
						return timeout(800 / example.number.length);
					});
				}, timeout());
			}
		}).then(function () {
			return timeout(3000);
		}).then(function () {
			// Set a new example.
			var newExample = CALCULATION_EXAMPLES[Math.floor(Math.random() * CALCULATION_EXAMPLES.length)];
			example.name = newExample.name;
			example.number = newExample.number;
			example.numberDisplay = newExample.numberDisplay;
			example.baseId = newExample.baseId;			
		}).finally(function () {
			// Reset the state.
			example.running = false;
			$scope.curExample = undefined;
			lastExampleTimeout = undefined;
		});
	};

	$scope.curExample = undefined;

}]);
