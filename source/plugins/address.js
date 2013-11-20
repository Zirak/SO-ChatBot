(function () {
var botName = bot.users[ bot.adapter.user_id ].name,
	addresser = '@' + botName.replace( /\s/g, '' ) + ' ';

IO.register( 'input', function ( msgObj ) {
	var message = msgObj.content;

	if ( message.indexOf(addresser) === 0 ) {
		message = msgObj.content = message.substring( addresser.length );

		if ( message.indexOf(bot.invocationPattern) !== 0 ) {
			msgObj.content = bot.invocationPattern + message;
		}

		bot.parseMessage( msgObj );
	}
});
})();
