<?php

if ($track && file_exists('/home/thisisus/public_html/baseconvert.com/owa/owa_php.php')) {	
	require_once '/home/thisisus/public_html/baseconvert.com/owa/owa_php.php';
		
	$owa = new owa_php();
	// Set the site id you want to track
	$owa->setSiteId('f075cec99c53ef594942fad00c9d5a87');
	// Uncomment the next line to set your page title
	$owa->setPageTitle($title);
	// Set other page properties
	//$owa->setProperty('foo', 'bar');
	$owa->trackPageView();
}


