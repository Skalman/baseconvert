<?php
/*
More:
Some sites may require the user-agent to be something like a browser. It's possible to add something like:
curl_setopt( $ch, CURLOPT_USERAGENT, 'Mozilla/4.0 ( compatible; MSIE 7.0; Windows NT 6.0 )' );
*/

/**
 * Perform an HTTP GET to a URL.
 * @return The returned data on success, false on failure
 */
function curl_get( $url, &$error = null, &$http_code = null ) {
	$ch = curl_init();
	curl_setopt( $ch, CURLOPT_URL, $url);
	curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 2 ); # must connect within 2 seconds
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
	curl_setopt( $ch, CURLOPT_MAXREDIRS, 3); # maximum 3 HTTP redirects allowed
	curl_setopt( $ch, CURLOPT_LOW_SPEED_LIMIT, 100 ); # less than 100 byte/sec = nothing's happening
	curl_setopt( $ch, CURLOPT_LOW_SPEED_TIME, 10 ); # can't be more than 10 sec pause in the transmission överföringen
	
	$content = curl_exec( $ch ); # returns content on success, false on failure
	if ( func_num_args() > 1 ) {
		$error = curl_errno( $ch ) ? curl_error( $ch ) : false;
		$http_code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	}
	@curl_close( $ch );
	return $content;
}

/**
 * Perform an HTTP POST to a URL.
 * @return The returned data on success, false on failure
 */
function curl_post( $url, $data, &$error = null, &$http_code = null ) {
	$ch = curl_init();
	curl_setopt( $ch, CURLOPT_URL, $url);
	curl_setopt( $ch, CURLOPT_POST, true );
	curl_setopt( $ch, CURLOPT_POSTFIELDS, $data);
	curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 2 ); # must connect within 2 seconds
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
	curl_setopt( $ch, CURLOPT_MAXREDIRS, 3); # maximum 3 HTTP redirects allowed
	curl_setopt( $ch, CURLOPT_LOW_SPEED_LIMIT, 100 ); # less than 100 byte/sec = nothing's happening
	curl_setopt( $ch, CURLOPT_LOW_SPEED_TIME, 10 ); # can't be more than 10 sec pause in the transmission överföringen
	
	$content = curl_exec( $ch ); # returns content on success, false on failure
	if ( func_num_args() > 1 ) {
		$error = curl_errno( $ch ) ? curl_error( $ch ) : false;
		$http_code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	}
	@curl_close( $ch );
	return $content;
}

