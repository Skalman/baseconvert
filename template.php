<?php
	$page_id = basename($_SERVER['SCRIPT_NAME'], '.php');
?>
<!DOCTYPE html>
<html lang="en-US"<?php
		if ($cache_manifest) echo ' manifest="main.appcache"';
		if (isset($html_class)) echo " class=\"$html_class\"";
?>>
<head>
<meta charset="utf-8">
<title><?php echo $local ? 'BC:'.substr($title, 0, 3) : $title ?></title>
<meta name="description" content="<?php echo $description ?>">
<link rel="shortcut icon" href="favicon.ico">
<?php // If the following is set just before </body>, Chrome 28 first renders without it ?>
<script>document.documentElement.className = 'js'</script>
<style><?php
	if ($compressed_styles) {
		readfile($style_file);
	} else {
		foreach ($styles as $file) {
			readfile($file);
		}
	}
?></style>
</head>
<body>
<?php
if (strpos(@$_SERVER['USER_AGENT'], 'MSIE')): ?>
<!--[if lt IE 8]>
<div class="warning">
	<p><strong>Warning:</strong> You are using a very old web browser with several known security issues. This website looks and works better with modern browsers.</p>
	<p>If you can't update your computer, try another browser like <a href="https://mozilla.org/firefox">Firefox</a>.</p>
</div>
<![endif]-->
<?php
endif;
?>

<div id="container">
	<div id="header">
		<h1><?=$heading?></h1>
	</div>
	<?php if (0 && $dev) : ?>
	<div id="nav">
		<h5>Navigation</h5>
		<menu>
		<?php
			$items = array(
				'index' => array(
					'url' => './',
					'text' => 'Base Convert',
					'title' => 'Convert between bases',
				),
/*						'binary' => array(
					'url' => 'binary',
					'text' => 'Binary',
				),
*/
				'floating-point-calculator' => array(
					'url' => 'floating-point-calculator',
					'text' => 'Calculator',
					'title' => 'Floating point calculator'
				),
			);
			foreach ($items as $key => $item) {
				echo "<li" . ($page_id==$key?' class="current"':'') . " id=\"nav-$key\"><a href=\"$item[url]\">$item[text]</a></li>";
			}
		?>
		</menu>
	</div>
	<?php endif; ?>
	<div id="content">
		<?php echo $content ?>
	</div>
</div>

<footer>
	<ul>
		<li>Base Convert by <a href="http://danwolff.se/" title="Website of Dan Wolff">Dan Wolff</a> <small>(<?=date('Y') == '2011' ? '2011' : '2011–'.date('Y')?>)</small></li>
		<li>If you enjoy this site, <span id="share-text" title="Tell a friend or write about it">spread the word</span></li>
		<li>I'd love to hear your feedback: <span id="email">dan<span><noscript>@</noscript>dan</span>w<!-- asdf@asdf.com -->olff.<span>se</span></span></li>
	</ul>
</footer>

<script>
var page_id = '<?=$page_id?>';
// load scripts, fix email
var $ = (function (queue, d, email) {
	d.getElementById('email').innerHTML = '<a href="mailto:'+email+'">'+email+'</a>';

	<?=
		$compressed_scripts ? '' : '// '
	?>load('<?="$scripts_file?$cache_bust_number"?>');
	load('<?=$jquery_url?>', function () {
		for (var i = 0; i < queue.length; i++) {
			queue[i]();
		}
		queue = 0;
	});
	function load(src, cb) {
		var s = d.createElement('script');
		s.async = true;
		s.src = src;
		s.onload = cb;
		d.head.insertBefore(s, d.head.firstChild);
	}

	return function (fn) {
		queue.push(fn);
	};
}([], document, 'dan-danwolff.se'.replace('-', '@')));
<?php
	if (!$compressed_scripts) {
		foreach ($scripts as $file) {
			readfile($file);
		}
	}
?>
</script>
<?php
	if ($dev) {
		include 'includes/dev.php';
	}
?>
</body></html>
