(function () {

function ban ( args ) {
	var ret = [];
	if ( args.content ) {
		args.parse().forEach( ban );
	}
	else {
		ret = Object.keys( bot.banlist ).filter( Number ).map( format );
	}

	return ret.join( ' ' ) || 'Nothing to show/do.';

	function ban ( usrid ) {
		var id = Number( usrid ),
		    msg;
		if ( isNaN(id) ) {
			id = args.findUserid( usrid.replace(/^@/, '') );
		}

		if ( id < 0 ) {
			msg = 'Cannot find user {0}.';
		}
		else if ( bot.isOwner(id) ) {
			msg = 'Cannot mindjail owner {0}.';
		}
		else if ( bot.banlist.contains(id) ) {
			msg = 'User {0} already in mindjail.';
		}
		else {
			bot.banlist.add( id );
			msg = 'User {0} added to mindjail.';
		}

		ret.push( msg.supplant(usrid) );
	}

	function format ( id ) {
		var user = bot.users[ id ],
		name = user ? user.name : '?';

		return '{0} ({1})'.supplant( id, name );
	}
}

function unban ( args ) {
	var ret = [];
	args.parse().forEach( unban );

	return ret.join( ' ' );

	function unban ( usrid ) {
		var id = Number( usrid ),
		    msg;

		if ( isNaN(id) ) {
			id = args.findUserid( usrid.replace(/^@/, '') );
		}

		if ( id < 0 ) {
			msg = 'Cannot find user {0}.';
		}
		else if ( !bot.banlist.contains(id) ) {
			msg = 'User {0} isn\'t in mindjail.';
		}
		else {
			bot.banlist.remove( id );
			msg = 'User {0} freed from mindjail!';
		}

		ret.push( msg.supplant(usrid) );
	}
}
bot.addCommand(bot.CommunityCommand({
	name : 'ban',
	fun : ban,
	permissions : { del : 'NONE', use : 'OWNER' },
	description : 'Bans user(s) from using me. Lacking arguments, prints the ' +
		'banlist. `/ban [usr_id|usr_name, [...]]`'
}));

bot.addCommand({
	name : 'unban',
	fun : unban,
	permissions : { del : 'NONE', use : 'OWNER' },
	description : 'Removes a user from my mindjail. `/unban usr_id|usr_name`'
});

})();
