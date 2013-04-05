IO.register( 'input', function STOP ( msgObj ) {
	var sentence = msgObj.content.toUpperCase(),
		res;

	//for probably good reason, it didn't allow me to apply the optional
	// operator on beginnin-of-input, i.e. ^?
	//so we have to wrap the ^ in parens
	if ( /(^)?STOP[\.!\?]?$/.test(sentence) ) {
		res = 'HAMMERTIME!';
	}
	else if ( /(^)?STAHP[\.!\?]?$/.test(sentence) ) {
		res = 'HAMMAHTIME!';
	}
	else if ( /(^)?HALT[\.!\?]?$/.test(sentence) ) {
		res = 'HAMMERZEIT!';
	}

	if ( res ) {
		bot.adapter.out.add( res, msgObj.room_id );
	}
});
