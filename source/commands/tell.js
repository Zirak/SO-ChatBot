(function () {
	var cmd = {
		description : 'Redirect command result to user/message. `/tell msg_id|usr_name cmdName [cmdArgs]`',
		fun : tell,
		name : 'tell',
		permissions : {
			del : 'NONE'
		}
	};

	bot.addCommand( cmd );

	var invalidCommands = { tell : true, forget : true };

	function tell( args ) {
		var parts = args.split( ' ');
		bot.log( args.valueOf(), parts, '/tell input' );

		var replyTo = parts[ 0 ],
			cmdName = parts[ 1 ],
			cmd;

		if ( !replyTo || !cmdName ) {
			return 'Invalid /tell arguments. Use /help for usage info';
		}

		cmdName = cmdName.toLowerCase();
		cmd = bot.getCommand( cmdName );
		if ( cmd.error ) {
			return cmd.error;
		}

		if ( invalidCommands.hasOwnProperty(cmdName) ) {
			return 'Command ' + cmdName + ' cannot be used in /tell.';
		}

		if ( !cmd.canUse(args.get('user_id')) ) {
			return 'You do not have permission to use command ' + cmdName;
		}

		//check if the user's being a fag
		if ( /^@/.test(replyTo) ) {
			return 'Don\'t be annoying, drop the @, nobody likes a double-ping.';
		}

		//check if the user wants to reply to a message
		var direct = false,
			extended = {};
		if ( /^:?\d+$/.test(replyTo) ) {
			extended.message_id = replyTo.replace( /^:/, '' );
			direct = true;
		}
		else {
			extended.user_name = replyTo;
		}

		var msgObj = Object.merge( args.get(), extended );
		var cmdArgs = bot.Message(
			parts.slice( 2 ).join( ' ' ),
			msgObj );

		//this is an ugly, but functional thing, much like your high-school prom date
		//to make sure a command's output goes through us, we simply override the
		// standard ways to do output
		var reply = cmdArgs.reply.bind( cmdArgs ),
			directreply = cmdArgs.directreply.bind( cmdArgs );

		cmdArgs.reply = cmdArgs.directreply = cmdArgs.send = callFinished;

		bot.log( cmdArgs, '/tell calling ' + cmdName );

		//if the command is async, it'll accept a callback
		if ( cmd.async ) {
			cmd.exec( cmdArgs, callFinished );
		}
		else {
			callFinished( cmd.exec(cmdArgs) );
		}

		function callFinished ( res ) {
			if ( !res ) {
				return;
			}

			if ( direct ) {
				directreply( res );
			}
			else {
				reply( res );
			}
		}
	};
}());
