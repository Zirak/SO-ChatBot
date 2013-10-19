(function () {
	var cmd = {
		description : 'Forgets a given command. `/forget cmdName`',
		fun : forget,
		name : 'forget',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	function forget( args ) {
		var name = args.toLowerCase(),
			cmd = bot.getCommand( name );

		if ( cmd.error ) {
			return cmd.error;
		}

		if ( !cmd.canDel(args.get('user_id')) ) {
			return 'You are not authorized to delete the command ' + args;
		}

		cmd.del();
		return 'Command ' + name + ' forgotten.';
	};
}());