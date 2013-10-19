(function () {
	var cmd = {
		description : '"Randomly" choose an option given. `/choose option0 option1 ...`',
		fun : choose,
		name : 'choose',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	function choose( args ) {
		var opts = args.parse().filter( conjunctions ),
			len = opts.length;

		bot.log( opts, '/choose input' );

		//5% chance to get a "none-of-the-above"
		if ( Math.random() < 0.05 ) {
			return len === 2 ? 'Neither' : 'None of the above';
		}
		//5% chance to get "all-of-the-above"
		else if ( Math.random() < 0.05 ) {
			return len === 2 ? 'Both!' : 'All of the above';
		}

		return opts[ Math.floor(Math.random() * len) ];
	};

	//TODO: add support for words like "and", e.g.
	// skip and jump or cry and die
	//  =>
	// "skip and jump", "cry and die"
	function conjunctions ( word ) {
		return word !== 'or';
	};
}());