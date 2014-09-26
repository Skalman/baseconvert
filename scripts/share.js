$(function () {
	var html = [
		'<div id="share-links" hidden><div>',
			'<ul>',
				'<li>',
					// Google
					'<div class="social-button g-plusone disabled" data-size="medium" data-href="http://baseconvert.com/"></div>',
				'</li>',
				'<li>',
					// Facebook
					'<div class="social-button fb-like disabled" data-href="http://baseconvert.com/" data-width="90" data-layout="button_count" data-show-faces="false" data-send="false"></div>',
					'<div id="fb-root"></div>',
				'</li>',

				// '<li>',
				// 	// Email
				// 	'<a href="' +
				// 		'mailto:<yourfriend>?subject=' +
				// 		encodeURIComponent('Base Convert is awesome') +
				// 		'&amp;body=' +
				// 		encodeURIComponent("Hi <friend's name>,\n\n" +
				// 				"Check out Base Convert at http://baseconvert.com, it's an online floating point base converter.\n\n" +
				// 				"Take care,\n<your name>") +
				// 		'">',
				// 		'Email',
				// 	'</a>',
				// '</li>',

			'</ul>',
		'</div>'].join("");
	$('#share-text').after(html);

	$('.fb-like').one('click', enable_facebook_like);
	$('.g-plusone').one('click', enable_google_plus);

	// 
	enable_slow_hide(
		// Replace the CSS
		'#share-text, #share-links,' +
		// Google places dialogs outside of its container
		'.gc-bubbleDefault, .pls-container'
		// Facebook behaves, so there is no need to deal with it specifically
	);

	function add_script(url) {
		var n = document.createElement('script');
		n.src = url;
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(n, s);
	}
	function enable_google_plus() {
		$(this).removeClass('disabled');
		add_script('https://apis.google.com/js/plusone.js');
	}
	function enable_facebook_like() {
		$(this).removeClass('disabled');
		add_script('//connect.facebook.net/en_US/all.js#xfbml=1');
	}

	function enable_slow_hide(selector) {
		var timeout;
		var $share_links = $('#share-links');
		$('body').on('mouseenter', selector, function () {
			clearTimeout(timeout);
			$share_links.css('display', 'inline');
		});
		$('body').on('mouseleave', selector, function () {
			timeout = setTimeout(function() {
				$share_links.css('display', 'none');
			}, 500);
		});
	}

});
