<?php

function log_error($status, $uri = null, $referrer = null) {
	if ($uri === null) {
		$uri = $_SERVER['REQUEST_URI'];
	}
	if ($referrer === null) {
		if (isset($_SERVER['HTTP_REFERER'])) {
			$referrer = $_SERVER['HTTP_REFERER'];
		} else {
			$referrer = '';
		}
	}
	$time = date('Y-m-d H:i:s');
	$fh = fopen(dirname(dirname(__FILE__)) . '/error/error_log', 'a');
	fwrite($fh, "$time	$status	$uri	$referrer\n");
	fclose($fh);
}


