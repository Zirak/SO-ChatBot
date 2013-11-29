(function () {
"use strict";

var commands = {
	help : function ( args ) {
		if ( args && args.length ) {

			var cmd = bot.getCommand( args.toLowerCase() );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description || 'No info is available';

			return args + ': ' + desc;
		}

		return 'Information on interacting with me can be found at ' +
			'[this page](https://github.com/Zirak/SO-ChatBot/' +
			'wiki/Interacting-with-the-bot)';
	},

	listen : function ( msg ) {
		var ret = bot.callListeners( msg );
		if ( !ret ) {
			return bot.giveUpMessage();
		}
	},

	eval : function ( msg, cb ) {
		return bot.eval( msg, cb );
	},
	coffee : function ( msg, cb ) {
		//yes, this is a bit yucky
		var arg = bot.Message( 'c> ' + msg, msg.get() );
		return commands.eval( arg, cb );
	},

	live : function () {
		if ( !bot.stopped ) {
			return 'I\'m not dead! Honest!';
		}
		bot.continue();
		return 'And on this day, you shall paint eggs for a giant bunny.';
	},

	die : function () {
		if ( bot.stopped ) {
			return 'Kill me once, shame on you, kill me twice...';
		}
		bot.stop();
		return 'You killed me!';
	},

	refresh : function() {
		window.location.reload();
    },

	forget : function ( args ) {
		var name = args.toLowerCase(),
			cmd = bot.getCommand( name );

		if ( cmd.error ) {
			return cmd.error;
		}

		if ( !cmd.canDel(args.get('user_id')) ) {
			return 'You are not authorized to delete the command ' + args;
		}

		cmd.del();
		return 'Command ' + name + ' forgotten.';
	},

	ban : function ( args ) {
		var ret = [];
		if ( args.content ) {
			args.parse().forEach( ban );
		}
		else {
			ret = Object.keys( bot.banlist ).filter( Number ).map( format );
		}

		return ret.join( ' ' ) || 'Nothing to show/do.';

		function ban ( usrid ) {
			var id = Number( usrid ),
				msg;
			if ( isNaN(id) ) {
				id = args.findUserid( usrid.replace(/^@/, '') );
			}

			if ( id < 0 ) {
				msg = 'Cannot find user {0}.';
			}
			else if ( bot.isOwner(id) ) {
				msg = 'Cannot mindjail owner {0}.';
			}
			else if ( bot.banlist.contains(id) ) {
				msg = 'User {0} already in mindjail.';
			}
			else {
				bot.banlist.add( id );
				msg = 'User {0} added to mindjail.';
			}

			ret.push( msg.supplant(usrid) );
		}

		function format ( id ) {
			var user = bot.users[ id ],
				name = user ? user.name : '?';

			return '{0} ({1})'.supplant( id, name );
		}
	},

	unban : function ( args ) {
		var ret = [];
		args.parse().forEach( unban );

		return ret.join( ' ' );

		function unban ( usrid ) {
			var id = Number( usrid ),
				msg;
			if ( isNaN(id) ) {
				id = args.findUserid( usrid.replace(/^@/, '') );
			}

			if ( id < 0 ) {
				msg = 'Cannot find user {0}.';
			}
			else if ( !bot.banlist.contains(id) ) {
				msg = 'User {0} isn\'t in mindjail.';
			}
			else {
				bot.banlist.remove( id );
				msg = 'User {0} freed from mindjail!';
			}

			ret.push( msg.supplant(usrid) );
		}
	},

	//a lesson on semi-bad practices and laziness
	//chapter III
	info : function ( args ) {
		if ( args.content ) {
			return commandFormat( args.content );
		}

		var info = bot.info;
		return timeFormat() + ', ' + statsFormat();

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
		}

		function timeFormat () {
			var format = 'I awoke on {0} (that\'s about {1} ago)',

				awoke = info.start.toUTCString(),
				ago = Date.timeSince( info.start );

			return format.supplant( awoke, ago );
		}

		function statsFormat () {
			var ret = [],
				but = ''; //you'll see in a few lines

			if ( info.invoked ) {
				ret.push( 'got invoked ' + info.invoked + ' times' );
			}
			if ( info.learned ) {
				but = 'but ';
				ret.push( 'learned ' + info.learned + ' commands' );
			}
			if ( info.forgotten ) {
				ret.push( but + 'forgotten ' + info.forgotten + ' commands' );
			}
			if ( Math.random() < 0.15 ) {
				ret.push( 'teleported ' + Math.rand(100) + ' goats' );
			}

			return ret.join( ', ' ) || 'haven\'t done anything yet!';
		}
	},

	choose : function ( args ) {
		return 'Deprecated command - use the weasel (should I ... or ...)';
	},

	user : function ( args ) {
		var props = args.parse(),
			usrid = props[ 0 ] || args.get( 'user_id' ),
			id = usrid;

		//check for searching by username
		if ( !(/^\d+$/.test(usrid)) ) {
			id = args.findUserid( usrid );

			if ( id < 0 ) {
				return 'Can\'t find user ' + usrid + ' in this chatroom.';
			}
		}

		args.directreply( 'http://stackoverflow.com/users/' + id );
	}
};

commands.listcommands = (function () {
var partition = function ( list, maxSize ) {
	var size = 0, last = [];

	var ret = list.reduce(function partition ( ret, item ) {
		var len = item.length + 2; //+1 for comma, +1 for space

		if ( size + len > maxSize ) {
			ret.push( last );
			last = [];
			size = 0;
		}
		last.push( item );
		size += len;

		return ret;
	}, []);

	if ( last.length ) {
		ret.push( last );
	}

	return ret;
};

return function ( args ) {
	var commands = Object.keys( bot.commands ),
		pagination = ' (page {0}/{1})',
		user_name = args.get( 'user_name' ),
		// 500 is the max, -2 for @ and space.
		maxSize = 498 - pagination.length - user_name.length,
		//TODO: only call this when commands were learned/forgotten since last
		partitioned = partition( commands, maxSize ),

		valid = /^(\d+|$)/.test( args.content ),
		page = Number( args.content ) || 0;

	if ( page >= partitioned.length || !valid ) {
		return args.codify( [
			'StackOverflow: Could not access page.',
			'IndexError: index out of range',
			'java.lang.IndexOutOfBoundsException',
			'IndexOutOfRangeException'
		].random() );
	}

	var ret = partitioned[ page ].join( ', ' );

	return ret + pagination.supplant( page, partitioned.length-1 );
};
})();

commands.eval.async = commands.coffee.async = true;

var parse = commands.parse = (function () {
var macros = {
	who : function ( msgObj ) {
		return msgObj.get( 'user_name' );
	},

	someone : function () {
		var presentUsers = document.getElementById( 'sidebar' )
			.getElementsByClassName( 'present-user' );

		//the chat keeps a low opacity for users who remained silent for long,
		// and high opacity for those who recently talked
		var active = [].filter.call( presentUsers, function ( user ) {
			return Number( user.style.opacity ) >= 0.5;
		}),
		user = active[ Math.floor(Math.random() * (active.length-1)) ];

		if ( !user ) {
			return 'Nobody';
		}

		return user.getElementsByTagName( 'img' )[ 0 ].title;
	},

	digit : function () {
		return Math.floor( Math.random() * 10 );
	},

	encode : function ( msgObj, string ) {
		return encodeURIComponent( string );
	},

	//random number, min <= n <= max
	//treats non-numeric inputs like they don't exist
	rand : function ( msgObj, min, max ) {
		min = Number( min );
		max = Number( max );
		return Math.rand( min, max );
	}
};
var macroRegex = /(?:.|^)\$(\w+)(?:\((.*?)\))?/g;

//extraVars is for internal usage via other commands
return function parse ( args, extraVars ) {
	var isMsg = !!args.get,
		//filler objects, solves
		// https://github.com/Zirak/SO-ChatBot/issues/66
		msgObj = isMsg ? args.get() : {},
		user = isMsg ? bot.users[ args.get('user_id') ] : {};

	extraVars = extraVars || {};
	bot.log( args, extraVars, '/parse input' );

	return args.replace( macroRegex, replaceMacro );

	function replaceMacro ( $0, filler, fillerArgs ) {
		//$$ makes a literal $
		if ( $0.startsWith('$$') ) {
			return $0.slice( 1 );
		}

		//include the character that was matched in the $$ check, unless
		// it's a $
		var ret = '';
		if ( $0[0] !== '$' ) {
			ret = $0[ 0 ];
		}

		var macro = findMacro( filler );

		//not found? bummer.
		if ( !macro ) {
			return filler;
		}

		bot.log( macro, filler, fillerArgs, '/parse replaceMacro' );
		//when the macro is a function
		if ( macro.apply ) {
			ret += macro.apply( null, parseMacroArgs(fillerArgs) );
		}
		//when the macro is simply a substitution
		else {
			ret += macro;
		}
		return ret;
	}

	function parseMacroArgs ( macroArgs ) {
		bot.log( macroArgs, '/parse parseMacroArgs' );
		if ( !macroArgs ) {
			return [ args ];
		}

		//parse the arguments, split them into individual arguments,
		// and trim'em (to cover the case of "arg,arg" and "arg, arg")
		return (
			[ args ].concat(
				parse( macroArgs, extraVars )
					.split( ',' ).invoke( 'trim' ) ) );
		//this is not good code
	}

	function findMacro ( macro ) {
		var container = [ macros, msgObj, user, extraVars ].first( hasMacro );

		return ( container || {} )[ macro ];

		function hasMacro ( obj ) {
			return obj && obj.hasOwnProperty( macro );
		}
	}
};
}());

commands.tell = (function () {
var invalidCommands = { tell : true, forget : true };

return function ( args ) {
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

var descriptions = {
	ban : 'Bans user(s) from using me. Lacking arguments, prints the banlist.' +
		' `/ban [usr_id|usr_name, [...]]`',
	choose : '(Deprecated)',
	die  : 'Kills me :(',
	eval : 'Forwards message to javascript code-eval',
	coffee : 'Forwards message to coffeescript code-eval',
	forget : 'Forgets a given command. `/forget cmdName`',
	help : 'Fetches documentation for given command, or general help article.' +
		' `/help [cmdName]`',
	info : 'Grabs some stats on my current instance or a command.' +
		' `/info [cmdName]`',
	listcommands : 'Lists commands. `/listcommands [page=0]`',
	listen : 'Forwards the message to my ears (as if called without the /)',
	live : 'Resurrects me (:D) if I\'m down (D:)',
	parse : 'Returns result of "parsing" message according to the my mini' +
		'-macro capabilities (see online docs)',
	refresh : 'Reloads the browser window I live in',
	tell : 'Redirect command result to user/message.' +
		' /tell `msg_id|usr_name cmdName [cmdArgs]`',
	unban : 'Removes a user from my mindjail. `/unban usr_id|usr_name`',
	user : 'Fetches user-link for specified user. `/user usr_id|usr_name`',
};

//only allow owners to use certain commands
var privilegedCommands = {
	die : true, live  : true,
	ban : true, unban : true,
	refresh : true
};
//voting-based commands for unpriviledged users
var communal = {
	die : true, ban : true
};

Object.iterate( commands, function ( cmdName, fun ) {
	var cmd = {
		name : cmdName,
		fun  : fun,
		permissions : {
			del : 'NONE',
			use : privilegedCommands[ cmdName ] ? 'OWNER' : 'ALL'
		},
		description : descriptions[ cmdName ],
		async : commands[ cmdName ].async
	};

	if ( communal[cmdName] ) {
		cmd = bot.CommunityCommand( cmd );
	}
	bot.addCommand( cmd );
});

}());
