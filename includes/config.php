<?php

$local = in_array($_SERVER['HTTP_HOST'], array('127.0.0.1', 'n', 'dev.local.baseconvert.com'));
// $no_minify = true;
$cache_manifest = true;

// Firefox version 25 and below ask the user if they want to enable appcache.
// That's annoying, so don't use appcache there.
$firefox_version;
if (preg_match('#Firefox/(\d+)#', @$_SERVER['HTTP_USER_AGENT'], $firefox_version) && $firefox_version[1] < 26) {
	$cache_manifest = false;
}

$cache_bust_number = '5';

$styles = array(
	// 'style/reset.css',
	'style/normalize.css',
	// 'style/fonts.css',
	'style/layout.css',
	'style/generic.css',
	'style/convert.css',
	'style/examples.css',
#	'style/algorithm.css',

#	'style/javascript.css',

	'style/offline.css',
#	'style/minify.css',
);
$style_file = 'style.css';
$scripts = array(
	'scripts/lib/delay.js',

	'scripts/base/src/core.js',
	(is_file('scripts/base/src/number.js') ? 'scripts/base/src/number.js' : false),
	'scripts/base/src/standard.js',
	'scripts/base/src/roman.js',
	'scripts/base/src/leet.js',

	'scripts/model.js',
	'scripts/ui.js',
	'scripts/ui_listener.js',

	'scripts/examples.js',

	'scripts/track.js',
	'scripts/offline.js',
	'scripts/share.js',
);
$scripts_file = 'scripts.js';

if (!$local) {
	$compressed_styles = $compressed_scripts = true;
} else {
	include_once 'includes/minify.php';
	$compressed_styles = !minify_needed($style_file, $styles);
	$compressed_scripts = !minify_needed($scripts_file, $scripts);
	if (isset($no_minify) && $no_minify) {
		$compressed_styles = $compressed_scripts = false;
	}
}


#var_dump($compressed_styles, $compressed_scripts);

if (isset($_GET['track']) || isset($_GET['notrack'])) {
	include 'includes/notrack.php';
}
$dev_uri = $local || $_SERVER['SERVER_NAME'] == 'dev.baseconvert.com' || strpos($_SERVER['REQUEST_URI'], '/dev') !== false;
$track = !isset($_COOKIE['notrack']) && !$dev_uri;
$dev = !$track || $dev_uri;

if ($dev && isset($_GET['dev'])) {
	include 'includes/dev.php';
	exit;
}



$jquery_url = ($local && !isset($_GET['jquery'])) ? 'scripts/jquery.min.js' : 'http://code.jquery.com/jquery-' . (isset($_GET['jquery'])?$_GET['jquery']:'1.11.1') . '.min.js';
// $jquery_url = 'scripts/jquery-1.10.2.min.js';


// share
if (isset($_COOKIE['share']) && $_COOKIE['share'] == '0') {
	$share = false;
} else {
	function share_links() {
		$tmp = strpos($_SERVER['REQUEST_URI'], '?');
		if ($tmp) {
			$url = 'http://' . $_SERVER['SERVER_NAME'] . substr($_SERVER['REQUEST_URI'], 0, $tmp);
		} else {
			$url = 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
		}
		$url_url = urlencode($url);
		$share = array(
			'f' => array(
				'url' => "http://www.facebook.com/share.php?u=$url_url",
				'title' => 'Share on Facebook',
				'text' => 'Facebook',
			),
			't' => array(
				'url' => "http://twitter.com/share?url=$url_url",
				'title' => 'Share on Twitter',
				'text' => 'Twitter',
			),
			'e' => array(
				'url' => "mailto:<yourfriend>?subject=" .
					urlencode('Base Convert is awesome') .
					"&body=" . urlencode("Hi <friend's name>,\n\nCheck out Base Convert at $url, it's an online floating point base converter.\n\nTake care,\n<your name>"),
				'title' => 'Email a friend',
				'text' => 'Email',
			),
		);
		if (isset($_COOKIE['share'])) {
			$tmp = explode(',', $_COOKIE['share']);
			foreach ($tmp as $tmp) {
				unset($share[$tmp]);
			}
		}
		return $share;
	}
	$share = share_links();
}

date_default_timezone_set('UTC');
