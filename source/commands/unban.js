(function () {
	var cmd = {
		description : 'Removes a user from my mindjail. `/unban usr_id|usr_name`',
		fun : unban,
		name : 'unban',
		permissions : {
			del : 'NONE',
			use : 'OWNER'
		}
	};

	bot.addCommand( cmd );

	function unban( args ) {
		var work = {args:args, ret:[]};
		args.parse().forEach( setUnban, work );

		return work.ret.join( ' ' );
	};

	function setUnban ( usrid ) {
		var id = Number( usrid ),
			msg;

		if ( isNaN(id) ) {
			id = this.args.findUserid( usrid.replace(/^@/, '') );
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

		this.ret.push( msg.supplant(usrid) );
	};
}());
