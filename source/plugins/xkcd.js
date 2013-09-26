(function() {
//Gets or sets a XKCD comic-type thing
//just kidding! we can't set one. I'm just used to crappy javadoc style.
//*sniffle*

function getXKCD( args, cb ) {
	var prop = ( args.parse()[0] || '' ).toLowerCase(),
		linkBase = 'http://xkcd.com/';

	//they want a specifix xkcd
	if ( /\d{1,4}/.test(prop) ) {
		finish( linkBase + prop );
		return;
	}
	//Search google to find an xkcd comic based on their arguments
	else if ( prop && prop !== 'new' ) {
		IO.jsonp.google(
            args.toString() + ' site:xkcd.com -forums.xkcd -m.xkcd', finishQuery);
		return;
	}

	//they want a random XKCD, or the latest
	IO.jsonp({
		url : 'http://dynamic.xkcd.com/api-0/jsonp/comic',
		jsonpName : 'callback',
		fun : finishXKCD
	});

    //Callback from xkcd jsonp
	function finishXKCD ( resp ) {
		var maxID = resp.num;

		if ( !prop ) {
			finish( linkBase + Math.rand(1, maxID) );
		}
		else if ( prop === 'new' ) {
			finish( linkBase + maxID );
		}
	}
    
    //Callback from Google jsonp
    function finishQuery( resp ) {
        if ( resp.responseStatus !== 200 ) {
			finish( 'Error: -41 (' + resp.responseStatus + ')' );
			return;
		}
		var result = resp.responseData.results[ 0 ];
        var matches = /xkcd.com\/(\d+)/.exec(result.url);
        if(!matches) {
            finish( 'Search didn\'t yield a comic; yielded: ' +result.url);
            return;
        }
        finish( result.url );
    }
    
	function finish( res ) {
		bot.log( res, '/xkcd finish' );

		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.directreply( res );
		}
	}
}

bot.addCommand({
	name : 'xkcd',
	fun : getXKCD,
	permissions : {
		del : 'NONE'
	},
	description : 'Returns an XKCD. Call with no args for random, ' +
		'`new` for latest, or a number for a specific one, or other to query google.',
	async : true
});
})();
