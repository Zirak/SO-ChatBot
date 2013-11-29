(function () {

var cache = {};

function urban ( args, cb ) {
	if ( !args.length ) {
		return 'Y U NO PROVIDE ARGUMENTS!?';
	}

	if ( cache[args] ) {
		return finish( cache[args] );
	}

	IO.jsonp({
		url : 'http://api.urbandictionary.com/v0/define',
		data : {
			term : args.content
		},
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		var msg;

		if ( resp.result_type === 'no_results' ) {
			msg = 'No definition found for ' + args;
		}
		else {
			msg = formatTop( resp.list[0] );
		}
		cache[ args ] = msg;

		finish( msg );
	}

	function finish ( def ) {
		if ( cb && cb.call ) {
			cb( def );
		}
		else {
			args.reply( def );
		}
	}

	function formatTop ( top ) {
		//replace [tag] in definition with links
		var def = top.definition.replace( /\[([^\]]+)\]/g, formatTag );

		return args.link( top.word, top.permalink ) + ' ' + def;
	}
	function formatTag ( $0, $1 ) {
		var href =
			'http://urbandictionary.com/define.php?term=' +
			encodeURIComponent( $1 );

		return args.link( $0, href );
	}
}

bot.addCommand({
	name : 'urban',
	fun : urban,

	permissions : { del : 'NONE', use : 'ALL' },

	description : 'Fetches UrbanDictionary definition. `/urban something`',
	async : true
});

})();
