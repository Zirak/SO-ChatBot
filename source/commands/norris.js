(function () {
	var cmd = {
		async : true,
		description : 'Random chuck norris joke!',
		fun : norris,
		name : 'norris',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	//cb is for internal usage by other commands/listeners
	function norris( args, cb ) {
		var chucky = 'http://api.icndb.com/jokes/random';

		IO.jsonp({
			url : chucky,
			fun : finishCall,
			jsonpName : 'callback'
		});

		function finishCall ( resp ) {
			var msg;

			if ( resp.type !== 'success' ) {
				msg = 'Chuck Norris is too awesome for this API. Try again.';
			}
			else {
				msg = IO.decodehtmlEntities( resp.value.joke );
			}

			if ( cb && cb.call ) {
				cb( msg );
			}
			else {
				args.reply( msg );
			}
		}
	};
}());