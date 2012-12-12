(function () {
var help_message = 'Fetches and beautifies a message containing html, ' +
		'css or js. `/beautify msgid [lang=js]`';
var err404 = 'Message {0} not found';

var beautifiers = {
	js   : js_beautify,
	css  : css_beautify,
	html : style_html };

function beautify ( msg ) {
	var args = msg.parse(),
		possible_id = args.shift(),
		lang = ( args.shift() || 'js' ).toLowerCase();

	bot.log( possible_id, lang, '/beautify input' );

	if ( !beautifiers.hasOwnProperty(lang) ) {
		return 'Unrecognized language {0}. Options: {1}'
			.supplant( lang, Object.keys(beautifiers).join(', ') );
	}

	var id = Number( fetch_message_id(possible_id, msg) );
	if ( id < 0 ) {
		return err404.supplant( id );
	}

	fetch_message( id, finish );

	function finish ( code ) {
		if ( !code ) {
			bot.log( '/beautify not found' );
			msg.reply( err404.supplant(id) );
		}
		else {
			//so...we meet at last
			bot.log( code, '/beautify beautifying' );
			msg.send( msg.codify(beautifiers[lang](code)) );
		}
	}
}

function fetch_message( id, cb ) {
	IO.xhr({
		method : 'GET',
		url : '/message/' + id,
		data : {
			plain : true
		},

		complete : complete
	});

	function complete ( resp ) {
		//h4x everywhere
		//the SO error page begins with a \r. that's the only way we can tell
		// it apart from another, possibly valid message, since messages can't
		// be whitespace padded
		if ( resp[0] === '\r' ) {
			resp = null;
		}
		else {
			resp = IO.decodehtmlEntities( resp );
		}
		cb( resp );
	}
}

function fetch_message_id ( id, msg ) {
	if ( /^\d+$/.test(id) ) {
		return id;
	}

	bot.log( id, '/beautify fetch_message_id' );
	var message = fetch_last_message_of( msg.findUserid(id) );

	if ( !message ) {
		return -1;
	}
	return /\d+/.exec( message.id )[ 0 ];
}

function fetch_last_message_of ( usrid ) {
	var last_monologue = [].filter.call(
		document.getElementsByClassName( 'user-' + usrid ),
		class_test
	).pop();

	if ( !last_monologue ) {
		return undefined;
	}

	return [].pop.call(
		last_monologue.getElementsByClassName( 'message' ) );

	function class_test ( elem ) {
		return /\bmonologue\b/.test( elem.className )
	}
}

bot.addCommand({
	name : 'beautify',
	fun  : beautify,
	permission : {
		del : 'NONE'
	},

	description : help_message,
});

}());

//#build ../static/beautify_js.js
//#build ../static/beautify_css.js
//#build ../static/beautify_html.js
