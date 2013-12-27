bot.addCommand({
	name : 'user',
	fun : function ( args ) {
		var props = args.parse(),
			usrid = props[ 0 ] || args.get( 'user_id' ),
			id = usrid;

		//check for searching by username
		if ( !(/^\d+$/.test(usrid)) ) {
			id = args.findUserid( usrid );

			if ( id < 0 ) {
				return 'Can\'t find user ' + usrid + ' in this chatroom.';
			}
		}

		args.directreply( 'http://stackoverflow.com/users/' + id );
	},
	permissions : { del : 'NONE', use : 'ALL' },
	description : 'Fetches user-link for specified user. ' +
		'`/user usr_id|usr_name`',
});
