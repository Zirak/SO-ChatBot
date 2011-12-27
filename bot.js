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
	name : '!',

	commandRegex : /^\/([\w\-\_]+)\s*(.+)?$/,

	commands : {}, //will be filled as needed

	codifyOutput : false,

	//common elements
	elems : {
		input : document.getElementById( 'input' ),
		codify : document.getElementById( 'codify-button' ),
		send : document.getElementById( 'sayit-button' ),

		//for my local testing
		output : document.getElementById( 'output' ) ||
			document.createElement( 'pre' )
	},

	stopped : false,

	parseMessage : function ( msgObj ) {
		console.log( msgObj, 'parseMessage input' );
		if ( !this.validateMessage(msgObj) ) {
			console.log( msgObj, 'parseMessage invalid' );
			return;
		}

		var msg = msgObj.content.trim(),
			usr = msgObj.user_name;
		msg = msg.slice( this.name.length + 1 ).trim();

		console.log( msg, 'parseMessage valid' );

		try {
			//it's a command
			if ( msg.startsWith('/') ) {
				console.log( msg, 'parseMessage command' );
				this.parseCommand( msg, usr );
				return;
			}

			console.log( msg, 'parseMessage guess' );
			//if it's valid and not a comment, fire an event and let someone
			// else (or noone) worry about it
			IO.fire( 'messageReceived', msg, usr );
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

	parseCommand : function ( cmd, usr ) {
		console.log( cmd, 'parseCommand input' );
		var commandParts = cmd.match( this.commandRegex ),
			commandName = commandParts[ 1 ].toLowerCase(),
			commandArgs = commandParts[ 2 ] || '';
		
		console.log( commandParts, 'parseCommand matched' );

		if ( !this.commands.hasOwnProperty(commandName) ) {
			this.reply( 'Invalid command ' + commandName, usr );
			return;
		}

		bot.reply(
			this.commands[ commandName ]( commandArgs, usr ),
			usr
		);
	},

	validateMessage : function ( msgObj ) {
		if ( this.stopped ) {
			return false;
		}

		var pathParts = location.pathname.split( '/' ),
			id = parseFloat( pathParts[2] );
		if ( msgObj.room_id !== id ) {
			console.log( msgObj.room_id, id, 'validateMessage different room' );
			return false;
		}

		var msg = msgObj.content.toLowerCase().trim();

		//all we really care about
		if ( !msg.startsWith('!' + this.name) ) {
			return false;
		}

		return true;
	},

	reply : function ( msg, usr ) {
		this.output( '@' + usr + ' ' + msg );
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
		this.elems.output.textContent += this.elems.input.value;
		//return;

		if ( this.codifyOutput ) {
			this.elems.codify.click();
			this.codifyOutput = false;
		}
		this.elems.send.click();
		
		this.elems.input.value = '';
	},

	//some sugar
	addCommand : function ( cmdName, cmd ) {
		this.commands[ cmdName ] = cmd;
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

////commands start
var commands = {
	die : function ( args, usr ) {
		if ( this.stopped ) {
			return 'Kill me once, shame on you, kill me twice...';
		}
		bot.stop();
		return 'You killed me!';
	},

	learn : function ( args, usr ) {
		console.log( args, 'learn input' );

		Object.keys( htmlEntities ).forEach(function ( entity ) {
			var regex = new RegExp( entity, 'g' );
			args = args.replace( regex, htmlEntities[entity] );
		});
		console.log( args, 'learn filtered' );

		var commandParts = parseTextCommand( args ),
			command = {
				name : commandParts[ 0 ],
				output : commandParts[ 1 ],
				input : commandParts[ 2 ] || '.*',
			};
		
		console.log( commandParts, 'learn parsed' );
		if ( !command.name || !command.input || !command.output ) {
			bot.reply( 'Illegal /learn object ' + args, usr );
			return;
		}

		if ( commands[command.name] ) {
			bot.reply( 'Command ' + command.name + ' already exists', usr );
			return;
		}

		//a shitty way to do it, I know
		if ( !(command.input instanceof Object) ) {
			command.input = {
				pattern : command.input,
				flags : ''
			};
		}

		command.input.pattern = command.input.pattern.replace(
			/~./g,
			function ( c ) {
				c = c.charAt( 1 );
				if ( c === '~' ) {
					return '~';
				}
				return '\\' + c;
			}
		);

		var pattern;
		try {
			pattern = new RegExp( command.input.pattern, command.input.flags );
		}
		catch ( e ) {
			bot.reply( e.message, usr );
			throw e;
		}
		console.log( pattern );

		var out = command.output;

		bot.addCommand( command.name, function ( args, usr ) {
			console.log( args, command.name + ' input' );

			var msg = args.replace( pattern, function () {
				var parts = arguments;

				console.log( parts, command.name + ' replace #1' );

				return out.replace( /\$(\d+)/g, function ( $0, $1 ) {
					return parts[ $1 ];
				});

			});

			console.log( msg, command.name + ' output' );
			return msg;
		});

		return 'Command ' + command.name + ' learned';
	},

	mdn : function ( args ) {
		var parts = args.trim().split( '.' ),
			base = 	'https://developer.mozilla.org/en/',
			url;
		
		console.log( args, parts, 'mdn input' );

		if (
			parts[0] === 'document' ||
			parts[0] === 'Node' ||
			parts[0] === 'element'
		) {
			url = base + 'DOM/' + args;
			console.log( url, 'mdn DOM' );
		}

		else if ( window[parts[0]] ) {
			url = base +
				  'JavaScript/Reference/Global_Objects/' +
				  parts.join( '/' );
			console.log( url, 'mdn global' );
		}

		else {
			url = 'https://developer.mozilla.org/en-US/search?q=' + args;
			console.log( url, 'mdn unknown' );
		}

		return url;
	},

	jquery : function ( args ) {
		args = args.trim().replace( /^\$/, 'jQuery' );

		var parts = args.split( '.' ), exists = false, msg;
		//parts will contain two likely components, depending on the user input
		// user gave jQuery.prop - parts[0] will be jQuery, parts[1] will
		//  be prop
		// user gave prop - parts[0] will be prop
		// user gave jQuery.fn.prop - that's a special case

		console.log( args, parts, 'jQuery input' );

		//jQuery API urls works like this:
		// if it's on the jQuery object, then the url is /jQuery.property
		// if it's on the proto, then the url is /property

		//user gave something like jQuery.fn.prop, turn that to just prop
		if ( parts.length === 3 ) {
			parts = [ parts[2] ];
		}

		//check to see if it's a property on the jQuery object itself
		if ( parts[0] === 'jQuery' && jQuery[parts[1]] ) {
			exists = true;
		}

		//user wants something on the prototype?
		else if ( parts.length === 1 && jQuery.prototype[parts[0]] ) {
			exists = true;
		}

		//user just wanted a property? maybe.
		else if ( jQuery[parts[0]] ) {
			args = 'jQuery.' + parts[0];
			exists = true;
		}

		if ( exists ) {
			msg = 'http://api.jquery.com/' + args;
		}
		else {
			msg = 'Could not find specified jQuery property ' + args;
		}
		console.log( msg, 'jQuery link' );

		return msg;
	},

	online : function () {
		var avatars = document.getElementById('present-users')
				.getElementsByClassName('avatar');

		return [].map.call(
			avatars,
			function ( wrapper ) {
				return wrapper.children[ 0 ].title;
		}).join( ', ' );
	}
};
Object.keys( commands ).forEach(function ( cmdName ) {
	bot.addCommand( cmdName, commands[cmdName] );
});

var htmlEntities = {
	'&quot;' : '"',
	'&amp;'  : '&'
};

function parseTextCommand ( text ) {

	var char, quotes = 0, commands = [], buffer = '', space = false;

	for ( var i = 0, len = text.length; i < len; i++ ) {
		char = text.charAt( i );
		switch ( char ) {
		case '"':
			if ( quotes === 1 ) { 
				buffer += char;
			}
			else {
				quotes = quotes ? 0 : 2;
			}
		break;

		case "'":
			if ( quotes === 2 ) { 
				buffer += char;
			}
			else {
				quotes = quotes ? 0 : 1;
			}
		break;

		case " ":
			if ( !quotes ) {
				if ( space ) {
					break;
				}
				space = true;
				commands.push( buffer );
				buffer = '';
				break;
			}
		// intentional fallthrough

		default:
			space = false;
			buffer += char;
		}
	}
	commands.push(buffer);


	return commands;
}
////commands end

////utility start
//hijack xhr to monitor all incoming requests
XMLHttpRequest.prototype.open = (function(){
	//keep a reference to the old one (will be used to call it later)
	var old = XMLHttpRequest.prototype.open;

	return function(){
		//we only care about the finished reuqests
		this.addEventListener( "load", function(){

			var parsed;
			try {
				parsed = JSON.parse( this.responseText );
			}
			//if there's a parsing error, just ignore the request
			catch ( e ) {
				return;
			}

			handleMessageObject( parsed );

			//handle all messages that came,
			IO.in.flush();
			IO.out.flush();
		});

		//call the old version
		return old.apply( this, arguments );
	};

	//handle a request object
	function handleMessageObject( obj ) {
		Object.keys( obj ).forEach(function ( key ) {

			//I can't intelligently explain this part. you gotta sniff around
			// how SO sends message data to get this
			var msgObj = obj[ key ];
			if ( msgObj.e && msgObj.e[0] ) {
				msgObj.e.forEach( handleMessage );
			}
		});
	}

	//handle an individual message object
	function handleMessage ( msg ) {
		//event_type of 1 means new message
		if ( msg.event_type !== 1 ) {
			return;
		}
		//add the message to the input buffer and then handle it
		IO.in.receive( msg );
	}

}());

//small utility functions
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