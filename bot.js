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

	//it's a very incomplete, non-comprehensive implemantation, since I only
	// use it for POST requests
	xhr : function ( params ) {
		if ( typeof params.data === 'object' ) {
			params.data = IO.urlstringify( params.data );
		}

		var xhr = new XMLHttpRequest();
		xhr.open( params.method || 'GET', params.url );

		xhr.addEventListener( 'readystatechange', function () {
			if ( xhr.readyState === 4 ) {
				if ( params.complete && params.complete.call ) {
					params.complete.call(
						params.thisArg, xhr.responseText, xhr
					);
				}
			}
		});

		xhr.setRequestHeader(
			'Content-Type', 'application/x-www-form-urlencoded'
		);

		xhr.send( params.data );

		return xhr;
	},

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

		if ( typeof opts.data === 'object' ) {
			opts.url += IO.urlstringify( opts.data );
		}
		opts.jsonpName = opts.jsonpName || 'jsonp';

		script.src = opts.url + '&' + opts.jsonpName + '=' + semiRandom;

		document.head.appendChild( script );
	},

	urlstringify : (function () {
		//simple types, for which toString does the job
		//used in singularStringify
		var simplies = { number : true, string : true, boolean : true };

		var singularStringify = function ( thing ) {
			if ( typeof thing in simplies ) {
				return encodeURIComponent( thing.toString() );
			}
			return '';
		};

		var arrayStringify = function ( array, keyName ) {
			keyName = singularStringify( keyName );

			return array.map(function ( thing ) {
				return keyName + '=' + singularStringify( thing );
			});
		};

		return function ( obj ) {
			return Object.keys( obj ).map(function ( key ) {
				var val = obj[ key ];

				if ( Array.isArray(val) ) {
					return arrayStringify( val, key );
				} else {
					return singularStringify(key) +
						'=' + singularStringify( val );
				}
			}).join( '&' );
		};
	}()),

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
var baseRepURL = 'https://raw.github.com/Titani/SO-ChatBot/master/';
var bot = {
	name : 'Zirak',
	invocationPattern : '!!',

	roomid : parseFloat( location.pathname.match(/\d+/)[0] ),

	commandRegex : /^\/([\w\-\_]+)\s*(.+)?$/,
	commands : {}, //will be filled as needed
	listeners : [],

	codifyOutput : false,

	stopped : false,

	dependencies : {
		commands : baseRepURL + 'commands.js',
		listeners : baseRepURL + 'listeners.js',
		//hangman  : baseRepURL + 'plugins/hangman.js',
		todo     : baseRepURL + 'plugins/todolist.js'
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

		//"casting" to object so that it can be extended with cool stuff in
		// makeMessage
		var msg = this.cleanMessage(msgObj.content);
		msg = msg.slice( this.invocationPattern.length ).trim();

		msg = makeMessage( msg, msgObj );

		console.log( msg, 'parseMessage valid' );

		try {
			//it's a command
			if ( msg.startsWith('/') ) {
				console.log( msg, 'parseMessage command' );
				this.parseCommand( msg );
				return;
			}

			//see if some hobo listener wants this
			this.callListeners( msg );

			//Feuer Sie das Ereignis!
			IO.fire( 'messageReceived', msg );
		}
		catch ( e ) {
			var err = 'Could not process input. Error: ' + e.message;

			if ( e.lineNumber ) {
				err += ' on line ' + e.lineNumber;
			}

			msg.directreply( err );

			console.error( err, e );
		}
	},

	parseCommand : function ( msg ) {
		console.log( msg, 'parseCommand input' );

		var commandParts = this.commandRegex.exec( msg );
		if ( !commandParts ) {
			msg.reply( 'Invalid command ' + msg );
		}

		var commandName = commandParts[ 1 ].toLowerCase();

		console.log( commandParts, 'parseCommand matched' );

		if ( !this.commandExists(commandName) ) {
			msg.reply( 'Unidentified command ' + commandName );
			return;
		}

		var cmdObj = this.commands[ commandName ];

		if ( !cmdObj.canUse(msg.get('user_id')) ) {
			msg.reply(
				'You do not have permission to use the command ' +
					commandName
			);
			return;
		}

		console.log( cmdObj, 'parseCommand calling' );

		var args = makeMessage(
			//+ 1 is for the /
			msg.slice( commandName.length + 1 ).trim(),
			msg.get()
		);
		var res = cmdObj.fun.call( cmdObj.thisArg, args );

		if ( res ) {
			msg.reply( res );
		}
	},

	validateMessage : function ( msgObj ) {
		if ( this.stopped ) {
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
		//some html entities to replace
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

	listen : function ( regex, fun, thisArg ) {
		this.listeners.push({
			pattern : regex,
			fun : fun,
			thisArg: thisArg
		});
	},

	callListeners : function ( msg ) {
		this.listeners.forEach(function ( listener ) {
			var match = msg.exec( listener.pattern ), resp;

			if ( match ) {
				resp = listener.fun.call( listener.thisArg, msg );
			}
			console.log( match, resp );
			if ( resp ) {
				msg.reply( resp );
			}
		});
	},

	reply : function ( msg, msgObj, codify ) {
		var usr = msgObj.user_name, roomid = msgObj.room_id;

		output.add( '@' + usr + ' ' + msg, roomid, codify );
	},

	directreply : function ( msg, msgObj, codify ) {
		var msgid = msgObj.message_id, roomid = msgObj.room_id;
		output.add( ':' + msgid + ' ' + msg, roomid, codify );
	},

	//some awesome
	addCommand : function ( cmd ) {
		cmd.name = cmd.name.toLowerCase();

		cmd.permissions = cmd.permissions || {};
		cmd.permissions.use = cmd.permissions.use || 'ALL';
		cmd.permissions.del = cmd.permissions.del || 'NONE';

		cmd.description = cmd.description || '';

		cmd.canUse = function ( usrid ) {
			var use = this.permissions.use;
			return use === 'ALL' || use !== 'NONE' &&
				use.indexOf( usrid ) > -1;
		};

		cmd.canDel = function ( usrid ) {
			var del = this.permissions.del;
			return del !== 'NONE' && del === 'ALL' ||
				del.indexOf( usrid ) > -1;
		};

		cmd.del = function () {
			delete bot.commands[ cmd.name ];
		};

		this.commands[ cmd.name ] = cmd;
	},

	stop : function () {
		this.stopped = true;
	}
};

IO.register( 'receiveinput', bot.validateMessage, bot );
IO.register( 'input', bot.parseMessage, bot );

var makeMessage = function ( text, msgObj ) {
	text = Object( text );

	var deliciousObject = {
		respond : function ( resp ) {
			output.add({
				text : resp,
				roomid : msgObj.room_id
			});
		},

		reply : function ( resp, usrname ) {
			usrname = usrname || msgObj.user_name;

			bot.reply( resp, Object.merge(
				msgObj, {user_name : usrname}
			));
		},
		directreply : function ( resp, msgid ) {
			msgid = msgid || msgObj.message_id;

			bot.directreply( resp, Object.merge(
				msgObj, {message_id : msgid}
			));
		},

		exec : function ( regexp ) {
			var match = regexp.exec( text );
			this.matches = match ? match : [];

			return match;
		},

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
		text[ key ] = deliciousObject[ key ];
	});

	return text;
};
////bot ends

////utility start
var polling = {
	//used in the SO chat requests, dunno exactly what for, but guessing it's
	// the latest id or something like that
	times : {},

	pollInterval : 5000,

	init : function () {
		var that = this,
			roomid = location.pathname.match( /\d+/ )[ 0 ];

		IO.xhr({
			url : '/chats/' + roomid + '/events/',
			data : fkey({
				since : 0,
				mode : 'Messages',
				msgCount : 0
			}),
			method : 'POST',
			complete : finish
		});

		function finish ( resp ) {
			resp = JSON.parse( resp );
			console.log( resp );

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
			data : fkey( that.times ),
			method : 'POST',
			complete : that.complete,
			thisArg : that
		});
	},

	complete : function ( resp ) {
		if ( !resp ) {
			return;
		}
		resp = JSON.parse( resp );

		var that = this;
		Object.keys( resp ).forEach(function ( key ) {
			var msgObj = resp[ key ];

			if ( msgObj.t ) {
				that.times[ key ] = msgObj.t;
			}

			if ( msgObj.e ) {
				msgObj.e.forEach( that.handleMessageObject, that );
			}
		});

		IO.in.flush();
		IO.out.flush();

		setTimeout(function () {
			that.poll();
		}, this.pollInterval );
	},

	handleMessageObject : function ( msg ) {
		//event_type of 1 means new message, 2 means edited message
		if ( msg.event_type !== 1 && msg.event_type !== 2 ) {
			return;
		}

		//check for a multiline message
		var multiline;
		if ( msg.content.startsWith( '<div class=\'full\'>') ) {
			//remove the enclosing tag
			multiline = msg.content
				.slice( 0, msg.content.lastIndexOf('</div>') )
				.replace( '<div class=\'full\'>', '' );

			multiline.split( '<br>' ).forEach(function ( line ) {
				line = line.trim();
				this.handleMessageObject(
					Object.merge( msg, { content : line })
				);
			}, this );

			return;
		}

		//add the message to the input buffer
		IO.in.receive( msg );
	}
};
polling.init();

