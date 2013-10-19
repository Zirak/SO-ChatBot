(function () {
	var cmd = {
		description : 'Fetches documentation for given command, or general help article. `/help [cmdName]`',
		fun : help,
		name : 'help',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	function help ( args ) {
		if ( args && args.length ) {

			var cmd = bot.getCommand( args.toLowerCase() );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description || 'No info is available';

			return args + ': ' + desc;
		}

		return 'https://github.com/Zirak/SO-ChatBot/wiki/ Interacting-with-the-bot';
	};
}());
