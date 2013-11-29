(function () {

// #108
IO.register( 'input', function eyesThighs ( msgObj ) {
	var hasEyes = msgObj.content.indexOf( 'eyes' ) > -1;

	if ( hasEyes ) {
		bot.adapter.out.add(
			msgObj.content.replace( 'eyes', 'thighs' ),
			msgObj.room_id );
	}
});

})();
