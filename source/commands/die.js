(function () {
	var cmd = {
		description : 'Kills me :(',
		fun : die,
		name : 'die',
		permissions : {
			del : 'NONE',
			use : 'OWNER'
		}
	};

	cmd = bot.CommunityCommand( cmd );
	bot.addCommand( cmd );

	function die() {
		if ( bot.stopped ) {
			return 'Kill me once, shame on you, kill me twice...';
		}
		bot.stop();
		return 'You killed me!';
	};
}());
