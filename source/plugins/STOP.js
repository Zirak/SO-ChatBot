IO.register( 'input', function ( msgObj ) {
	var content = msgObj.content.toUpperCase().match( /\w+/ )[ 0 ];

	if ( content === 'STOP' ) {
		bot.adapter.out.add( 'HAMMERTIME!', msgObj.room_id );
	}
});
