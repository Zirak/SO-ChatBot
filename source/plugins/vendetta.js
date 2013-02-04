IO.register( 'input', function ( msgObj ) {
	if ( msgObj.user_id === 1348195 && Math.random() < 0.01 ) {
		bot.adapter.out.add(
			bot.adapter.reply(msgObj.user_name) + ' The Game' );
	}
});
