$(function () {
	// jQuery.delay([queue_name], fn)
	var
		queues = {};
	function run_queue(queue_name) {
		var queue = queues[queue_name], i, e,
			funcs = queue.funcs;
		if (!queue.running) {
			queue.running = true;
			for (i = 0; i < funcs.length; i++) {
				if (typeof funcs[i] == "number") {
					// set a timeout and remove the first few elements
					queue.funcs = funcs.slice(i+1);
					queue.timeout = setTimeout(function () {
						queue.running = false;
						run_queue(queue_name);
					}, funcs[i]);
					return;
				} else {
					// run the function
					try {
						funcs[i]();
					} catch (e) {
						// rethrow the exception, but clean up first
						queue.funcs = [];
						queue.running = false;
						throw e;
					}
				}
			}
			// if we managed to run all the functions, remove all functions
			queue.funcs = [];
			queue.running = false;
		}
	}
	var delay = $.delay = function delay(queue_name, fn) {
		if (arguments.length == 1) {
			// $.delay(fn)
			fn = queue_name;
			queue_name = " ";
		}
		var queue = queues[queue_name];
		if (!queue) {
			queue = queues[queue_name] = {running:false, funcs:[], timeout:false};
		}
		if ($.isArray(fn)) {
			Array.prototype.push.apply(queue.funcs, fn);
		} else {
			queue.funcs.push(fn);
		}
		run_queue(queue_name);
		return this;
	};
	delay.clear = function delay_clear(queue_name) {
		if (queue_name == null) {
			queue_name = " ";
		}
		var q = queues[queue_name];
		if (q) {
			clearTimeout(q.timeout);
			q.funcs = [];
			q.running = false;
		}
	};
});
