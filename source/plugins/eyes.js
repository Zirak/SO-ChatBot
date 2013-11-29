(function () {

var regexp = /eye(?=s|\b)/;

// #108
IO.register( 'input', function eyesThighs ( msgObj ) {
	var hasEyes = regexp.test( msgObj.content );

	if ( !hasEyes || msgObj.user_id === bot.adapter.user_id ) {
		return;
	}

	var message =
		IO.decodehtmlEntities( msgObj.content.replace(/eye/g, 'thigh') );

	bot.adapter.out.add( message, msgObj.room_id );
});

})();
