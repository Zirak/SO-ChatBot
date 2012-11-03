(function () {
"use strict";

var bot = window.bot = {
	invocationPattern : '!!',

	roomid : Number( /\d+/.exec(location)[0] ),

	commandRegex : /^\/\s?([\w\-]+)(?:\s(.+))?$/,
	commands : {}, //will be filled as needed
	commandDictionary : null, //it's null at this point, won't be for long
	listeners : [],

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
			//it's a command
			if ( msg.startsWith('/') ) {
				this.parseCommand( msg );
			}

			//it wants to execute some code
			else if ( msg.startsWith('>') ) {
				this.eval( msg );
			}

			//see if some hobo listener wants this
			else {
				this.callListeners( msg );
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
			//make sure we have it documented
			console.error( e, err );
		}
	},

	prepareMessage : function ( msgObj ) {
		msgObj = this.adapter.transform( msgObj );

		var msg = IO.decodehtmlEntities( msgObj.content );

		return this.Message(
			msg.slice( this.invocationPattern.length ).trim(),
			msgObj
		);
	},

	parseCommand : function ( msg ) {
		bot.log( msg, 'parseCommand input' );

		var commandParts = this.commandRegex.exec( msg );
		if ( !commandParts ) {
			msg.reply( 'Invalid command ' + msg );
			return;
		}

		var commandName = commandParts[ 1 ].toLowerCase();

		bot.log( commandParts, 'parseCommand matched' );

		//see if there was some error fetching the command
		var cmdObj = this.getCommand( commandName );
		if ( cmdObj.error ) {
			msg.reply( cmdObj.error );
			return;
		}

		if ( !cmdObj.canUse(msg.get('user_id')) ) {
			msg.reply(
				'You do not have permission to use the command ' +
					commandName
			);
			return;
		}

		bot.log( cmdObj, 'parseCommand calling' );

		var args = this.Message(
			//+ 1 is for the / in the message
			msg.slice( commandName.length + 1 ).trim(),
			msg.get()
		);
		var res = cmdObj.exec( args );

		if ( res ) {
			msg.reply( res );
		}
	},

	validateMessage : function ( msgObj ) {
		var msg = msgObj.content.trim();

		//all we really care about
		return msg.startsWith( this.invocationPattern );
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
			cmdName.length / 5 + 1
		);

		var msg = 'Command ' + cmdName + ' does not exist.',
		//find commands resembling the one the user entered
		guesses = this.commandDictionary.search( cmdName );

		//resembling command(s) found, add them to the error message
		if ( guesses.length ) {
			msg += ' Did you mean: ' + guesses.join( ', ' );
		}

		return {
			error : msg
		};
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

				if ( resp !== false ) {
					fired = true;
				}
			}
		});

		//no listener fancied the message. this is the last frontier, so just
		// give up in a fancy, dignified way
		if ( !fired ) {
			msg.reply(
				'Y U NO MAEK SENSE!? Could not understand `' + msg + '`'
			);
		}
	},

	//the next two functions shouldn't be here, but as of yet no real adapter
	// mechanism, so you could fit this bot into other chats, has been planned
	reply : function ( msg, msgObj ) {
		var reply = this.adapter.reply( msg, msgObj );
		this.adapter.out.add( reply, msgObj.room_id );
	},

	directreply : function ( msg, msgObj ) {
		var reply = this.adapter.directreply( msg, msgObj );
		this.adapter.out.add( reply, msgObj.room_id );
	},

	//some awesome in function form
	addCommand : function ( cmd ) {
		if ( !cmd.exec || !cmd.del ) {
			cmd = this.Command( cmd );
		}

		this.commands[ cmd.name ] = cmd;
		this.commandDictionary.trie.add( cmd.name );
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

bot.banlist = [];
bot.banlist.contains = function ( item ) {
	return this.indexOf( item ) >= 0;
};
bot.banlist.add = function ( item ) {
	return this.push( item );
};
bot.banlist.remove = function ( item ) {
	var idx = this.indexOf( item );
	if ( idx >= 0 ) {
		return this.splice( idx, 1 );
	}
	else {
		return null;
	}
};

//execute arbitrary js code in a relatively safe environment
bot.eval = function ( msg ) {
	var timeout,
		worker = new Worker( 'codeWorker.js' );

	worker.onmessage = function ( evt ) {
		clearTimeout( timeout );
		finish( dressUpAnswer(evt.data) );
	};

	worker.onerror = function ( error ) {
		clearTimeout( timeout );
		finish( error.toString() );
	};

	worker.postMessage({
		code : msg.content.substr( 1 )
	});

	timeout = window.setTimeout(function() {
		finish( 'Maximum execution time exceeded' );
	}, 50 );

	function finish ( result ) {
		worker.terminate();
		msg.directreply( result );
	}

	function dressUpAnswer ( answerObj ) {
		var answer = answerObj.answer,
			log = answerObj.log,
			result;

		result = snipAndCodify( answer );

		if ( log && log.length ) {
			result += ' Logged: ' + snipAndCodify( log ) + '';
		}

		return result;
	}
	function snipAndCodify ( str ) {
		var ret;

		if ( str.length > 400 ) {
			ret = '(snip) `' +  str.slice(0, 400) + '`';
		}
		else {
			ret = '`' + str +'`';
		}

		return ret;
	}
};

//some sort of pseudo constructor
bot.Command = function ( cmd ) {
	cmd.name = cmd.name.toLowerCase();

	cmd.permissions = cmd.permissions || {};
	cmd.permissions.use = cmd.permissions.use || 'ALL';
	cmd.permissions.del = cmd.permissions.del || 'NONE';

	cmd.description = cmd.description || '';

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
		return this.fun.apply( this.thisArg, arguments );
	};

	cmd.del = function () {
		delete bot.commands[ cmd.name ];
	};

	return cmd;
};

bot.Message = function ( text, msgObj ) {
	//"casting" to object so that it can be extended with cool stuff and
	// still be treated like a string
	var ret = Object( text );
	ret.content = text;

	var deliciousObject = {
		respond : function ( resp ) {
			bot.adapter.out.add( resp, msgObj.room_id );
		},

		reply : function ( resp, usrname ) {
			usrname = usrname || msgObj.user_name;

			bot.reply( resp, Object.merge(msgObj, {user_name : usrname}) );
		},
		directreply : function ( resp, msgid ) {
			msgid = msgid || msgObj.message_id;

			bot.directreply(
				resp,
				Object.merge( msgObj, { message_id : msgid } )
			);
		},

		codify : function ( msg ) {
			return bot.adapter.codify( msg );
		},

		escape : function ( msg ) {
			return bot.adapter.escape( msg );
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
					.title.toLowerCase();
			});

			var idx = names.indexOf( username.toString().toLowerCase() );
			if ( idx < 0 ) {
				return undefined;
			}

			return Number( ids[idx] );
		}.memoize(),

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
	419970, //Raynos
	342129, //Matt McDonald
	170224, //Ivo Wetzel
	94197,	//Andy E
	617762	//me (Zirak)
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
