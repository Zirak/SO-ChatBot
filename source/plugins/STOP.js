IO.register( 'input', function ( msgObj ) {
	var sentence = msgObj.content.toUpperCase();

	//for probably good reason, it didn't allow me to apply the optional
	// operator on beginnin-of-input, i.e. ^?
	//so we have to wrap the ^ in parens
	if ( /(^)?STOP[\.!\?]?$/.test(sentence) ) {
		bot.adapter.out.add( 'HAMMERTIME!', msgObj.room_id );
	}
	else if ( /(^)?HALT[\.!\?]?$/.test(sentence) ) {
		bot.adapter.out.add( 'HAMMERZEIT!', msgObj.room_id );
	}
});
