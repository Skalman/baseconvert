<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

$actions = array(
	'human' => 'human-access.log',
	'interested' => 'interested-access.log',
	'use' => 'use-access.log',
);

$data = file_get_contents('php://input');
$data = json_decode($data, true);

if (!isset($data['action']) && !in_array($data['action'], $actions)) {
	header('Status: 400');
	die('Needs an action');
} elseif (!isset($data['screen'], $data['uri'], $data['referrer'])) {
	header('Status: 400');
	die('Missing data');
}
$file = 'logs/' . $actions[$data['action']];

$fh = fopen($file, 'a');
fwrite($fh, implode("\t", array(
	date('Y-m-d H:i:s'),
	$data['screen'],
	$data['uri'],
	isset($_SERVER['HTTP_DNT']) ? 'DNT' : $_SERVER['REMOTE_ADDR'],
	isset($_GET['ua']) ? $_GET['ua'] : $_SERVER['HTTP_USER_AGENT'],
	$data['referrer'],
	isset($data['state']) ? $data['state'] : '',
	isset($data['random']) ? $data['random'] : '',
)));
fwrite($fh, "\n");
fclose($fh);
