(function () {
	var cmd = {
		description : 'Bans user(s) from using me. Lacking arguments, prints the banlist. `/ban [usr_id|usr_name, [...]`',
		fun : ban,
		name : 'ban',
		permissions : {
			del : 'NONE',
			use : 'OWNER'
		}
	};

	cmd = bot.CommunityCommand( cmd );
	bot.addCommand( cmd );

	function ban( args ) {
		if ( args.content ) {
			var work = { args:args, ret:[] };
			args.parse().forEach( setBan, work );
			return work.ret.join( ' ' ) || 'Nothing to do.';
		}

		return (
			Object.keys( bot.banlist ).filter( Number ).map( format )
		).join( ' ' ) || 'Nothing to show.';
	};

	function format ( id ) {
		var user = bot.users[ id ],
			name = user ? user.name : '?';

		return '{0} ({1})'.supplant( id, name );
	};

	function setBan ( usrid ) {
		var id = Number( usrid ),
			msg;

		if ( isNaN(id) ) {
			id = this.args.findUserid( usrid.replace(/^@/, '') );
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

		this.ret.push( msg.supplant(usrid) );
	};
}());
