(function () {
var nulls = [
	'The Google contains no such knowledge',
	'There are no search results. Run.',
	'My Google Fu has failed.'];

function google ( args, cb ) {
	IO.jsonp.google( args.toString() + ' -site:w3schools.com', finishCall );

	function finishCall ( resp ) {
		bot.log( resp, '/google response' );
		if ( resp.responseStatus !== 200 ) {
			finish( 'My Google-Fu is on vacation; status ' +
					resp.responseStatus );
			return;
		}

		//TODO: change hard limit to argument
		var results = resp.responseData.results.slice( 0, 3 );
		bot.log( results, '/google results' );

		if ( !results.length ) {
			finish( nulls.random() );
			return;
		}
		finish( format(args.content, results) );
	}

	function format ( query, results ) {
		return formatLink( query ) +
			' ' +
			results.map( formatResult ).join( ' ; ' );
	}

	function formatResult ( result ) {
		var title = IO.decodehtmlEntities( result.titleNoFormatting );
		return args.link( title, result.url );
	}
	function formatLink ( query ) {
		return args.link(
			'*',
			'http://google.com/search?q=' +
				encodeURIComponent( query ) );
	}

	function finish ( res ) {
		bot.log( res, '/google final' );
		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.reply( res );
		}
	}
}

bot.addCommand({
	name : 'google',
	fun  : google,
	permissions : {
		del : 'NONE'
	},
	description : 'Search Google. `/google query`',
	async : true
});
}());
