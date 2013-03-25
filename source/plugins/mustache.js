(function () {

function mustachify ( args ) {
	var usrid = args.content;

	if ( !usrid ) {
		usrid = args.get( 'user_id' );
	}
	else if ( /\D/.test(usrid) ) {
		usrid = args.findUserid( usrid );
	}

	bot.log( usrid, '/mustache mapped' );

	if ( usrid < 0 || !bot.users.hasOwnProperty(usrid) ) {
		return 'User {0} was not found.'.supplant( usrid );
	}

	args.directreply(
		'http://mustachify.me/?src=http://www.gravatar.com/avatar/{0}?s=256#.jpg'
			.supplant( bot.users[usrid].email_hash ) );
}

bot.addCommand({
	name : 'mustache',
	fun : mustachify,
	privileges : {
		del : 'NONE'
	},

	description : 'Mustachifies a user. `/mustache [usrid|user name]`'
});

}());
