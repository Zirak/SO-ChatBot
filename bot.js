////IO start
var IO = {
	//event handling
	events : {},
	preventDefault : false,

	//register for an event
	register : function ( name, fun, thisArg ) {
		if ( !this.events[name] ) {
			this.events[ name ] = [];
		}
		this.events[ name ].push({
			fun : fun,
			thisArg : thisArg,
			args : Array.prototype.slice.call( arguments, 3 )
		});

		return this;
	},

	unregister : function ( name, fun ) {
		if ( !this.events[name] ) {
			return this;
		}

		this.events[ name ] = this.events[ name ].filter(function ( obj ) {
			return obj.fun !== fun;
		});

		return this;
	},

	//fire event!
	fire : function ( name ) {
		if ( !this.events[name] ) {
			return;
		}

		var args = Array.prototype.slice.call( arguments, 1 );

		this.events[ name ].forEach( fireEvent, this);

		function fireEvent( evt ) {
			var call = evt.fun.apply( evt.thisArg, evt.args.concat(args) );

			if ( call === false ) {
				this.preventDefault = true;
			}
		}
	},

	//sends a JSON-data xhr
	xhr : (function ( props ) {
		var defaults = {
			url : null,
			method : 'GET',
			data : {},
			load : function(){},
			complete : function(){},
			success : function(){},
			fail : function(){},
			abort : function(){}
		},
		//event listener names
			listeners = {
			load : true,
			success : true,
			fail : true,
			abort : true
		};

		function toFormData ( obj ) {
			var ret = new FormData();
			Object.keys( obj ).forEach(function ( key ) {
				ret.append( key, obj[key] );
			});

			return ret;
		}

		return function ( props ) {
			props = Object.merge( defaults, props );

			var xhr = new XMLHttpRequest();

			//attach all needed event listeners
			Object.keys( listeners ).forEach(function ( listenerName ) {
				xhr.addEventListener( listenerName, props[listenerName] );
			});

			xhr.addEventListener( 'readystatechange', function () {
				if ( xhr.readyState === 4 ) {
					props.complete.call( xhr, xhr.responseText, xhr );
				}
			});

			xhr.open( props.method, props.url );
			xhr.send( toFormData(props.data) );


			return xhr;
		};
	}()),

	jsonp : function ( opts ) {
		var script = document.createElement( 'script' ),
			semiRandom = 'IO_' + ( Date.now() * Math.ceil(Math.random()) );

		window[ semiRandom ] = function () {
			opts.fun.apply( opts.thisArg, arguments );

			//cleanup
			window[ semiRandom ] = null;
			script.parentNode.removeChild( script );
		};

		if ( opts.url.indexOf('?') === -1 ) {
			opts.url += '?';
		}
		script.src = opts.url + '&jsonp=' + semiRandom;

		document.head.appendChild( script );
	},

	loadScript : function ( url ) {
		var script = document.createElement( 'script' );
		script.src = url;
		document.head.appendChild( script );
	}
};

//build IO.in and IO.out
[ 'in', 'out' ].forEach(function ( dir ) {
	var fullName = dir + 'put';

	IO[ dir ] = {
		buffer : [],

		receive : function ( obj ) {
			IO.fire( 'receive' + fullName, obj );

			if ( IO.preventDefault ) {
				console.log( obj, 'preventDefault' );
				IO.preventDefault = false;
				return this;
			}

			this.buffer.push( obj );

			return this;
		},

		//unload the next item in the buffer
		tick : function () {
			if ( this.buffer.length ) {
				IO.fire( fullName, this.buffer.shift() );
			}

			return this;
		},

		//unload everything in the buffer
		flush : function () {
			IO.fire( 'before' + fullName );

			if ( !this.buffer.length ) {
				return this;
			}

			var i = this.buffer.length;
			while( i --> 0 ) {
				this.tick();
			}

			IO.fire( 'after' + fullName );

			this.buffer = [];

			return this;
		}
	};
});
////IO end

