(function () {

function mdn ( args, cb ) {
	var terms = args.toString().split(/,\s*/g),
		results = {'unescapedUrls': [], 'formatted': []};
	terms.forEach(function (term) {
		IO.jsonp.google(
			term + ' site:developer.mozilla.org', finishCall );
	});
	function finishCall ( resp ) {

		if ( resp.responseStatus !== 200 ) {
			finish( 'Something went on fire; status ' + resp.responseStatus );
			return;
		}

		var result = resp.responseData.results[ 0 ];
		bot.log( result, '/mdn result' );
		
		var title = result.titleNoFormatting.replace(/ -.+/, '');
		results.formatted.push(bot.adapter.link(IO.decodehtmlEntities(title), result.url));
		results.unescapedUrls.push(result.url);
		
		if (results.formatted.length === terms.length) {
			var msg = results.formatted.join(', ');
			if (msg.length > bot.adapter.maxLineLength) {
				msg = results.unescapedUrls.join(', ');
			}
			finish( msg );
		}

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
