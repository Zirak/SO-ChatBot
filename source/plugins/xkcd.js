(function() {

	// Gets a XKCD comic-type thing

	function getXKCD( args, cb ) {
		props = args.parse();
		console.log(props);
		console.log(cb);
		// They want a random XKCD, or the latest
		if ( !props[0] || props[0] === 'new' ) {

			IO.jsonp({
				url : 'http://dynamic.xkcd.com/api-0/jsonp/comic',
				jsonpName : 'callback',
				fun : finishXKCD
			});

			function finishXKCD ( resp ) {
				console.log(resp);
				var maxID = resp.num;
				if ( !props[0] ) {
					finish( 'http://xkcd.com/' + Math.rand( 1, maxID ));
				} else {
					finish( 'http://xkcd.com/' + maxID );
				}
			}
		// They want a certian XKCD
		} else if ( /\d{1,4}/.test(props[0]) ) {
			finish( 'http://xkcd.com/' + props[0] );
		} else {
			finish( 'Clearly, you\'re not geeky enough for XKCD.' );
		}

		function finish( res ) {
			bot.log( res, '/xkcd final' );
			if ( cb && cb.call ) {
				console.log('hyar');
				cb( res );
			}
			else {
				args.directreply( res );
			}
		}
	}



	bot.addCommand({
		name: 'xkcd',
		fun: getXKCD,
		description: 'Returns an XKCD.  Call with no args for random, `new` for latest, or a number for that comic',
		async: true
	});
})();