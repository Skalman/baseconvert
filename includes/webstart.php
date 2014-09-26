<?php

if (!isset($beenHere)) {
	$beenHere = true;
	$request_time = microtime(true);
	

	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	
	include 'includes/config.php';
	if (!$dev) {
		ini_set('display_errors', 0);
	}
	
	
	ini_set('zlib.output_compression', 4096);
	header('Content-Type: text/html; charset=utf-8');
	header_remove('X-Powered-By');
	// header('Expires: ' . gmdate('D, d M Y H:i:s', time()+60*60*24*30) . ' GMT');
	ob_start();
	
	include $_SERVER['SCRIPT_FILENAME'];
	
	$content = ob_get_clean();
	// file_put_contents('/tmp/sth.gz', $content);

	include 'includes/track.php';

	include 'template.php';
	if ($local) {
		echo '<div style="position:fixed; right:0; bottom:0; padding:0.3em;">' . round((microtime(true) - $request_time)*1000, 2) . ' ms</div>';
	} else {
		echo '<!--' . round((microtime(true) - $request_time)*1000, 2) . ' ms -->';
	}
	if (!$compressed_styles) {
		echo "\n<!-- styles not compressed -->";
	}
	if (!$compressed_scripts) {
		echo "\n<!-- scripts not compressed -->";
	}
	exit;
}


