(function () {
	var cmd = {
		description : 'Grabs some stats on my current instance or a command. `/info [cmdName]`',
		fun : info,
		name : 'info',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	function info( args ) {
		if ( args.content ) {
			return commandFormat( args.content );
		}

		return timeFormat() + ', ' + statsFormat();
	};

	function commandFormat ( commandName ) {
		var cmd = bot.getCommand( commandName );

		if ( cmd.error ) {
			return cmd.error;
		}
		var ret =  'Command {name}, created by {creator}'.supplant( cmd );

		if ( cmd.date ) {
			ret += ' on ' + cmd.date.toUTCString();
		}

		if ( cmd.invoked ) {
			ret += ', invoked ' + cmd.invoked + ' times';
		}
		else {
			ret += ' but hasn\'t been used yet';
		}

		return ret;
	};

	function timeFormat () {
		var format = 'I awoke on {0} (that\'s about {1} ago)',

			awoke = bot.info.start.toUTCString(),
			ago = Date.timeSince( bot.info.start );

		return format.supplant( awoke, ago );
	};

	function statsFormat () {
		var ret = [],
			but = ''; //you'll see in a few lines

		if ( bot.info.invoked ) {
			ret.push( 'got invoked ' + bot.info.invoked + ' times' );
		}
		if ( info.learned ) {
			but = 'but ';
			ret.push( 'learned ' + bot.info.learned + ' commands' );
		}
		if ( info.forgotten ) {
			ret.push( but + 'forgotten ' + bot.info.forgotten + ' commands' );
		}
		if ( Math.random() < 0.15 ) {
			ret.push( 'teleported ' + Math.rand(100) + ' goats' );
		}

		return ret.join( ', ' ) || 'haven\'t done anything yet!';
	};
}());
