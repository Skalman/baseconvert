<?php
chdir(dirname(dirname(__FILE__)));
include 'includes/config.php';

// prevent caching in as many ways as possible :-)
header('Expires: Sat, 01 Jan 2000 00:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
// Firefox 28 doesn't cache when using the following header:
//   header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

header('Content-Type: text/cache-manifest');

// Returning a 404 makes the appcache obsolete
if (!$cache_manifest) {
	header('HTTP/1.0 404 Not Found');
	die('404 - no cache manifest');
}

?>
CACHE MANIFEST

<?php

$time = date('Y-m-d H:i:s', max(
	filemtime('includes/config.php'),
	filemtime('template.php'),
	filemtime('index.php'),
	filemtime($style_file),
	filemtime($scripts_file),
	filemtime(__FILE__)
));

echo <<<CACHE
# $time

CACHE:
$jquery_url
$scripts_file?$cache_bust_number
favicon.ico
images/binary-digits.png
images/offline.png

images/facebook-like.png
images/google-plusone.png

NETWORK:
*

#FALLBACK:
#./? ./
CACHE;
