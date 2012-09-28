IO.register( 'input', function ( msgObj ) {
	var words = msgObj.content.match( /\w+/g ) || [];

	if ( words.length === 1 && words[0].toUpperCase() === 'STOP' ) {
		bot.adapter.out.add( 'HAMMERTIME!', msgObj.room_id );
	}
});
