<?php
if (isset($_GET['notrack'])) {
	setcookie('notrack', '1', time()+60*60*24*365*2);
} else {
	setcookie('notrack', false, time()-60*60*24*365*2);
}
header('Location: ./');
exit;
