(function () {
"use strict";

var unexisto = 'User {0} was not found (if the user is not in room {1}, pass ' +
		'a user-id instead of a username).';

function mustachify ( args ) {
	var usrid = args.content;

	//check for url passing
	if ( linkCheck(usrid) ) {
		finish( encodeURIComponent(usrid) );
		return;
	}

	if ( !usrid ) {
		usrid = args.get( 'user_id' );
	}
	else if ( /\D/.test(usrid) ) {
		usrid = args.findUserid( usrid );
	}

	bot.log( usrid, '/mustache mapped' );

	if ( usrid < 0 || !bot.users.hasOwnProperty(usrid) ) {
		return unexisto.supplant( usrid, bot.adapter.roomid );
	}
	else if ( Number(usrid) === bot.adapter.user_id ) {
		return [
			'Nobody puts a mustache on me. Again.',
			'Mustache me once, shame on you. Mustache me ---twice--- 12 times...'
		].random();
	}

	var hash = bot.users[ usrid ].email_hash;
	//SO now allows non-gravatar images. the email_hash will be a link to the
	// image in that case, prepended with a ! for some reason
	if ( hash[0] === '!' ) {
		finish( encodeURIComponent(hash.slice(1)) + '#.png' );
	}
	else {
		finish(
			'http%3A%2F%2Fwww.gravatar.com%2Favatar%2F{0}%3Fs%3D256%26d%3Didenticon#.png'.supplant(hash) );
	}

	function finish ( src ) {
		bot.log( src, '/mustache finish' );

		args.directreply(
			'http://mustachify.me/?src=' + src );
	}
}

function linkCheck ( suspect ) {
	return suspect.startsWith( 'http' ) || suspect.startsWith( 'www' );
}

bot.addCommand({
	name : 'mustache',
	fun : mustachify,
	privileges : {
		del : 'NONE'
	},

	description : 'Mustachifies a user. `/mustache [link|usrid|user name]`'
});

}());
