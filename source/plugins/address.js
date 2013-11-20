(function () {
var botName = bot.users[ bot.adapter.user_id ].name,
	addresser = '@' + botName.replace( /\s/g, '' ) + ' ';

IO.register( 'input', function ( msgObj ) {
	var message = msgObj.content;

	if ( message.indexOf(addresser + bot.invocationPattern) === 0 ) {
		msgObj.content = message.substring( addresser.length );
		bot.parseMessage( msgObj );
	}
});
})();
