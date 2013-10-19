(function () {
	var cmd = {
		async : true,
		description : 'Forwards message to coffeescript code-eval',
		fun : coffee,
		name : 'coffee',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	function coffee( msg, cb ) {
		//yes, this is a bit yucky
		var arg = bot.Message( 'c> ' + msg, msg.get() );
		return bot.eval( arg, cb );
	};
}());
