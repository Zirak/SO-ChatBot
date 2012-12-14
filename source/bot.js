(function () {
"use strict";

var bot = window.bot = {
	invocationPattern : '!!',

	commandRegex : /^\s*([\w\-]+)(?:\s(.+))?$/,
	commands : {}, //will be filled as needed
	commandDictionary : null, //it's null at this point, won't be for long
	listeners : [],
	info : {
		invoked   : 0,
		learned   : 0,
		forgotten : 0,
		start     : new Date,
	},

	parseMessage : function ( msgObj ) {
		if ( !this.validateMessage(msgObj) ) {
			bot.log( msgObj, 'parseMessage invalid' );
			return;
		}

		var msg = this.prepareMessage( msgObj );
		bot.log( msg, 'parseMessage valid' );

		if ( this.banlist.contains(msg.get('user_id')) ) {
			bot.log( msgObj, 'parseMessage banned' );
			//TODO: remove this after testing, and push if block up
			msg.reply( 'You iz in mindjail' );
			return;
		}

		try {
			//it wants to execute some code
			if ( msg.startsWith('>') ) {
				this.eval( msg );
			}
			//it's a command
			else if ( msg.startsWith('/') ) {
				this.parseCommand( msg );
			}
			//see if some hobo listener wants this
			else if ( !this.callListeners(msg) ) {
				//no listener fancied the message. this is the last frontier,
				// so just give up in a fancy, dignified way
				msg.reply(
					'Y U NO MAEK SENSE!? Could not understand `' + msg + '`' );
			}
		}
		catch ( e ) {
			var err = 'Could not process input. Error: ' + e.message;

			if ( e.lineNumber ) {
				err += ' on line ' + e.lineNumber;
			}
			//column isn't part of ordinary errors, it's set in custom ones
			if ( e.column ) {
				err += ' on column ' + e.column;
			}

			msg.directreply( err );
			//make sure we have it somewhere
			console.dir( e );
		}
		finally {
			this.info.invoked += 1;
		}
	},

	prepareMessage : function ( msgObj ) {
		msgObj = this.adapter.transform( msgObj );

		var msg = IO.decodehtmlEntities( msgObj.content );
		return this.Message(
			msg.slice( this.invocationPattern.length ).trim(),
			msgObj );
	},

	parseCommand : function ( msg ) {
		bot.log( msg, 'parseCommand input' );

		var commandParts = this.commandRegex.exec( msg );
		if ( !commandParts ) {
			msg.reply( 'Invalid command ' + msg );
			return;
		}
		bot.log( commandParts, 'parseCommand matched' );

		var commandName = commandParts[ 1 ].toLowerCase();
		//see if there was some error fetching the command
		var cmdObj = this.getCommand( commandName );
		if ( cmdObj.error ) {
			msg.reply( cmdObj.error );
			return;
		}

		if ( !cmdObj.canUse(msg.get('user_id')) ) {
			msg.reply([
				'You do not have permission to use the command ' + commandName,
				"I'm afraid I can't do that, " + msg.get('user_name')
			].random());
			return;
		}

		bot.log( cmdObj, 'parseCommand calling' );

		var args = this.Message( msg.replace(/^\//, '').trim(), msg.get() ),
			res = cmdObj.exec( args );

		if ( res ) {
			msg.reply( res );
		}
	},

	validateMessage : function ( msgObj ) {
		var msg = msgObj.content.trim();
		//all we really care about
		return msg.startsWith( this.invocationPattern );
	},

	addCommand : function ( cmd ) {
		if ( !cmd.exec || !cmd.del ) {
			cmd = this.Command( cmd );
		}
		if ( cmd.learned ) {
			this.info.learned += 1;
		}
		cmd.invoked = 0;

		this.commands[ cmd.name ] = cmd;
		this.commandDictionary.trie.add( cmd.name );
	},

	//gee, I wonder what this will return?
	commandExists : function ( cmdName ) {
		return this.commands.hasOwnProperty( cmdName );
	},

	//if a command named cmdName exists, it returns that command object
	//otherwise, it returns an object with an error message property
	getCommand : function ( cmdName ) {
		if ( this.commandExists(cmdName) ) {
			return this.commands[ cmdName ];
		}
		//set the error margin according to the length
		this.commandDictionary.maxCost = Math.floor(
			cmdName.length / 5 + 1 );

		var msg = 'Command ' + cmdName + ' does not exist.',
		//find commands resembling the one the user entered
		guesses = this.commandDictionary.search( cmdName );

		//resembling command(s) found, add them to the error message
		if ( guesses.length ) {
			msg += ' Did you mean: ' + guesses.join( ', ' );
		}

		return { error : msg };
	},

	//the function women think is lacking in men
	listen : function ( regex, fun, thisArg ) {
		if ( Array.isArray(regex) ) {
			regex.forEach(function ( reg ) {
				this.listen( reg, fun, thisArg );
			}, this);
		}
		else {
			this.listeners.push({
				pattern : regex,
				fun : fun,
				thisArg: thisArg
			});
		}
	},

	callListeners : function ( msg ) {
		var fired = false;

		this.listeners.forEach(function ( listener ) {
			var match = msg.exec( listener.pattern ), resp;

			if ( match ) {
				resp = listener.fun.call( listener.thisArg, msg );

				bot.log( match, resp );
				if ( resp ) {
					msg.reply( resp );
				}

				fired = resp !== false;
			}
		});

		return fired;
	},

	stoplog : false,
	log : function () {
		if ( !this.stoplog ) {
			console.log.apply( console, arguments );
		}
	},

	stop : function () {
		this.stopped = true;
	},
	continue : function () {
		this.stopped = false;
	}
};

//#build eval.js

bot.banlist = JSON.parse( localStorage.bot_ban || '[]' );
bot.banlist.contains = function ( item ) {
	return this.indexOf( item ) >= 0;
};
bot.banlist.add = function ( item ) {
	this.push( item );
	this.save();
};
bot.banlist.remove = function ( item ) {
	var idx = this.indexOf( item ),
		ret = null;

	if ( idx >= 0 ) {
		ret = this.splice( idx, 1 );
	}

	this.save();
	return ret;
};
bot.banlist.save = function () {
	localStorage.bot_ban = JSON.stringify( this );
};

//some sort of pseudo constructor
bot.Command = function ( cmd ) {
	cmd.name = cmd.name.toLowerCase();

	cmd.permissions = cmd.permissions || {};
	cmd.permissions.use = cmd.permissions.use || 'ALL';
	cmd.permissions.del = cmd.permissions.del || 'NONE';

	cmd.description = cmd.description || '';
	cmd.creator = cmd.creator || 'God';
	cmd.invoked = 0;

	//make canUse and canDel
	[ 'Use', 'Del' ].forEach(function ( perm ) {
		var low = perm.toLowerCase();
		cmd[ 'can' + perm ] = function ( usrid ) {
			var canDo = this.permissions[ low ];

			return canDo === 'ALL' || canDo !== 'NONE' &&
				canDo.indexOf( usrid ) > -1;
		};
	});

	cmd.exec = function () {
		this.invoked += 1;
		return this.fun.apply( this.thisArg, arguments );
	};

	cmd.del = function () {
		bot.info.forgotten += 1;
		delete bot.commands[ cmd.name ];
	};

	return cmd;
};
//a normally priviliged command which can be executed if enough people use it
bot.CommunityCommand = function ( command, req ) {
	var cmd = this.Command( command ),
		used = {},
		old_execute = cmd.exec,
		old_canUse  = cmd.canUse;
	req = req || 2;

	cmd.canUse = function () {
		return true;
	};
	cmd.exec = function ( msg ) {
		var err = register( msg.get('user_id') );
		if ( err ) {
			console.log( err );
			return err;
		}
		return old_execute.apply( cmd, arguments );
	};
	return cmd;

	//once again, a switched return statement truthy means a message, falsy
	// means to go on ahead
	function register ( usrid ) {
		if ( old_canUse.call(cmd, usrid) ) {
			return false;
		}

		clean();
		var count = Object.keys( used ).length,
			needed = req - count;
		console.log( used, count, req );

		if ( usrid in used ) {
			return 'Already registered; still need {0} more'.supplant( needed );
		}
		else if ( needed > 0 ) {
			used[ usrid ] = new Date;
			return 'Registered; need {0} more to execute'.supplant( needed-1 );
		}
		console.log( 'should execute' );
		return false; //huzzah!
	}

	function clean () {
		var tenMinsAgo = new Date;
		tenMinsAgo.setMinutes( tenMinsAgo.getMinutes() - 10 );

		Object.keys( used ).reduce( rm, used );
		function rm ( ret, key ) {
			if ( ret[key] < tenMinsAgo ) {
				delete ret[ key ];
			}
			return ret;
		}
	}
};

bot.Message = function ( text, msgObj ) {
	//"casting" to object so that it can be extended with cool stuff and
	// still be treated like a string
	var ret = Object( text );
	ret.content = text;

	var deliciousObject = {
		send : function ( resp ) {
			bot.adapter.out.add( resp, msgObj.room_id );
		},

		reply : function ( resp ) {
			var prefix = bot.adapter.reply( msgObj.user_name );
			this.send( prefix + ' ' + resp );
		},
		directreply : function ( resp ) {
			var prefix = bot.adapter.directreply( msgObj.message_id );
			this.send( prefix + ' ' + resp );
		},

		//parse() parses the original message
		//parse( true ) also turns every match result to a Message
		//parse( msgToParse ) parses msgToParse
		//parse( msgToParse, true ) combination of the above
		parse : function ( msg, map ) {
			if ( !!msg === msg ) {
				map = msg;
				msg = text;
			}
			var parsed = bot.parseCommandArgs( msg || text );

			if ( !map ) {
				return parsed;
			}

			return parsed.map(function ( part ) {
				return bot.Message( part, msgObj );
			});
		},

		//execute a regexp against the text, saving it inside the object
		exec : function ( regexp ) {
			var match = regexp.exec( text );
			this.matches = match ? match : [];

			return match;
		},

		findUserid : function ( username ) {
			var users = [].slice.call( document
					.getElementById( 'sidebar' )
					.getElementsByClassName( 'user-container' )
				);

			//grab a list of user ids
			var ids = users.map(function ( container ) {
				return container.id.match( /\d+/ )[ 0 ];
			});
			//and a list of their names
			var names = users.map(function ( container ) {
				return container.getElementsByTagName( 'img' )[ 0 ]
					.title.toLowerCase().replace( /\s/g, '' );
			});

			var idx = names.indexOf(
				username.toString().toLowerCase().replace( /\s/g, '' ) );
			if ( idx < 0 ) {
				return -1;
			}

			return Number( ids[idx] );
		}.memoize(),

		codify : bot.adapter.codify.bind( bot.adapter ),
		escape : bot.adapter.escape.bind( bot.adapter ),
		link   : bot.adapter.link.bind( bot.adapter ),

		//retrieve a value from the original message object, or if no argument
		// provided, the msgObj itself
		get : function ( what ) {
			if ( !what ) {
				return msgObj;
			}
			return msgObj[ what ];
		},
		set : function ( what, val ) {
			return msgObj[ what ] = val;
		}
	};

	Object.keys( deliciousObject ).forEach(function ( key ) {
		ret[ key ] = deliciousObject[ key ];
	});

	return ret;
};

bot.owners = [
	94197,	//Andy E
	170224, //Ivo Wetzel
	322395, //Loktar
	342129, //Matt McDonald
	418183, //Octavian Damiean
	419970, //Raynos
	617762,	//me (Zirak)
	809950, //Gni33
	829835, //rlemon
	851498, //Florian Margaine
	855760, //Abhishek
	995876  //Esailija
];
bot.isOwner = function ( usrid ) {
	return this.owners.indexOf( usrid ) > -1;
};

IO.register( 'input', bot.parseMessage, bot );

//#build util.js
//#build parseCommandArgs.js
//#build suggestionDict.js

//#build commands.js
//#build listeners.js
}());
