<?php

include_once 'includes/curl_simple.php';
function minify_needed($output_file, $files) {
	$out = filemtime($output_file);
	$files[] = 'includes/config.php';
	foreach ($files as $file) {
		if (filemtime($file) > $out) {
			return true;
		}
	}
	return false;
}
function minify($language, $output_file, $files, $url, $post_data, $prepend_files = array()) {
	$error;
	$http_code;
	$prepend_text = array();
	foreach ($prepend_files as $file) {
		$prepend_text[] = trim(file_get_contents($file));
	}
	if ($prepend_text) {
		$prepend_text = implode("\n\n", $prepend_text);
		$prepend_text = str_replace("\n", "\n * ", $prepend_text);
		$prepend_text = "/*\n * $prepend_text\n */\n";
	} else {
		$prepend_text = '';
	}
	$code = '';
	foreach ($files as $file) {
		if ($file) {
			$code .= file_get_contents($file);
		}
	}
	foreach ($post_data as $k => $v) {
		if ($v == '$code') {
			$v = $code;
		}
		$post_data[$k] = urlencode($k) . '=' . urlencode($v);
	}
	$post_data = implode('&', $post_data);

	$result = trim(curl_post($url, $post_data, $error, $http_code));
#	$result = curl_post('http://127.0.0.1/BASE_CONVERT/postTest.php', $data, $error, $http_code);
	if (strpos($result, 'console') !== false) {
		$result = "Includes 'console'";
		$error = true;
	}
	if ($result && !$error && $http_code == 200 && strpos($result, 'Error') !== 0) {
		file_put_contents($output_file, $prepend_text . $result);
		echo "Minified <b>$language</b> (" . round((1 - strlen($result) / strlen($code))*100, 2) . " % saved)\n";
	} else {
		echo "<b>Couldn't minify the $language" . ($http_code ? " ($http_code)" : '') . "</b>\n";
		if ($result) {
			echo "Result: <b>$result</b>\n";
		}
		#print_r($data);
	}
}


