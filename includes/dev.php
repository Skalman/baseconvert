<?php
	if (isset($_GET['dev'])) {
		echo <<<START
<!DOCTYPE html><meta charset="utf-8"><title>Dev</title><style>
	html, body {
		padding:0;
		margin:0;
		color:#333;
		line-height:1;
		font-family:Arial, sans-serif;
		font-size:120%;
	}
	body {
		padding:1em;
		white-space:pre;
		font-size:0.7em;
	}
</style>
START;
		if (!$track) {
			echo "Not tracking\n";
		}

		// minify
		if ($dev) {
			if ($cache_manifest) {
				echo "Using <b>cache manifest</b>\n";
			} else {
				echo "Not using cache manifest\n";
			}
			if (!$compressed_styles && !$compressed_scripts) {
				echo "Not compressed\n";
			} elseif (!$compressed_styles) {
				echo "Styles not compressed\n";
			} elseif (!$compressed_scripts) {
				echo "Scripts not compressed\n";
			} else {
				echo "Compressed\n";
			}
		}
		if ($local && (!isset($no_minify) || !$no_minify)) {
			// minify
			include_once 'includes/minify.php';
			if (!$compressed_styles) {
				ob_flush();
				flush();
				// CSS
				minify(
					'CSS',
					$style_file,
					$styles,
					'http://refresh-sf.com/yui/',
					array(
						'compresstext' => '$code',
						'type' => 'CSS',
						'redirect' => '1',
					)
				);
			}
			
			if (!$compressed_scripts) {
				ob_flush();
				flush();
				// JavaScript
				minify(
					'JS',
					$scripts_file,
					$scripts,
					'http://closure-compiler.appspot.com/compile',
					array(
						'js_code' => '$code',
						'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
						'output_format' => 'text',
						'output_info' => 'compiled_code',
					)
				);
			}
		}
		exit;
	}
?>
<iframe src="./?dev" tabindex="-1" style="
		position:fixed;
		top:0;
		left:0;
		-moz-box-shadow:0 0 1em #666;
		-webkit-box-shadow:0 0 1em #666;
		box-shadow:0 0 1em #666;
		background:rgba(255,255,255,0.5);
		font-size:0.7em;
		height:12em;
		overflow:auto;
		white-space:pre;
		width:24em;
		border:none;"></iframe>