////bot start
var bot = {
	name : 'Zirak',
	invocationPattern : '!!',

	roomid : location.pathname.match( /\d+/ )[ 0 ],

	commandRegex : /^\/([\w\-\_]+)\s*(.+)?$/,
	commands : {}, //will be filled as needed

	codifyOutput : false,

	stopped : false,

	dependencies : {
		commands : 'https://raw.github.com/Titani/SO-ChatBot/master/commands.js',
		hangman : 'https://raw.github.com/Titani/SO-ChatBot/master/hangman.js'
	},

	//common elements
	elems : {
		input : document.getElementById( 'input' ),
		codify : document.getElementById( 'codify-button' ),
		send : document.getElementById( 'sayit-button' ),

		//for my local testing
		output : document.getElementById( 'output' ) ||
			document.createElement( 'pre' )
	},

	parseMessage : function ( msgObj ) {
		console.log( msgObj, 'parseMessage input' );

		if ( !this.validateMessage(msgObj) ) {
			console.log( msgObj, 'parseMessage invalid' );
			return;
		}

		var msg = this.cleanMessage( msgObj.content ),
			usr = msgObj.user_name;
		msg = msg.slice( this.invocationPattern.length ).trim();

		console.log( msg, 'parseMessage valid' );

		try {
			//it's a command
			if ( msg.startsWith('/') ) {
				console.log( msg, 'parseMessage command' );
				this.parseCommand( msg, msgObj );
				return;
			}

			console.log( msg, 'parseMessage guess' );
			//if it's valid and not a comment, fire an event and let someone
			// else (or noone) worry about it
			IO.fire( 'messageReceived', msg, msgObj.user_name );
		}
		catch ( e ) {
			var err = 'Could not process input. Error: ';
			err += e.message;

			if ( e.lineNumber ) {
				err += ' on line ' + e.lineNumber;
			}

			this.reply( err, usr );
			throw e;
		}
	},

	parseCommand : function ( cmd, msgObj ) {
		console.log( cmd, 'parseCommand input' );

		if ( !this.commandRegex.test(cmd) ) {
			bot.reply( 'Invalid command ' + cmd );
		}

		var commandParts = cmd.match( this.commandRegex ),
			commandName = commandParts[ 1 ].toLowerCase(),
			commandArgs = commandParts[ 2 ] || '',

			usr = msgObj.user_name;

		console.log( commandParts, 'parseCommand matched' );

		if ( !this.commandExists(commandName) ) {
			bot.reply( 'Unidentified command ' + commandName, usr );
			return;
		}

		var cmdObj = this.commands[ commandName ];

		if ( !cmdObj.canUse(usr) ) {
			bot.reply(
				'You do not have permission to use the command ' + commandName,
				usr
			);
			return;
		}

		bot.directReply(
			cmdObj.fun.call( cmdObj.thisArg, commandArgs, msgObj ),
			msgObj.message_id
		);
	},

	validateMessage : function ( msgObj ) {
		if ( this.stopped ) {
			return false;
		}

		var pathParts = location.pathname.split( '/' );

		if ( msgObj.room_id !== this.roomid ) {
			console.log(
				msgObj.room_id,
				this.roomid,
				'validateMessage different room'
			);
			return false;
		}

		var msg = msgObj.content.toLowerCase().trim();

		//all we really care about
		if ( !msg.startsWith(this.invocationPattern) ) {
			return false;
		}

		return true;
	},

	commandExists : function ( cmdName ) {
		return this.commands.hasOwnProperty( cmdName );
	},

	cleanMessage : (function () {
		var htmlEntities = {
			'&quot;' : '"',
			'&amp;'  : '&',
			'&#39;'  : '\''
		};

		return function ( msg ) {
			msg = msg.trim();

			Object.keys( htmlEntities ).forEach(function ( entity ) {
				var regex = new RegExp( entity, 'g' );
				msg = msg.replace( regex, htmlEntities[entity] );
			});

			return msg;
		};
	}()),

	reply : function ( msg, usr ) {
		this.output( '@' + usr + ' ' + msg );
	},

	directReply : function ( msg, repliedID ) {
		this.output( ':' + repliedID + ' ' + msg );
	},

	output : function ( msg ) {
		IO.out.receive( msg );
	},

	//prepare msg to be sent
	addOutput : function ( msg ) {
		this.elems.input.value += msg + '\n';
	},

	//actually send the output
	sendOutput : function () {
		var message = this.elems.input.value;

		this.elems.output.textContent += message;

		IO.xhr({
			url : '/chats/' + this.roomid + '/messages/new',
			type : 'POST',
			data : {
				text : message,
				fkey : fkey().fkey
			}
		});
	},

	//some sugar
	addCommand : function ( cmd ) {
		cmd.permissions = cmd.permissions || {};
		cmd.permissions.use = cmd.permissions.use || 'ALL';
		cmd.permissions.del = cmd.permissions.del || 'NONE';

		cmd.description = cmd.description || '';

		cmd.canUse = function ( usrName ) {
			return this.permissions.use === 'ALL' ||
				this.permissions.use !== 'NONE' &&
				this.permissions.use.indexOf( usrName ) > -1;
		};

		cmd.canDel = function ( usrName ) {
			return this.permissions.del !== 'NONE' &&
				this.permissions.del === 'ALL' ||
				this.permissions.del.indexOf( usrName ) > -1;
		};

		cmd.del = function () {
			
		};

		this.commands[ cmd.name ] = cmd;
	},

	stop : function () {
		this.stopped = true;
	}
};

