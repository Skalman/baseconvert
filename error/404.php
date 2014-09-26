<?php
	header('Status: 404 Not Found');
	$main_page = substr(dirname(dirname(__FILE__)), strlen($_SERVER['DOCUMENT_ROOT'])) . '/';
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>404: Page not found</title>
	</head>
	<body>
		<h1>Oops, we can't find the page you're looking for</h1>
		
		<p>You're welcome to email us at <i>in<span>fo@b</span>as<!-- asdf@asdf.com -->econvert.com</i> to tell us about the problem.</p>
		
		<p>In the mean time, perhaps you could try the most awesome <a href="<?php echo $main_page ?>">base converter</a> for now?</p>
	</body>
</html>
<!--
	we need 512 bytes
	we need 512 bytes
	we need 512 bytes
	we need 512 bytes
-->
<?php
	include '../includes/log_error.php';
	log_error(404);
?>
