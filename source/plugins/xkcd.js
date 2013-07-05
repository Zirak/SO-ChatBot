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
	//we have no idea what they want. lazy arrogant bastards.
	else if ( prop && prop !== 'new' ) {
		finish( 'Clearly, you\'re not geeky enough for XKCD.' );
		return;
	}

	//they want a random XKCD, or the latest
	IO.jsonp({
		url : 'http://dynamic.xkcd.com/api-0/jsonp/comic',
		jsonpName : 'callback',
		fun : finishXKCD
	});

	function finishXKCD ( resp ) {
		var maxID = resp.num;

		if ( !prop ) {
			finish( linkBase + Math.rand(1, maxID) );
		}
		else if ( prop === 'new' ) {
			finish( linkBase + maxID );
		}
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
		'`new` for latest, or a number for a specific one.',
	async : true
});
})();