IO.register( 'receiveinput', bot.validateMessage, bot );
IO.register( 'input', bot.parseMessage, bot );
IO.register( 'output', bot.addOutput, bot );
IO.register( 'afteroutput', bot.sendOutput, bot );
////bot ends

////utility start
var polling = {
	//used in the SO chat requests, dunno exactly what for
	times : {},

	pollInterval : 5000,

	init : function () {
		var that = this,
			roomid = location.pathname.match( /\d+/ )[ 0 ];

		IO.xhr({
			url : '/chats/' + roomid + '/events',
			method : 'POST',
			data : fkey({
				since : 0,
				mode : 'Messages',
				msgCount : 0
			}),

			complete : finish
		});

		function finish ( resp ) {
			resp = JSON.parse( resp );

			that.times[ 'r' + roomid ] = resp.time;

			setTimeout(function () {
				that.poll();
			}, that.pollInterval );
		}
	},

	poll : function () {
		var that = this;

		IO.xhr({
			url : '/events',
			method : 'POST',
			data : Object.merge( fkey(), that.times, {foo : 'bar'} ),
			complete : that.complete.bind( that )
		});
	},

	complete : function ( resp ) {
		resp = JSON.parse( resp );
	
		if ( !resp ) {
			return;
		}

		var that = this;
		Object.keys( resp ).forEach(function ( key ) {
			var msgObj = resp[ key ];

			if ( msgObj.t ) {
				that.times[ key ] = msgObj.t;
			}

			if ( msgObj.e ) {
				msgObj.e.forEach( that.handleMessageObject );
			}
		});

		IO.in.flush();
		IO.out.flush();

		setTimeout(function () {
			that.poll();
		}, this.pollInterval );
	},

	handleMessageObject : function ( msg ) {
		//event_type of 1 means new message
		if ( msg.event_type !== 1 ) {
			return;
		}
		//add the message to the input buffer
		IO.in.receive( msg );
	}
};

//small utility functions
Object.merge = function () {
	return [].reduce.call( arguments, function ( ret, merger ) {

		Object.keys( merger ).forEach(function ( key ) {
			ret[ key ] = merger[ key ];
		});

		return ret;
	}, {} );
};
String.prototype.indexesOf = function ( str ) {
	var part = this.valueOf(),

		//we use offset to determine the absolute distance from beginning
		index, offset = 0,
		len = str.length,
		ret = [];

	while ( (index = part.indexOf(str)) >= 0 ) {
		ret.push( index + offset );
		part = part.slice( index + len );
		offset += index + len;
	}

	return ret;
};
String.prototype.startsWith = function ( str ) {
	return this.indexOf( str ) === 0;
};
////utility end