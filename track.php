<?php

$actions = array(
	'human' => 'human_access.log',
	'interested' => 'interested_access.log',
	'use' => 'use_access.log',
	'suggest_calc' => 'suggest_calc_access.log',
);

if (!isset($_GET['action']) && !in_array($_GET['action'], $actions)) {
	header('Status: 500');
	die('Needs an action');
}
$file = 'logs/' . $actions[$_GET['action']];

function get_os_browser($ua) {
	$oss = array(
		'#(Ubuntu|Fedora)/(\d+\.\d+)?#' => '$1 $2',
		'#(BSD|Ubuntu|Fedora|Debian|Linux)#' => '$1',

		'#Mac OS X (\d+(\.|_)\d+)#' => 'Mac $1',
		
		'#Windows NT 6\.2#' => 'Win 8 (?)',
		'#Windows NT 6\.1#' => 'Win 7',
		'#Windows NT 6\.0#' => 'Win Vista',
		'#Windows NT 5\.1#' => 'Win XP',
		'#Windows NT 5\.0#' => 'Win 2000',
		'#Windows#' => 'Windows',
	);
	$browsers = array(
		'#Opera (\d+\.\d+)#' => 'Opera $1',
		'#Opera.+?Version/(\d+\.\d+)#' => 'Opera $1',
		'#Opera/(\d+\.\d+)#' => 'Opera $1',

		'#MSIE (\d+\.\d+)#' => 'IE $1',

		'#Firefox/(\d+\.\d+([ab]\d+)?)#' => 'Fx $1',
		'#rv:(\d+\.\d+([ab]\d+)?).+?Gecko/#' => 'Gecko $1',

		'#Chrome/(\d+)#' => 'Chrome $1',

		'#Version/(\d+\.\d+).+?Safari#' => 'Safari $1',
		'#Safari/(\d+)#' => 'Safari $1',
	);
	$os = $browser = 'Unknown';
	$tmp;
	$str_replacer = array(null, '$1', '$2');
	foreach ($oss as $pattern => $replace) {
		if (preg_match($pattern, $ua, $tmp)) {
			$os = str_replace($str_replacer, $tmp, $replace);
			break;
		}
	}
	foreach ($browsers as $pattern => $replace) {
		if (preg_match($pattern, $ua, $tmp)) {
			$browser = str_replace($str_replacer, $tmp, $replace);
			break;
		}
	}
	return "$os/$browser";
}

$ua = isset($_GET['ua']) ? $_GET['ua'] : $_SERVER['HTTP_USER_AGENT'];

if (isset($_POST['screen'], $_POST['event'], $_POST['uri'], $_POST['referrer'])) {
	$fh = fopen($file, 'a');
	fwrite($fh, implode("\t", array(
		date('Y-m-d H:i:s'),
		$_POST['screen'],
		$_POST['event'],
		$_POST['uri'],
		isset($_SERVER['HTTP_DNT']) ? 'DNT' : $_SERVER['REMOTE_ADDR'],
		get_os_browser($ua),
		$ua,
		$_POST['referrer'],
		isset($_POST['state']) ? $_POST['state'] : '',
		isset($_POST['random']) ? $_POST['random'] : '',
	)));
	fwrite($fh, "\n");
	fclose($fh);
} else {
	header('Status: 500');
}

