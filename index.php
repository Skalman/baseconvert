<?php
include 'includes/webstart.php';

$title = 'Base Convert: the simple floating point base calculator';
$description = 'Online base converter. Convert from any base, to any base (binary, hexadecimal, even roman numerals!)';
$heading = 'Base Convert';


// base conversion
$base_names = array(
	2 => 'Binary',
	8 => 'Octal',
	10 => 'Decimal',
	16 => 'Hexadecimal',
);
if (!isset($_POST['base'])) {
	$calculate = false;
	$bases = array(2, 8, 10, 16, 36);
} else {
	$calculate = true;
	$from_base = $_POST['base'][ $_POST['from'] ];
	$from_number = $_POST['number'][ $_POST['from'] ];
	$bases = array();
	foreach ($_POST['base'] as $key => $base) {
		if ($base != '') {
			$bases[] = $base;
		}
	}
}

$examples = array(
	'fractions' => array(10, '3.14'),
	'fractional binary' => array(2, '1100.01101'),
	'hexadecimal' => array(16, '8BA53'),
	'any base' => array(85, '45:1.76:15'),
);
$notice = null;

if (false && isset($_SERVER['HTTP_REFERER']) || isset($_GET['suggest_calc'])) {
	if (isset($_GET['suggest_calc'])) {
		$need_help = true;
	} else {
		$ref = $_SERVER['HTTP_REFERER'];
		#$ref = 'http://www.google.co.uk/url?sa=t&amp;rct=j&q=FLOATING+POINT+CALCULATOR&source=web&cd=9&ved=0CGgQFjAI&url=http%3A%2F%2Fbaseconvert.com%2F&ei=Qm41T8jUEoTt8QP2qvjLDA&usg=AFQjCNHIDVtEZAxuTq-KmK1aH6jxv_ukog';
		$ref_domain = parse_url($ref, PHP_URL_HOST);
		$ref = str_replace('baseconvert.com', '', strtolower($ref));

		$need_help =
			// not from baseconvert.com
			strpos($ref_domain, 'baseconvert.com') === false

			// only if there's a query string
			&& strpos($ref, '?') !== false
			
			// didn't search for 'base', 'convert' or related words
			&& strpos($ref, 'base') === false
			&& strpos($ref, 'convert') === false
			&& strpos($ref, 'binary') === false
			&& strpos($ref, 'hexadecimal') === false
			&& strpos($ref, 'decimal') === false
			&& strpos($ref, 'octal') === false
			
			// but did search for 'floating point calculator'
			&& strpos($ref, 'floating') !== false
			&& strpos($ref, 'point') !== false
			&& strpos($ref, 'calculator') !== false;
	}
	
	if ($need_help) {
		$html_class = 'suggest_calc';
		$notice = <<<NOTICE
			<p class="notice">
				Did you just want a normal calculator? Check <a href="floating-point-calculator">this one</a> out.
				<a href="./" title="Dismiss" class="close" onclick="this.parentNode.style.display='none'; document.getElementsByTagName('html')[0].className=''; return false;">✕</a>
			</p>
NOTICE;
		$_GET['action'] = 'suggest_calc';
		$_POST['screen'] = '';
		$_POST['event'] = '';
		$_POST['uri'] = $_SERVER['REQUEST_URI'];
		$_POST['referrer'] = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
		include 'track.php';
	}

}

?>
<form action="<?php echo htmlspecialchars($_SERVER['REQUEST_URI']) ?>" method="post">
	<?=$notice?>
	<div id="convert">
<?php
	$number = '';
	$i = 0;
	foreach ($bases as $base) :
		if ($calculate) {
			$number = strtoupper(base_convert($from_number, $from_base, $base));
		}
		if ($base == 10) {
			$class = ' hilite';
		} else {
			$class = '';
		}
		$name = (isset($base_names[$base]) ? "{$base_names[$base]} <small>(base $base)</small>" : "Base $base");
?>
	<div class="row<?= $class ?>" id="row_<?= $i ?>">
		<div class="base">
			<input type="hidden" name="base[<?= $i ?>]" id="base_<?= $i ?>" value="<?= $base ?>">
			<label class="label" for="number_<?= $i ?>">
				<strong class="name"><?= "$name" ?></strong>
			</label>
		</div>
		<div class="number">
			<div class="label">
				<input name="number[<?= $i ?>]" id="number_<?= $i ?>"<?= $number === '' ? '' : " value=\"$number\"" ?> tabindex="1">
			</div>
		</div>
		<noscript>
			<button type="submit" name="from" value="<?= $i ?>" tabindex="1">Convert</button>
		</noscript>
	</div>
<?php
		$i++;
	endforeach;
?>
	<div class="row new" id="row_<?= $i ?>">
		<div class="base">
			<label class="label">
				<input name="base[<?= $i ?>]" id="base_<?= $i ?>" tabindex="1" title="Enter a new base here">
				<strong class="name">
					Enter a new base here
				</strong>
			</label>
		</div>
		<div class="number">
			<div class="label">
				<input name="number[<?= $i ?>]" id="number_<?= $i ?>" tabindex="1">
			</div>
		</div>
		<noscript>
			<button type="submit" name="from" value="<?= $i ?>" tabindex="1">Convert</button>
		</noscript>
	</div>
</div>

<aside id="examples">
	<p>Calculation examples:</p>
	<ul>
<?php
	foreach ($examples as $name => $example) {
		list($b, $n) = $example;
		echo "<li><a data-base=\"$b\" data-number=\"$n\" title=\"$n in base $b\" tabindex=\"1\"><strong>$name</strong>: <span>$n</span></a></li>\n";
		// TODO - support non-JS too
	}
?>
	</ul>
</aside>
</form>
