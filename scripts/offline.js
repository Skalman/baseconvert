$(function () {
	if (window.applicationCache && $('html').attr('manifest')) {
		var explanation = 'This website supports offline mode.\nIn modern browsers you can use this website without an internet connection.';
		$('<aside>', { id: 'offline' }).append(
			$('<p>').append(
				$('<img>', {
					src: 'images/offline.png',
					alt: 'This website supports offline mode.',
					title: explanation,
					click: function () {
						alert(explanation);
					}
				})
			)
		).appendTo('footer');
		// window['con'+(window?'sole':'')].log(explanation);
		// $('footer').after(
		// 	'<aside id="offline">' +
		// 		'<p>' +
		// 			'<img src="images/offline.png" alt="This website supports offline mode." title="">' +
		// 		'</p>' +
		// 	'</aside>'
		// );
	}
});
