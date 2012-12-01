(function () {
var help_message = 'Fetches and beautifies a message containing html, ' +
		'css or js. `/beautify msgid [lang=js]`';

function beautifyMsg ( msg ) {
	var args = msg.parse(),
		id = args.shift(),
		lang = args.shift() || 'js';

	lang = lang.toLowerCase();
	bot.log( id, lang, '/beautify input' );

	if ( ['html', 'css', 'js'].indexOf(lang) < 0 ) {
		return help_message;
	}

	var mormons = {
		js   : js_beautify,
		css  : css_beautify,
		html : style_html };

	var containing_message = fetch_message( id, msg );
	if ( !containing_message ) {
		return '404 Message ' + id + ' Not Found';
	}
	var code = containing_message
			.getElementsByClassName( 'content' )[ 0 ].textContent;

	bot.log( code, '/beautify beautifying' );

	msg.send(
		msg.codify( mormons[lang](code) ) );
}

function fetch_message ( id, msg ) {
	if ( !/^\d+$/.test(id) ) {
		bot.log( id, '/beautify fetch_message' );
		return fetch_last_message( msg.findUserid(id) );
	}

	return document.getElementById( 'message-' + id );
}

function fetch_last_message ( usrid ) {
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
	fun  : beautifyMsg,
	permission : {
		del : 'NONE'
	},

	description : help_message,
});

}());

//#build ../static/beautify_js.js
//#build ../static/beautify_css.js
//#build ../static/beautify_html.js
