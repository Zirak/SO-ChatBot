(function () {
	var cmd = {
		description : 'Resurrects me (:D) if I\'m down',
		fun : live,
		name : 'live',
		permissions : {
			del : 'NONE',
			use : 'OWNER'
		}
	};

	bot.addCommand( cmd );

	function live() {
		if ( !bot.stopped ) {
			return 'I\'m not dead! Honest!';
		}
		bot.continue();
		return 'And on this day, you shall paint eggs for a giant bunny.';
	};
}());