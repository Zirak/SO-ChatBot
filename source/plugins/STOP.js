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
    else if ( /(^)?STOY[\.!\?]?$/.test(sentence) ) {
        res = 'ZABIVAT\' VREMYA!';
    }
    else if ( /(^)?CAESUM[\.!\?]?$/.test(sentence) ) {
        res = 'MALLEUS TEMPUS!';
    }

	if ( res ) {
		bot.adapter.out.add( res, msgObj.room_id );
	}
});