var output = {
	messages : {},

	add : function ( msg, roomid, codify ) {
		roomid = roomid || bot.roomid;
		IO.out.receive({
			text : msg + '\n',
			room : roomid
		});
	},

	build : function ( obj ) {
		if ( !this.messages[obj.room] ) {
			this.messages[ obj.room ] = '';
		}
		this.messages[ obj.room ] += obj.text;
		this.messages[ obj.room ].codify = obj.codify;
	},

	send : function () {
		Object.keys( this.messages ).forEach(function ( room ) {
			var message = this.messages[ room ];

			if ( !message ) {
				return;
			}

			if ( message.codify ) {
				bot.elems.input.value = message;
				bot.elems.codify.click();
				message = bot.elems.input.value;
			}

			this.sendToRoom({
				text   : message,
				room   : room,
				codify : message.codify
			});

			this.messages[ room ] = '';
		}, this );
	},

	sendToRoom : function ( obj ) {
		IO.xhr({
			url : '/chats/' + obj.room + '/messages/new',
			data : {
				text : obj.text,
				fkey : fkey().fkey
			},
			method : 'POST',
			complete : complete
		});

		function complete ( resp, xhr ) {
			console.log( xhr.status );

			//conflict, wait for next round to send message
			if ( xhr.status === 409 ) {
				output.add( obj.text, obj.room, obj.codify );
			}
		}
	}
};
IO.register( 'output', output.build, output );
IO.register( 'afteroutput', output.send, output );

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
		index,
		offset = 0, //to determine the absolute distance from beginning
		len = str.length,
		ret = [];

	while ( (index = part.indexOf(str)) > -1 ) {
		ret.push( index + offset );
		part = part.slice( index + len );
		offset += index + len;
	}

	return ret;
};
String.prototype.startsWith = function ( str ) {
	return this.indexOf( str ) === 0;
};

//SO chat uses an unfiltered for...in to iterate over an array somewhere, so
// that I have to use Object.defineProperty to make these non-enumerable
Object.defineProperty( Array.prototype, 'invoke', {
	value : function ( funName ) {
		var args = [].slice.call( arguments, 1 ), ret = [];

		this.forEach(function ( item, index ) {
			var res = item;

			if ( item[funName] && item[funName].call ) {
				res = item.funName.call( item, args );
			}

			ret[ index ] = res;
		});

		return ret;
	},

	configurable : true,
	writable : true
});
////utility end
