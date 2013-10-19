(function () {
	var cmd = {
		description : 'Forwards the message to my ears (as if called without the /)',
		fun : listen,
		name : 'listen',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	function listen ( msg ) {
		var ret = bot.callListeners( msg );
		if ( !ret ) {
			return bot.giveUpMessage();
		}
	};
}());