(function () {
	var cmd = {
		async : true,
		description : 'Forwards message to javascript code-eval',
		fun : eval,
		name : 'eval',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	function eval( msg, cb ) {
		return bot.eval( msg, cb );
	};
}());