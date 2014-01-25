(function () {

function mdn ( args, cb ) {
	IO.jsonp.google(
		args.toString() + ' site:developer.mozilla.org', finishCall );

	function finishCall ( resp ) {
		if ( resp.responseStatus !== 200 ) {
			finish( 'Something went on fire; status ' + resp.responseStatus );
			return;
		}

		var result = resp.responseData.results[ 0 ];
		bot.log( result, '/mdn result' );
		finish( result.url );
	}

	function finish ( res ) {
		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.reply( res );
		}
	}
};

bot.addCommand({
	name : 'mdn',
	fun : mdn,

	permissions : { del : 'NONE', use : 'ALL' },
	description : 'Fetches mdn documentation. `/mdn what`',
	async : true
});

})();
