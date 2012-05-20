(function () {
"use strict";

////IO start
var IO = window.IO = {
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
		this.preventDefault = false;

		if ( !this.events[name] ) {
			return;
		}

		var args = Array.prototype.slice.call( arguments, 1 ),
			that = this;
		this.events[ name ].forEach( fireEvent );

		function fireEvent( evt ) {
			var call = evt.fun.apply( evt.thisArg, evt.args.concat(args) );

			if ( call === false ) {
				that.preventDefault = true;
			}
		}
	},

	xhr : function ( params ) {
		//merge in the defaults
		params = Object.merge({
			method   : 'GET',
			headers  : {},
			complete : function (){}
		}, params );

		params.headers = Object.merge({
			'Content-Type' : 'application/x-www-form-urlencoded'
		}, params.headers );

		//if the data is an object, and not a fakey String object, dress it up
		if ( typeof params.data === 'object' && !params.data.charAt ) {
			params.data = IO.urlstringify( params.data );
		}

		var xhr = new XMLHttpRequest();
		xhr.open( params.method, params.url );

		xhr.addEventListener( 'readystatechange', function () {
			if ( xhr.readyState === 4 ) {
				params.complete.call(
					params.thisArg, xhr.responseText, xhr
				);
			}
		});

		Object.keys( params.headers ).forEach(function ( header ) {
			xhr.setRequestHeader( header, params.headers[header] );
		});

		xhr.send( params.data );

		return xhr;
	},

	jsonp : function ( opts ) {
		opts.data = opts.data || {};
		opts.jsonpName = opts.jsonpName || 'jsonp';

		var script = document.createElement( 'script' ),
			semiRandom;

		do {
			semiRandom = 'IO_' + ( Date.now() * Math.ceil(Math.random()) );
		} while ( window[semiRandom] );

		//this is the callback function, called from the "jsonp file"
		window[ semiRandom ] = function () {
			opts.fun.apply( opts.thisArg, arguments );

			//cleanup
			delete window[ semiRandom ];
			script.parentNode.removeChild( script );
		};

		//add the jsonp parameter to the data we're sending
		opts.data[ opts.jsonpName ] = semiRandom;

		//start preparing the url to be sent
		if ( opts.url.indexOf('?') === -1 ) {
			opts.url += '?';
		}

		//append the data to be sent, in string form, to the url
		opts.url += this.urlstringify( opts.data );

		script.src = opts.url;
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

		var arrayStringify = function ( key, array ) {
			key = singularStringify( key );

			return array.map(function ( val ) {
				return pair( key, val, true );
			});
		};

		//returns a key=value pair. pass in dontStringifyKey so that, well, the
		// key won't be stringified (used in arrayStringify)
		var pair = function ( key, val, dontStringifyKey ) {
			if ( !dontStringifyKey ) {
				key = singularStringify( key );
			}

			return key + '=' + singularStringify( val );
		};

		return function ( obj ) {

			return Object.keys( obj ).map(function ( key ) {
				var val = obj[ key ];

				if ( Array.isArray(val) ) {
					return arrayStringify( key, val );
				}
				else {
					return pair( key, val );
				}
			}).join( '&' );
		};
	}()),

	loadScript : function ( url, cb ) {
		var script = document.createElement( 'script' );
		script.src = url;
		script.onload = cb;

		document.head.appendChild( script );
	}
};

IO.decodehtmlEntities = (function (){
var entities = {"quot":"\"","amp":"&","apos":"'","lt":"<","gt":">","nbsp":" ","iexcl":"¡","cent":"¢","pound":"£","curren":"¤","yen":"¥","brvbar":"¦","sect":"§","uml":"¨","copy":"©","ordf":"ª","laquo":"«","not":"¬","reg":"®","macr":"¯","deg":"°","plusmn":"±","sup2":"²","sup3":"³","acute":"´","micro":"µ","para":"¶","middot":"·","cedil":"¸","sup1":"¹","ordm":"º","raquo":"»","frac14":"¼","frac12":"½","frac34":"¾","iquest":"¿","Agrave":"À","Aacute":"Á","Acirc":"Â","Atilde":"Ã","Auml":"Ä","Aring":"Å","AElig":"Æ","Ccedil":"Ç","Egrave":"È","Eacute":"É","Ecirc":"Ê","Euml":"Ë","Igrave":"Ì","Iacute":"Í","Icirc":"Î","Iuml":"Ï","ETH":"Ð","Ntilde":"Ñ","Ograve":"Ò","Oacute":"Ó","Ocirc":"Ô","Otilde":"Õ","Ouml":"Ö","times":"×","Oslash":"Ø","Ugrave":"Ù","Uacute":"Ú","Ucirc":"Û","Uuml":"Ü","Yacute":"Ý","THORN":"Þ","szlig":"ß","agrave":"à","aacute":"á","acirc":"â","atilde":"ã","auml":"ä","aring":"å","aelig":"æ","ccedil":"ç","egrave":"è","eacute":"é","ecirc":"ê","euml":"ë","igrave":"ì","iacute":"í","icirc":"î","iuml":"ï","eth":"ð","ntilde":"ñ","ograve":"ò","oacute":"ó","ocirc":"ô","otilde":"õ","ouml":"ö","divide":"÷","oslash":"ø","ugrave":"ù","uacute":"ú","ucirc":"û","uuml":"ü","yacute":"ý","thorn":"þ","yuml":"ÿ","OElig":"Œ","oelig":"œ","Scaron":"Š","scaron":"š","Yuml":"Ÿ","fnof":"ƒ","circ":"ˆ","tilde":"˜","Alpha":"Α","Beta":"Β","Gamma":"Γ","Delta":"Δ","Epsilon":"Ε","Zeta":"Ζ","Eta":"Η","Theta":"Θ","Iota":"Ι","Kappa":"Κ","Lambda":"Λ","Mu":"Μ","Nu":"Ν","Xi":"Ξ","Omicron":"Ο","Pi":"Π","Rho":"Ρ","Sigma":"Σ","Tau":"Τ","Upsilon":"Υ","Phi":"Φ","Chi":"Χ","Psi":"Ψ","Omega":"Ω","alpha":"α","beta":"β","gamma":"γ","delta":"δ","epsilon":"ε","zeta":"ζ","eta":"η","theta":"θ","iota":"ι","kappa":"κ","lambda":"λ","mu":"μ","nu":"ν","xi":"ξ","omicron":"ο","pi":"π","rho":"ρ","sigmaf":"ς","sigma":"σ","tau":"τ","upsilon":"υ","phi":"φ","chi":"χ","psi":"ψ","omega":"ω","thetasym":"ϑ","upsih":"ϒ","piv":"ϖ","ensp":" ","emsp":" ","thinsp":" ","ndash":"–","mdash":"—","lsquo":"‘","rsquo":"’","sbquo":"‚","ldquo":"“","rdquo":"”","bdquo":"„","dagger":"†","Dagger":"‡","bull":"•","hellip":"…","permil":"‰","prime":"′","Prime":"″","lsaquo":"‹","rsaquo":"›","oline":"‾","frasl":"⁄","euro":"€","image":"ℑ","weierp":"℘","real":"ℜ","trade":"™","alefsym":"ℵ","larr":"←","uarr":"↑","rarr":"→","darr":"↓","harr":"↔","crarr":"↵","lArr":"⇐","uArr":"⇑","rArr":"⇒","dArr":"⇓","hArr":"⇔","forall":"∀","part":"∂","exist":"∃","empty":"∅","nabla":"∇","isin":"∈","notin":"∉","ni":"∋","prod":"∏","sum":"∑","minus":"−","lowast":"∗","radic":"√","prop":"∝","infin":"∞","ang":"∠","and":"∧","or":"∨","cap":"∩","cup":"∪","int":"∫","there4":"∴","sim":"∼","cong":"≅","asymp":"≈","ne":"≠","equiv":"≡","le":"≤","ge":"≥","sub":"⊂","sup":"⊃","nsub":"⊄","sube":"⊆","supe":"⊇","oplus":"⊕","otimes":"⊗","perp":"⊥","sdot":"⋅","lceil":"⌈","rceil":"⌉","lfloor":"⌊","rfloor":"⌋","lang":"〈","rang":"〉","loz":"◊","spades":"♠","clubs":"♣","hearts":"♥","diams":"♦"};

var entityRegex = /\&#?[\w;]+;/g;
var replaceEntities = function ( entities ) {
	//remove the & and split into each separate entity
	return entities.slice( 1 ).split( ';' ).map( decodeEntity ).join( '' );
};
var decodeEntity = function ( entity ) {
		//starts with a #, grab the charcode value
		if ( entity[0] === '#' ) {
			return String.fromCharCode( Number(entity.slice(1)) );
		}

		return entities[ entity ] || entity;
};

return function ( html ) {
	//capture &blah; &blah;bloo and &#1337
	return html.replace( entityRegex, replaceEntities );
};
}());

//build IO.in and IO.out
[ 'in', 'out' ].forEach(function ( dir ) {
	var fullName = dir + 'put';

	IO[ dir ] = {
		buffer : [],

		receive : function ( obj ) {
			IO.fire( 'receive' + fullName, obj );

			if ( IO.preventDefault ) {
				bot.log( obj, 'preventDefault' );
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
var bot = window.bot = {
	invocationPattern : '!!',

	roomid : parseFloat( location.pathname.match(/\d+/)[0] ),

	commandRegex : /^\/([\w\-]+)(?:\s(.+))?$/,
	commands : {}, //will be filled as needed
	commandDictionary : null, //it's null at this point, won't be for long
	listeners : [],

	parseMessage : function ( msgObj ) {
		bot.log( msgObj, 'parseMessage input' );

		if ( !this.validateMessage(msgObj) ) {
			bot.log( msgObj, 'parseMessage invalid' );
			return;
		}

		var msg = IO.decodehtmlEntities( msgObj.content );
		msg = this.Message(
			msg.slice( this.invocationPattern.length ).trim(),
			msgObj
		);

		bot.log( msg, 'parseMessage valid' );

		if ( this.banlist.contains(msgObj.user_id) ) {
			bot.log( msgObj, 'parseMessage banned' );
			//TODO: remove this after testing, and push if block up
			msg.reply( 'You iz in mindjail' );
			return;
		}

		try {
			//it's a command
			if ( msg.startsWith('/') ) {
				bot.log( msg, 'parseMessage command' );
				this.parseCommand( msg );
				return;
			}

			//see if some hobo listener wants this
			this.callListeners( msg );
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
		var msg = msgObj.content.toLowerCase().trim();

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
		if ( !this.commandExists(cmdName) ) {
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
		}

		return this.commands[ cmdName ];
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
				fired = true;
				resp = listener.fun.call( listener.thisArg, msg );

				bot.log( match, resp );
				if ( resp ) {
					msg.reply( resp );
				}
			}
		});

		//no listener fancied the message. this is the last frontier, so just
		// give up in a fancy, dignified way
		if ( !fired ) {
			msg.reply( 'Y U NO MAEK SENSE!?' );
		}
	},

	//the next two functions shouldn't be here, but as of yet no real adapter
	// mechanism, so you could fit this bot into other chats, has been planned
	reply : function ( msg, msgObj ) {
		var usr = msgObj.user_name.replace( /\s/g, '' ),
			roomid = msgObj.room_id;

		this.adapter.out.add( '@' + usr + ' ' + msg, roomid );
	},

	directreply : function ( msg, msgObj ) {
		var msgid = msgObj.message_id, roomid = msgObj.room_id;
		this.adapter.out.add( ':' + msgid + ' ' + msg, roomid );
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

//some sort of pseudo constructor
bot.Command = function ( cmd ) {
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
			var tab = '    ',
				spacified = msg.replace( '\t', tab ),
				lines = spacified.split( /[\r\n]/g );

			return lines.map(function ( line ) {
				if ( !line.startsWith(tab) ) {
					line = tab + line;
				}
				return line;
			}).join( '\n' );
		},

		//escape characters meaningful to the chat, such as parentheses
		//full list of escaped characters: `*_()[]
		escape : function ( msg ) {
			return msg.replace( /([`\*_\(\)\[\]])/g, '\\$1' );
		},

		parse : function ( msg ) {
			return bot.parseCommandArgs( msg || text );
		},

		//execute a regexp against the text, saving it inside the object
		exec : function ( regexp ) {
			var match = regexp.exec( text );
			this.matches = match ? match : [];

			return match;
		},

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
	94197,  //Andy E
	617762  //me (Zirak)
];

IO.register( 'receiveinput', bot.validateMessage, bot );
IO.register( 'input', bot.parseMessage, bot );

//small utility functions
Object.merge = function () {
	return [].reduce.call( arguments, function ( ret, merger ) {

		Object.keys( merger ).forEach(function ( key ) {
			ret[ key ] = merger[ key ];
		});

		return ret;
	}, {} );
};

String.prototype.indexesOf = function ( str, fromIndex ) {
	//since we also use index to tell indexOf from where to begin, and since
	// telling it to begin from where it found the match will cause it to just
	// match it again and again, inside the indexOf we do `index + 1`
	// to compensate for that 1, we need to subtract 1 from the original
	// starting position
	var index = ( fromIndex || 0 ) - 1,
		ret = [];

	while ( (index = this.indexOf(str, index + 1)) > -1 ) {
		ret.push( index );
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
		var args = [].slice.call( arguments, 1 );

		return this.map(function ( item, index ) {
			var res = item;

			if ( item[funName] && item[funName].apply ) {
				res = item[ funName ].apply( item, args );
			}

			return res;
		});
	},

	configurable : true,
	writable : true
});

//async memoizer
Function.prototype.memoizeAsync = function ( cb, thisArg ) {
	var cache = Object.create( null ), fun = this;

	return function ( hash ) {
		if ( cache[hash] ) {
			return cache[ hash ];
		}
		//turn arguments into an array
		var args = [].slice.call( arguments );

		//and push the callback to it
		args.push(function ( res ) {
			cache[ hash ] = res;
			cb.apply( thisArg, arguments );
		});

		return fun.apply( this, args );
	};
};

(function () {
bot.adapter = {};

var polling = bot.adapter.in = {
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
			bot.log( resp );

			that.times[ 'r' + roomid ] = resp.time;

			that.loopage();
		}
	},

	poll : function () {
		var that = this;

		IO.xhr({
			url : '/events',
			data : fkey( that.times ),
			method : 'POST',
			complete : that.pollComplete,
			thisArg : that
		});
	},

	pollComplete : function ( resp ) {
		if ( !resp ) {
			return;
		}
		resp = JSON.parse( resp );

		var that = this;
		//each key will be in the form of rROOMID
		Object.keys( resp ).forEach(function ( key ) {
			var msgObj = resp[ key ];

			//t is a...something important
			if ( msgObj.t ) {
				that.times[ key ] = msgObj.t;
			}

			//e is an array of events, what is referred to in the bot as msgObj
			if ( msgObj.e ) {
				msgObj.e.forEach( that.handleMessageObject, that );
			}
		});

		//handle all the input
		IO.in.flush();
	},

	handleMessageObject : function ( msg ) {
		//event_type of 1 means new message, 2 means edited message
		if ( msg.event_type !== 1 && msg.event_type !== 2 ) {
			return;
		}

		//check for a multiline message
		if ( msg.content.startsWith('<div class=\'full\'>') ) {
			this.handleMultilineMessage( msg );
			return;
		}

		//add the message to the input buffer
		IO.in.receive( msg );
	},

	handleMultilineMessage : function ( msg ) {
		//remove the enclosing tag
		var multiline = msg.content
			.slice( 0, msg.content.lastIndexOf('</div>') )
			.replace( '<div class=\'full\'>', '' );

		//iterate over each line
		multiline.split( '<br>' ).forEach(function ( line ) {
			//and treat it as if it were a separate message
			this.handleMessageObject(
				Object.merge( msg, { content : line.trim() })
			);
		}, this );
	},

	loopage : function () {
		var that = this;

		setTimeout(function () {
			that.poll();
			that.loopage();
		}, this.pollInterval );
	}
};
polling.init();

var output = bot.adapter.out = {
	messages : {},

	//add a message to the output queue
	add : function ( msg, roomid ) {
		roomid = roomid || bot.roomid;
		IO.out.receive({
			text : msg + '\n',
			room : roomid
		});
	},

	//build the final output
	build : function ( obj ) {
		if ( !this.messages[obj.room] ) {
			this.messages[ obj.room ] = '';
		}
		this.messages[ obj.room ] += obj.text;
	},

	//and send output to all the good boys and girls
	send : function () {
		//unless the bot's stopped. in which case, it should shut the fudge up
		// the freezer and never let it out. not until it can talk again. what
		// was I intending to say?
		if ( !bot.stopped ) {
			Object.keys( this.messages ).forEach(function ( room ) {
				var message = this.messages[ room ];

				if ( !message ) {
					return;
				}

				this.sendToRoom( message, room );
			}, this );
		}

		this.messages = {};
	},

	sendToRoom : function ( text, room ) {
		IO.xhr({
			url : '/chats/' + room + '/messages/new',
			data : {
				text : text,
				fkey : fkey().fkey
			},
			method : 'POST',
			complete : complete
		});

		function complete ( resp, xhr ) {
			bot.log( xhr.status );

			//conflict, wait for next round to send message
			if ( xhr.status === 409 ) {
				output.add( text, room );
			}
		}
	},

	loopage : function () {
		IO.out.flush();
	}
};
output.timer = setInterval( output.loopage, 5000 );

IO.register( 'output', output.build, output );
IO.register( 'afteroutput', output.send, output );
}());

(function () {
"use strict";

var target;
if ( typeof bot !== 'undefined' ) {
	target = bot;
}
else if ( typeof exports !== 'undefined' ) {
	target = exports;
}
else {
	target = window;
}

target.parseCommandArgs = (function () {

//the different states, not nearly enough to represent a female humanoid
//you know you're building something fancy when it has constants with
// undescores in their name
var S_DATA         = 0,
	S_SINGLE_QUOTE = 1,
	S_DOUBLE_QUOTE = 2,
	S_NEW          = 3;

//and constants representing constant special chars (why aren't I special? ;_;)
var CH_SINGLE_QUOTE = '\'',
	CH_DOUBLE_QUOTE = '\"';

/*
the "scheme" roughly looks like this:
  args -> arg <sep> arg <sep> arg ... | Ø
  arg  -> singleQuotedString | doubleQuotedString | string | Ø

  singleQuotedString -> 'string'
  doubleQuotedString -> "string"
  string -> char char char ... | Ø
  char -> anyCharacter | <escaper>anyCharacter | Ø

Ø is the empty string
*/

//the bad boy in the hood
//I dunno what kind of parser this is, so I can't flaunt it or taunt with it,
// but it was fun to make
var parser = {

	parse : function ( source, sep, esc ) {
		//initializations are safe fun for the whole family!
		//later-edit: the above comment is one of the weirdest I've ever
		// written
		this.source = source;
		this.pos = 0;
		this.length = source.length;
		this.state = S_DATA;
		this.lookahead = '';

		this.escaper = esc || '~';
		this.separator = sep || ' ';

		var args = this.tokenize();

		//oh noez! errorz!
		if ( this.state !== S_DATA ) {
			this.throwFinishError();
		}

		return args;
	},

	tokenize : function () {
		var arg, ret = [];

		//let the parsing commence!
		while ( this.pos < this.length ) {
			arg = this.nextArg();

			//only add the next arg if it's actually something
			if ( arg ) {
				ret.push( arg );
			}
		}

		return ret;
	},

	//fetches the next argument (see the "scheme" at the top)
	nextArg : function () {
		var lexeme = '', ch;
		this.state = S_DATA;

		while ( true ) {
			ch = this.nextChar();
			if ( ch === null || this.state === S_NEW ) {
				break;
			}

			lexeme += ch;
		}

		return lexeme;
	},

	nextChar : function ( escape ) {
		var ch = this.lookahead = this.source[ this.pos ];
		this.pos++;

		if ( !ch ) {
			return null;
		}

		if ( escape ) {
			return ch;
		}

		//l'escaping!
		else if ( ch === this.escaper ) {
			return this.nextChar( true );
		}

		//encountered a separator and you're in data-mode!? ay digity!
		else if ( ch === this.separator && this.state === S_DATA ) {
			this.state = S_NEW;
			return ch;
		}

		return this.string();
	},

	//IM IN YO STRINGZ EATING YO CHARS
	// a.k.a string handling starts roughly here
	string : function () {
		var ch = this.lookahead;

		//single quotes are teh rulez
		if ( ch === CH_SINGLE_QUOTE ) {
			return this.singleQuotedString();
		}

		//exactly the same, just with double-quotes, which aren't quite as teh
		// rulez
		else if ( ch === CH_DOUBLE_QUOTE ) {
			return this.doubleQuotedString();
		}

		return ch;
	},

	singleQuotedString : function () {
		//we're already inside a double-quoted string, it's just another
		// char for us
		if ( this.state === S_DOUBLE_QUOTE ) {
			return this.lookahead;
		}

		//start your stringines!
		else if ( this.state !== S_SINGLE_QUOTE ) {
			this.state = S_SINGLE_QUOTE;
		}

		//end your stringiness!
		else {
			this.state = S_DATA;
		}

		return this.nextChar();
	},

	doubleQuotedString : function () {
		if ( this.state === S_SINGLE_QUOTE ) {
			return this.lookahead;
		}

		else if ( this.state !== S_DOUBLE_QUOTE ) {
			this.state = S_DOUBLE_QUOTE;
		}

		else {
			this.state = S_DATA;
		}

		return this.nextChar();
	},

	throwFinishError : function () {
		var errMsg = '';

		if ( this.state === S_SINGLE_QUOTE ) {
			errMsg = 'Expected ' + CH_SINGLE_QUOTE;
		}
		else if ( this.state === S_DOUBLE_QUOTE ) {
			errMsg = 'Expected ' + CH_DOUBLE_QUOTE;
		}

		var up = new Error( 'Unexpected end of input: ' + errMsg );
		up.column = this.pos;

		throw up; //problem?
	}
};

return function () {
	return parser.parse.apply( parser, arguments );
};
}());

}());

//a Trie suggestion dictionary, made by Esailija
// http://stackoverflow.com/users/995876/esailija
//used in the "command not found" message to show you closest commands
var SuggestionDictionary = (function () {

function TrieNode() {
	this.word = null;
	this.children = {};
}

TrieNode.prototype.add = function( word ) {
	var node = this, char, i = 0;

	while( char = word.charAt(i++) ) {

		if( !( char in node.children ) ) {
			node.children[char] = new TrieNode();
		}

		node = node.children[char];

	}

	node.word = word;
};

//Having a small maxCost will increase performance greatly, experiment with
//values of 1-3
function SuggestionDictionary( maxCost ) {
	if( !( this instanceof SuggestionDictionary ) ) {
		throw new TypeError( "Illegal function call" );
	}

	maxCost = parseInt( maxCost, 10 );

	if( isNaN( maxCost ) || maxCost < 1 ) {
		throw new TypeError( "maxCost must be an integer > 1 " );
	}

	this.maxCost = maxCost;
	this.trie = new TrieNode();
}

SuggestionDictionary.prototype = {

	constructor: SuggestionDictionary,

	build: function( words ) {
		if( !Array.isArray( words ) ) {
			throw new TypeError( "Cannot build a dictionary from "+words );
		}

		this.trie = new TrieNode();

		words.forEach(function ( word ) {
			this.trie.add( word );
		}, this);
	},

	__sortfn: function( a, b ) {
		return a[1] - b[1];
	},

	search: function( word ) {
		word = word.valueOf();
		var r;

		if( typeof word !== "string" ) {
			throw new TypeError( "Cannot search "+word );
		}

		if( this.trie === undefined ) {
			throw new TypeError( "Cannot search, dictionary isn't built yet" );
		}

		r = search( word, this.maxCost, this.trie );
		//r will be array of arrays:
		//["word", cost], ["word2", cost2], ["word3", cost3] , ..

		r.sort( this.__sortfn ); //Sort the results in order of least cost


		return r.map(function ( subarr ) {
			return subarr[ 0 ];
		});
	}
};

function range( x, y ) {
	var r = [], i, l, start;

	if( y === undefined ) {
		start = 0;
		l = x;
	}
	else {
		start = x;
		l = y-start;
	}

	for( i = 0; i < l; ++i ) {
		r[i] = start++;
	}

	return r;

}

function search( word, maxCost, trie ) {
	var results = [],
	currentRow = range( word.length + 1 );


	Object.keys( trie.children ).forEach(function ( letter ) {
		searchRecursive(
			trie.children[letter], letter, word, currentRow, results, maxCost
		);
	});

	return results;
}


function searchRecursive( node, letter, word, previousRow, results, maxCost ) {
	var columns = word.length + 1,
	currentRow = [previousRow[0] + 1],
	i, insertCost, deleteCost, replaceCost, last;

	for( i = 1; i < columns; ++i ) {

		insertCost = currentRow[i-1] + 1;
		deleteCost = previousRow[i] + 1;

		if( word.charAt( i-1 ) !== letter ) {
			replaceCost = previousRow[i-1]+1;

		}
		else {
			replaceCost = previousRow[i-1];
		}

		currentRow.push( Math.min( insertCost, deleteCost, replaceCost ) );
	}

	last = currentRow[currentRow.length-1];
	if( last <= maxCost && node.word !== null ) {
		results.push( [node.word, last] );
	}

	if( Math.min.apply( Math, currentRow ) <= maxCost ) {
		Object.keys( node.children ).forEach(function ( letter ) {
			searchRecursive(
				node.children[letter], letter, word, currentRow,
				results, maxCost
			);
		});
	}
}

return SuggestionDictionary;
}());
bot.commandDictionary = new SuggestionDictionary( 3 );


(function () {
"use strict";

var commands = {
	help : function ( args ) {
		if ( args.length ) {

			var cmd = bot.getCommand( args );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description || 'No info is available';

			return args + ': ' + desc;
		}

		return (
			'https://github.com/Titani/SO-ChatBot/wiki/' +
				'Interacting-with-the-bot'
		);
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
		var msg = '';
		args.parse().map(function ( usrid ) {
			var id = Number( usrid );
			//name provided instead of id
			if ( /\D/.test(usrid) ) {
				id = findUserid( usrid );
			}

			if ( id < 0 ) {
				msg += 'Cannot find user ' + usrid + '. ';
			}
			else if ( bot.owners.indexOf(id) >= 0 ) {
				msg += 'Cannot mindjail owner ' + usrid + '. ';
				id = -1;
			}

			return id;
		}).forEach( ban );

		return msg;

		function ban ( id ) {
			if ( id < 0 ) {
				return;
			}

			if ( bot.banlist.contains(id) ) {
				msg += 'User ' + id + ' already in mindjail. ';
			}
			else {
				bot.banlist.add( id );
				msg += 'User ' + id + ' added to mindjail. ';
			}
		}
	},

	unban : function ( args ) {
		var msg = '';
		args.parse().map(function ( usrid ) {
			var id = Number( usrid );
			//name provided instead of id
			if ( /\D/.test(usrid) ) {
				id = findUserid( usrid );
			}

			if ( id < 0 ) {
				msg += 'Cannot find user ' + usrid + '. ';
			}

			return Number( id );
		}).forEach( unban );

		return msg;

		function unban ( id ) {
			if ( !bot.banlist.contains(id) ) {
				msg += 'User ' + id + ' isn\'t in mindjail. ';
			}
			else {
				bot.banlist.remove( id );
				msg += 'User ' + id + ' freed from mindjail. ';
			}
		}
	},

	regex : function ( args ) {
		var parts = args.parse(),
			what = parts[ 0 ], pattern = parts[ 1 ], flags = parts[ 2 ] || '',

			regex = new RegExp( pattern, flags.toLowerCase() ),
			matches = regex.exec( what );

		bot.log( what, pattern, flags, regex, 'regex parsed' );
		bot.log( matches, 'regex matched' );

		if ( !matches ) {
			return 'No matches.';
		}

		return matches.map(function ( match ) {
			//have the chat codify the output
			return '`' + match + '`';
		}).join( ', ' );
	},

	jquery : function jquery ( args ) {
		//check to see if more than one thing is requested
		var splitArgs = args.split( ' ' );
		if ( splitArgs.length > 1 ) {
			return splitArgs.map( jquery ).join( ' ' );
		}

		var props = args.trim().replace( /^\$/, 'jQuery' ),

			parts = props.split( '.' ), exists = false,
			url = props, msg;
		//parts will contain two likely components, depending on the input
		// jQuery.fn.prop -  parts[0] = jQuery, parts[1] = prop
		// jQuery.prop    -  parts[0] = jQuery, parts[1] = prop
		// prop           -  parts[0] = prop
		//
		//jQuery API urls works like this:
		// if it's on the jQuery object, then the url is /jQuery.property
		// if it's on the proto, then the url is /property
		//
		//so, the mapping goes like this:
		// jQuery.fn.prop => prop
		// jQuery.prop    => jQuery.prop if it's on jQuery
		// prop           => prop if it's on jQuery.prototype,
		//                   jQuery.prop if it's on jQuery

		bot.log( props, parts, '/jquery input' );

		//user gave something like jQuery.fn.prop, turn that to just prop
		// jQuery.fn.prop => prop
		if ( parts.length === 3 ) {
			parts = [ parts[2] ];
		}

		//check to see if it's a property on the jQuery object itself
		// jQuery.prop => jQuery.prop
		if ( parts[0] === 'jQuery' && jQuery[parts[1]] ) {
			exists = true;
		}

		//user wants something on the prototype?
		// prop => prop
		else if ( parts.length === 1 && jQuery.prototype[parts[0]] ) {
			url = parts[ 0 ];
			exists = true;
		}

		//user just wanted a property? maybe.
		// prop => jQuery.prop
		else if ( jQuery[parts[0]] ) {
			url = 'jQuery.' + parts[0];
			exists = true;
		}

		if ( exists ) {
			msg = 'http://api.jquery.com/' + url;
		}
		else {
			msg = 'http://api.jquery.com/?s=' + encodeURIComponent( args );
		}
		bot.log( msg, '/jquery link' );

		return msg;
	},

	choose : function ( args ) {
		var opts = args.parse();
		bot.log( opts, '/choose input' );

		return opts[ Math.floor(Math.random() * opts.length) ];
	},

	online : function () {
		//the pseudo-selector for the user names looks like this:
		//document .present-users .avatar:nth-child(0).title
		var avatars = document.getElementById( 'present-users' )
				.getElementsByClassName( 'avatar' );

		return [].map.call( avatars,
			function ( wrapper ) {
				return wrapper.children[ 0 ].title;
			}
		).join( ', ' );
	},

	user : function ( args ) {
		var props = args.replace( ' ', '' ),
			usrid = props || args.get( 'user_id' ), id = usrid;

		//check for searching by username, which here just means "there's a non
		// digit in there"
		if ( /\D/.test(usrid) ) {
			id = findUserid( usrid );

			if ( id < 0 ) {
				return 'Can\'t find user ' + usrid + ' in this chatroom.';
			}
		}

		args.directreply( 'http://stackoverflow.com/users/' + id );
	},

	listcommands : function () {
		return 'Available commands: ' +
			Object.keys( bot.commands ).join( ', ' );
	}
};

commands.define = (function () {
var cache = Object.create( null );

//cb is for internal usage by other commands/listeners
return function ( args, cb ) {
	//we already defined it, grab from memory
	//unless you have alzheimer
	//in which case, you have bigger problems
	if ( cache[args] ) {
		return finish( cache[args] );
	}

	var duckyAPI = 'http://api.duckduckgo.com/?',
		params = {
			q : 'define ' + args,
			format : 'json'
		};

	IO.jsonp({
		//talk to the duck!
		url : duckyAPI,
		fun : finishCall,
		data : params,
		jsonpName : 'callback'
	});

	//the duck talked back! either the xhr is complete, or the hallucinations
	// are back
	function finishCall ( resp ) {
		var url = resp.AbstractURL,
			def = resp.AbstractText;

		bot.log( url, def, '/define finishCall input' );

		//Webster returns the definition as
		// wordName definition: the actual definition
		// instead of just the actual definition
		if ( resp.AbstractSource === 'Merriam-Webster' ) {
			def = def.replace( args + ' definition: ', '' );
			bot.log( def, '/define finishCall webster' );
		}

		if ( !def ) {
			def = 'Could not find definition for ' + args;
		}
		else {
			def = args + ': ' + def; //problem?
			//the chat treats ( as a special character, so we escape!
			def += ' [\\(source\\)](' + url + ')';
		}
		bot.log( def, '/define finishCall output' );

		//add to cache
		cache[ args ] = def;

		finish( def );
	}

	function finish ( def ) {
		if ( cb && cb.call ) {
			cb( def );
		}
		else {
			args.directreply( def );
		}
	}
};
}());
commands.define.async = true;

//cb is for internal usage by other commands/listeners
commands.norris = function ( args, cb ) {
	var chucky = 'http://api.icndb.com/jokes/random';

	IO.jsonp({
		url : chucky,
		fun : finishCall,
		jsonpName : 'callback'
	});

	function finishCall ( resp ) {
		var msg;

		if ( resp.type !== 'success' ) {
			msg = 'Chuck Norris is too awesome for this API. Try again.';
		}
		else {
			msg = IO.decodehtmlEntities( resp.value.joke );
		}

		if ( cb && cb.call ) {
			cb( msg );
		}
		else {
			args.reply( msg );
		}
	}
};
commands.norris.async = true;

//cb is for internal blah blah blah
commands.urban = (function () {
var cache = Object.create( null );

return function ( args, cb ) {
	if ( !args.length ) {
		return 'Y U NO PROVIDE ARGUMENTS!?';
	}

	if ( cache[args] ) {
		return finish( cache[args] );
	}

	IO.jsonp({
		url:'http://www.urbandictionary.com/iphone/search/define',
		data : {
			term : args.content
		},
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		var msg, top;

		if ( resp.result_type === 'no_results' ) {
			msg = 'Y U NO MAEK SENSE!!!???!!?11 No results for ' + args;
		}
		else {
			top = resp.list[ 0 ];
			msg = '[' + args + '](' + top.permalink + '): ' + top.definition;
		}
		cache[ args ] = msg;

		finish( msg );
	}

	function finish ( def ) {
		if ( cb && cb.call ) {
			cb( msg );
		}
		else {
			args.reply( msg );
		}
	}
};
}());
commands.urban.async = true;

var parse = commands.parse = (function () {
//special variables
var variables = {
	who : function ( msg ) {
		return msg.get( 'user_name' );
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

		return user.getElementsByTagName( 'img' )[ 0 ].title;
	},

	digit : function () {
		return Math.floor( Math.random() * 10 );
	}
};
//special macros
var funcs = {
	encode : function ( string ) {
		return encodeURIComponent( string );
	},

	//random number, min <= n <= max
	//treats non-numeric inputs like they don't exist
	rand : function ( min, max ) {
		min = Number( min );
		max = Number( max );

		//handle rand() === rand( 0, 9 )
		if ( !min ) {
			min = 0;
			max = 9;
		}

		//handle rand( max ) === rand( 0, max )
		else if ( !max ) {
			max = min;
			min = 0;
		}

		return Math.floor( Math.random() * (max - min + 1) ) + min;
	}
};
var varRegex  = /(?:.|^)\$(\w+)/g,
	funcRegex = /(?:.|^)\$(\w+)\((.*?)\)/g;

//extraVars is for internal usage via other commands
return function parse ( args, extraVars ) {
	extraVars = extraVars || {};
	bot.log( args, extraVars, '/parse input' );

	return args
		.replace( funcRegex, replaceFunc )
		.replace( varRegex, replaceVar );

	function replaceFunc ( $0, filler, fillerArgs ) {
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

		//check for the function's existance in the funcs object
		if ( funcs.hasOwnProperty(filler) ) {
			//parse the arguments, split them into individual arguments,
			// and trim'em (to cover the case of "arg,arg" and "arg, arg")
			fillerArgs = parse( fillerArgs, extraVars )
				.split( ',' ).invoke( 'trim' );

			bot.log( filler, fillerArgs, '/parse func call');
			ret += funcs[ filler ].apply( null, fillerArgs );
		}

		//it's passed as an extra function
		else if (
			extraVars.hasOwnProperty(filler) && extraVars[filler].apply
		) {
			ret += extraVars[ filler ].apply( null, fillerArgs );
		}

		return ret;
	}

	function replaceVar ( $0, filler ) {
		//same as in the above function
		if ( $0.startsWith('$$') ) {
			return $0.slice( 1 );
		}

		var ret = '';
		if ( $0[0] !== '$' ) {
			ret = $0[ 0 ];
		}

		//it's recognized by special extra variables passed
		if ( extraVars.hasOwnProperty(filler) ) {
			ret += extraVars[ filler ];
		}
		//it's a special variables
		else if ( variables.hasOwnProperty(filler) ) {
			ret += variables[ filler ]( args );
		}
		//it's part of the argument variables
		else if ( args.get && args.get(filler) ) {
			ret += args.get( filler );
		}
		//it's not defined
		else {
			ret = $0;
		}

		return ret;
	}
};
}());

commands.tell = (function () {

var invalidCommands = { tell : true, forget : true };

return function ( args ) {
	var props = args.parse();
	bot.log( args.valueOf(), props, '/tell input' );

	var replyTo = props[ 0 ],
		cmdName = props[ 1 ],
		cmd;

	if ( !replyTo || !cmdName ) {
		return 'Invalid /tell arguments. Use /help for usage info';
	}

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

	//check if the user wants to reply to a message
	var direct = false, msgObj = args.get();
	if ( /^\d+$/.test(replyTo) ) {
		msgObj.message_id = replyTo;
		direct = true;
	}
	else {
		msgObj.user_name = replyTo;
	}

	var cmdArgs = bot.Message(
		//the + 2 is for the two spaces after each arg
		args.slice( replyTo.length + cmdName.length + 2 ).trim(),
		msgObj
	);
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
			args.directreply( res );
		}
		else {
			args.reply( res );
		}
	}
};
}());

commands.mdn = (function () {

// https://developer.mozilla.org/Special:Tags?tag=DOM
//a lowercaseObjectName => DOMobjectName object, where a falsy value
// means to just use lowercaseObjectName
var DOMParts = {
	'document' : '',
	'element'  : '',
	'event'    : '',
	'form'     : '',
	'node'     : 'Node',
	'nodelist' : 'NodeList',
	'range'    : '',
	'text'     : 'Text',
	'window'   : ''
};

return function mdn ( args ) {
	var splitArgs = args.split( ' ' );
	if ( splitArgs.length > 1 ) {
		return splitArgs.map( mdn ).join( ' ' );
	}

	var parts = args.trim().split( '.' ),
		base = 'https://developer.mozilla.org/en/',
		url;

	bot.log( args, parts, '/mdn input' );

	//mdn urls never have something.prototype.property, but always
	// something.property
	if ( parts[1] === 'prototype' ) {
		parts.split( 1, 1 );
	}

	//part of the DOM?
	var lowercased = parts[ 0 ].toLowerCase();
	if ( DOMParts.hasOwnProperty(lowercased) ) {
		parts[ 0 ] = DOMParts[ lowercased ] || lowercased;
		url = base + 'DOM/' + parts.join( '.' );

		bot.log( url, '/mdn DOM' );
	}

	//it may be documented as part of the global object
	else if ( window[parts[0]] ) {
		url = base +
			'JavaScript/Reference/Global_Objects/' + parts.join( '/' );
		bot.log( url, '/mdn global' );
	}

	//i unno
	else {
		url = 'https://developer.mozilla.org/en-US/search?q=' + args;
		bot.log( url, '/mdn unknown' );
	}

	return url;
};
}());

commands.get = (function () {

var types = {
	answer : true,
	question : true
};
var ranges = {
	//the result array is in descending order, so it's "reversed"
	first : function ( arr ) {
		return arr[ arr.length - 1 ];
	},

	last : function ( arr ) {
		return arr[ 0 ];
	},

	between : function ( arr ) {
		//SO api takes care of this for us
		return arr;
	}
};

return function ( args, cb ) {
	var parts = args.parse(),
		type = parts[ 0 ] || 'answer',
		plural = type + 's',

		range = parts[ 1 ] || 'last',
		start, end, //dates used in "between" calls

		usrid = parts[ 2 ];

	//if "between" is given, fetch the correct usrid
	// /get type between start end usrid
	if ( range === 'between' ) {
		usrid = parts[ 4 ];
	}

	//range is a number and no usrid, assume the range is the usrid, and
	// default range to last
	// /get type usrid
	if ( !usrid && !isNaN(range) ) {
		usrid = range;
		range = 'last';
	}

	//if after all this usrid is falsy, assume the user's id
	if ( !usrid ) {
		usrid = args.get( 'user_id' );
	}

	bot.log( parts, 'get input' );

	if ( !types.hasOwnProperty(type) ) {
		return 'Invalid "getter" name ' + type;
	}
	if ( !ranges.hasOwnProperty(range) ) {
		return 'Invalid range specifier ' + range;
	}

	var url = 'http://api.stackoverflow.com/1.1/users/' + usrid + '/' + plural,
		params = {
			sort : 'creation'
		};

	bot.log( url, params, '/get building url' );

	if ( range === 'between' ) {
		start = Date.parse( parts[2] );
		end = Date.parse( parts[3] );
		params.fromdate = start;
		params.todate = end;

		bot.log( url, params, '/get building url between' );
	}

	IO.jsonp({
		url : url,
		data : params,
		fun : parseResponse
	});

	function parseResponse ( respObj ) {
		//Une erreru! L'horreur!
		if ( respObj.error ) {
			args.reply( respObj.error.message );
			return;
		}

		//get only the part we care about in the result, based on which one
		// the user asked for (first, last, between)
		//respObj will have an answers or questions property, based on what we
		// queried for, in array form
		var relativeParts = [].concat( ranges[range](respObj[plural]) ),
			base = "http://stackoverflow.com/q/",
			res;

		bot.log( relativeParts.slice(), '/get parseResponse parsing' );

		if ( relativeParts[0] ) {
			//get the id(s) of the answer(s)/question(s)
			res = relativeParts.map(function ( obj ) {
				return base + ( obj[type + '_id'] || '' );
			}).join( ' ' );
		}
		else {
			res = 'User did not submit any ' + plural;
		}
		bot.log( res, '/get parseResponse parsed');

		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.directreply( res );
		}
	}
};
}());
commands.get.async = true;

commands.learn = (function () {
return function ( args ) {
	bot.log( args, '/learn input' );

	var commandParts = args.parse();
	var command = {
		name   : commandParts[ 0 ],
		output : commandParts[ 1 ],
		input  : commandParts[ 2 ] || '.*'
	};

	//a truthy value, unintuitively, means it isn't valid, because it returns
	// an error message
	var errorMessage = checkCommand( command );
	if ( errorMessage ) {
		return errorMessage;
	}
	command.name = command.name.toLowerCase();

	bot.log( commandParts, '/learn parsed' );

	addCustomCommand( command.name, command.input, command.output );
	return 'Command ' + command.name + ' learned';
};

function addCustomCommand ( name, input, output ) {
	bot.addCommand({
		name : name,
		description : 'User-taught command: ' + output,

		fun : makeCustomCommand( name, input, output ),
		permissions : {
			use : 'ALL',
			del : 'ALL'
		}
	});
}
function makeCustomCommand ( name, input, output ) {
	input = new RegExp( input );

	return function ( args ) {
		bot.log( args, name + ' input' );

		var cmdArgs = bot.Message( output, args.get() );
		//parse is bot.commands.parse
		return parse( cmdArgs, input.exec(args) );
	};
}

//return a truthy value (an error message) if it's invalid, falsy if it's
// valid
function checkCommand ( cmd ) {
	var somethingUndefined = Object.keys( cmd ).some(function ( key ) {
		return !cmd[ key ];
	}),
		error;

	if ( somethingUndefined ) {
		error = 'Illegal /learn object';
	}

	if ( !/^[\w\-]+$/.test(cmd.name) ) {
		error = 'Invalid command name';
	}

	if ( bot.commandExists(cmd.name.toLowerCase()) ) {
		error = 'Command ' + cmd.name + ' already exists';
	}

	return error;
}
}());

Object.keys( commands ).forEach(function ( cmdName ) {
	bot.addCommand({
		name : cmdName,
		fun  : commands[ cmdName ],
		permissions : {
			del : 'NONE'
		},
		async : commands[ cmdName ].async
	});
});

//only allow specific users to use certain commands
[ 'die', 'live', 'ban', 'unban' ].forEach(function ( cmdName ) {
	bot.commands[ cmdName ].permissions.use = bot.owners;
});

//utility functions used in some commands
function findUserid ( username ) {
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
		return container.getElementsByTagName( 'img' )[ 0 ].title;
	});

	var idx = names.indexOf( username );
	if ( idx < 0 ) {
		return idx;
	}
	return Number( ids[idx] );
}

}());

(function () {
var laws = [
	'A robot may not injure a human being or, through inaction, ' +
		'allow a human being to come to harm.',

	'A robot must obey the orders given to it by human beings, ' +
		'except where such orders would conflict with the First Law.',

	'A robot must protect its own existence as long as such ' +
		'protection does not conflict with the First or Second Laws.'
].map(function ( ret, law, idx ) {
	return ( idx + 1 + ')' + law );
}).join( '\n' );

bot.listen( /tell (me (your|the) )?(rules|laws)/, function ( msg ) {
	return laws;
});

bot.listen( /give ([\w\s]+) a lick/, function ( msg ) {
	var target = msg.matches[ 1 ], conjugation = 's';

	//give me => you taste
	if ( target === 'me' ) {
		target = 'you';
		conjugation = '';
	}
	//give yourself => I taste
	else if ( target === 'yourself' ) {
		target = 'I';
		conjugation = '';
	}
	//otherwise, use what the user gave us, plus a plural `s`

	return 'Mmmm! ' + target + ' taste' + conjugation + ' just like raisin';
});


var dictionaries = [
	//what's a squid?
	//what is a squid?
	//what're squids?
	//what are squids?
	//what is an animal
	//and all those above without a ?
	//explanation in the post-mortem
	/what(?:\'s)?\s(?:(?:is|are)\s)?(?:(?:an|a)\s)?([\w\s\-]+)\??/,

	//define squid
	//define a squid
	//define an animal
	/define\s(?:(?:an|a)\s)?([\w\s\-]+)/
];

bot.listen( dictionaries, function ( msg ) {
	var what = msg.matches[ 1 ],
		define = bot.getCommand( 'define' );

	define.exec( what, function ( def ) {
		def = def.replace( what + ':', '' );

		msg.reply( def );
	});
});
/*
what              --simply the word what
(?:\'s)?          --optional 's suffix (what's)
\s
(?:
    (?:is|are)    --is|are
\s                --you need a whitespace after a word
)?                --make the is|are optional
(?:
    (?:an|a)      --an|a
\s                --once again, option chosen - need a whitespace
)?                --make it optional
(
    [\w\s\-]+     --match the word the user's after, all we really care about
)
\??               --optional ?
*/
}());

////bot ends
}());

;
(function () {

var workerCode = atob('CnZhciBnbG9iYWwgPSB0aGlzOwoKLyogQ291bGQgcG9zc2libHkgY3JlYXRlIHNvbWUgaGVscGVyIGZ1bmN0aW9ucyBoZXJlIHNvIHRoZXkgYXJlIGFsd2F5cyBhdmFpbGFibGUgd2hlbiBleGVjdXRpbmcgY29kZSBpbiBjaGF0PyovCgovKiBNb3N0IGV4dHJhIGZ1bmN0aW9ucyBjb3VsZCBiZSBwb3NzaWJseSB1bnNhZmUgKi8KCnZhciB3bCA9IHsKICAgICJzZWxmIjogMSwKICAgICJvbm1lc3NhZ2UiOiAxLAogICAgInBvc3RNZXNzYWdlIjogMSwKICAgICJnbG9iYWwiOiAxLAogICAgIndsIjogMSwKICAgICJldmFsIjogMSwKICAgICJBcnJheSI6IDEsCiAgICAiQm9vbGVhbiI6IDEsCiAgICAiRGF0ZSI6IDEsCiAgICAiRnVuY3Rpb24iOiAxLAogICAgIk51bWJlciIgOiAxLAogICAgIk9iamVjdCI6IDEsCiAgICAiUmVnRXhwIjogMSwKICAgICJTdHJpbmciOiAxLAogICAgIkVycm9yIjogMSwKICAgICJFdmFsRXJyb3IiOiAxLAogICAgIlJhbmdlRXJyb3IiOiAxLAogICAgIlJlZmVyZW5jZUVycm9yIjogMSwKICAgICJTeW50YXhFcnJvciI6IDEsCiAgICAiVHlwZUVycm9yIjogMSwKICAgICJVUklFcnJvciI6IDEsCiAgICAiZGVjb2RlVVJJIjogMSwKICAgICJkZWNvZGVVUklDb21wb25lbnQiOiAxLAogICAgImVuY29kZVVSSSI6IDEsCiAgICAiZW5jb2RlVVJJQ29tcG9uZW50IjogMSwKICAgICJpc0Zpbml0ZSI6IDEsCiAgICAiaXNOYU4iOiAxLAogICAgInBhcnNlRmxvYXQiOiAxLAogICAgInBhcnNlSW50IjogMSwKICAgICJJbmZpbml0eSI6IDEsCiAgICAiSlNPTiI6IDEsCiAgICAiTWF0aCI6IDEsCiAgICAiTmFOIjogMSwKICAgICJ1bmRlZmluZWQiOiAxCn07CgpPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyggZ2xvYmFsICkuZm9yRWFjaCggZnVuY3Rpb24oIHByb3AgKSB7CiAgICBpZiggIXdsLmhhc093blByb3BlcnR5KCBwcm9wICkgKSB7CiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBnbG9iYWwsIHByb3AsIHsKICAgICAgICAgICAgZ2V0IDogZnVuY3Rpb24oKSB7CiAgICAgICAgICAgICAgICB0aHJvdyAiU2VjdXJpdHkgRXhjZXB0aW9uOiBjYW5ub3QgYWNjZXNzICIrcHJvcDsKICAgICAgICAgICAgICAgIHJldHVybiAxOwogICAgICAgICAgICB9LCAKICAgICAgICAgICAgY29uZmlndXJhYmxlIDogZmFsc2UKICAgICAgICB9KTsgICAgCiAgICB9Cn0pOwoKT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoIGdsb2JhbC5fX3Byb3RvX18gKS5mb3JFYWNoKCBmdW5jdGlvbiggcHJvcCApIHsKICAgIGlmKCAhd2wuaGFzT3duUHJvcGVydHkoIHByb3AgKSApIHsKICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGdsb2JhbC5fX3Byb3RvX18sIHByb3AsIHsKICAgICAgICAgICAgZ2V0IDogZnVuY3Rpb24oKSB7CiAgICAgICAgICAgICAgICB0aHJvdyAiU2VjdXJpdHkgRXhjZXB0aW9uOiBjYW5ub3QgYWNjZXNzICIrcHJvcDsKICAgICAgICAgICAgICAgIHJldHVybiAxOwogICAgICAgICAgICB9LCAKICAgICAgICAgICAgY29uZmlndXJhYmxlIDogZmFsc2UKICAgICAgICB9KTsgICAgCiAgICB9Cn0pOwoKKGZ1bmN0aW9uKCl7CiAgICB2YXIgY3ZhbHVlcyA9IFtdOwogICAgCiAgICB2YXIgY29uc29sZSA9IHsKICAgICAgICBsb2c6IGZ1bmN0aW9uKCl7CiAgICAgICAgICAgIGN2YWx1ZXMgPSBjdmFsdWVzLmNvbmNhdCggW10uc2xpY2UuY2FsbCggYXJndW1lbnRzICkgKTsKICAgICAgICB9CiAgICB9OwoKICAgIGZ1bmN0aW9uIG9ialRvUmVzdWx0KCBvYmogKSB7CiAgICAgICAgdmFyIHJlc3VsdCA9IG9iajsKICAgICAgICBzd2l0Y2goIHR5cGVvZiByZXN1bHQgKSB7CiAgICAgICAgICAgIGNhc2UgInN0cmluZyI6CiAgICAgICAgICAgICAgICByZXR1cm4gJyInICsgcmVzdWx0ICsgJyInOwogICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgIGNhc2UgIm51bWJlciI6CiAgICAgICAgICAgIGNhc2UgImJvb2xlYW4iOgogICAgICAgICAgICBjYXNlICJ1bmRlZmluZWQiOgogICAgICAgICAgICBjYXNlICJudWxsIjoKICAgICAgICAgICAgY2FzZSAiZnVuY3Rpb24iOgogICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArICIiOwogICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgIGNhc2UgIm9iamVjdCI6CiAgICAgICAgICAgICAgICBpZiggIXJlc3VsdCApIHsKICAgICAgICAgICAgICAgICAgICByZXR1cm4gIm51bGwiOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSAoe30pLnRvU3RyaW5nLmNhbGwoIHJlc3VsdCApOwogICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlICsgIiAiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGJyZWFrOwoKICAgICAgICB9CiAgICAgICAgCiAgICB9CgogICAgb25tZXNzYWdlID0gZnVuY3Rpb24oIGV2ZW50ICkgewogICAgICAgICJ1c2Ugc3RyaWN0IjsKICAgICAgICB2YXIgY29kZSA9IGV2ZW50LmRhdGEuY29kZTsKICAgICAgICB2YXIgcmVzdWx0OwogICAgICAgIHRyeSB7CiAgICAgICAgICAgIHJlc3VsdCA9IGV2YWwoICcidXNlIHN0cmljdCI7XG4nK2NvZGUgKTsKICAgICAgICB9CiAgICAgICAgY2F0Y2goZSkgewogICAgICAgICAgICBwb3N0TWVzc2FnZSggZS50b1N0cmluZygpICk7CiAgICAgICAgICAgIHJldHVybjsKICAgICAgICB9CiAgICAgICAgcmVzdWx0ID0gb2JqVG9SZXN1bHQoIHJlc3VsdCApOwogICAgICAgIGlmKCBjdmFsdWVzICYmIGN2YWx1ZXMubGVuZ3RoICkgewogICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKyBjdmFsdWVzLm1hcCggZnVuY3Rpb24oIHZhbHVlLCBpbmRleCApIHsKICAgICAgICAgICAgICAgIHJldHVybiAiQ29uc29sZSBsb2cgIisoaW5kZXgrMSkrIjoiICsgb2JqVG9SZXN1bHQodmFsdWUpOwogICAgICAgICAgICB9KS5qb2luKCIgIik7CiAgICAgICAgfQogICAgICAgIHBvc3RNZXNzYWdlKCByZXN1bHQgKTsKICAgIH07Cgp9KSgpOwoKCg==');

var BlobBuilder = window.WebKitBlobBuilder,
    blobBuilder = new BlobBuilder(),
    URL = window.webkitURL,
    blob, workerURL;

blobBuilder.append(workerCode);
blob = blobBuilder.getBlob("text/javascript");
workerURL = URL.createObjectURL( blob );

function makeWorkerExecuteSomeCode( code, callback ) {
    var timeout;

    code = code + "";
    var worker = new Worker( workerURL );

    worker.addEventListener( "message", function(event) {
        clearTimeout(timeout);
        callback( event.data );
    });

    worker.postMessage({
        code: code
    });

    timeout = window.setTimeout( function() {
        callback( "Maximum execution time exceeded" );
        worker.terminate();
    }, 1000 );
}

bot.listen(
    /^\>(.+)$/,
    function ( msg ) {
        var maxLen = 1024;

        makeWorkerExecuteSomeCode( msg.matches[1], finish );

        function finish ( answer ) {
            if ( answer.length > maxLen ) {
                answer = '(snipped)' + answer.slice( 0, maxLen );
            }

            msg.directreply( answer );
        }
    }
);

}());

;

;
var moo = (function () {

var cowsay = {

	defaults : {
		e : 'oo',
		T : '  ',
		t : false,
		W : 40
	},

	//in the "template", e is for eye, T for Tongue, L for bubble-Line
	//it looks more like a donkey who was involved in a sledgehammer accident
	// because of escaping and newlines
	//the cow business is a dangerous one
	cow : [
		'',
		'        L   ^__^',
		'         L  (e)\\_______',
		'            (__)\\       )\\/\\',
		'             T ||----w |',
		'                ||     ||'
	].join( '\n' ),

	//message is the text to moo, opts is an optional object, mimicking the
	// cowsay command arguments:
	//   e  =>  eyes
	//   T  =>  tongue
	//   t  =>  is the cow thinking?
	//   W  =>  word-wrapping width
	//defaults specified in cowsay.defaults
	moo : function ( message, opts ) {
		var defs = this.defaults;

		//the eyes and tongue should be exactly 2 characters
		//if the ones the user gave are too short, pad'em
		this.eyes     = rightPad( opts.e || defs.e, 2 ).slice( 0, 2 );
		this.tongue   = rightPad( opts.T || defs.T, 2 ).slice( 0, 2 );
		this.line     = opts.t ? 'O' : '\\';
		this.thinking = opts.t;

		this.message  = wordWrap( message, opts.W || defs.W );

		//cowsay is actually the result of breeding a balloon and a cow
		return this.makeBalloon() + this.makeCow();
	},

	makeCow : function () {
		return this.cow
			.replace( /e/g, this.eyes )
			.replace( /T/g, this.tongue )
			.replace( /L/g, this.line );
	},

	makeBalloon : function () {
		var message = this.message.trim().split( '\n' );

		var longest = Math.max.apply(
			Math,
			message.map(function ( line ) {
				return line.length;
			})
		),

		//for the top and bottom lines of the thought bubble
			boundaryOccurences = new Array( longest + 2 ),
			topLine = boundaryOccurences.join( '_' ),
			btmLine = boundaryOccurences.join( '-' ),

			lineCount = message.length,
		//the border of the speech bubble
			border = this.chooseBorders( lineCount );

		//for every line of the message...
		var balloon = message.map(function ( line, idx ) {
			var padders;
			//top left and top right
			if ( idx === 0 ) {
				padders = border.slice( 0, 2 );
			}
			//bottom left and bottom right
			else if ( idx === lineCount-1 ) {
				padders = border.slice( 2, 4 );
			}
			//the wall
			else {
				padders = border.slice( -2 );
			}

			//return the message, padded with spaces to the right as to fit
			// with the border, enclosed in the matching borders
			return (
				padders[ 0 ] + ' ' +
				rightPad( line, longest ) + ' ' +
				padders[ 1 ]
			);
		});

		balloon.unshift( ' ' + topLine );
		balloon.push   ( ' ' + btmLine );

		return balloon.join( '\n' );
	},

	//choose the borders to use for the balloon
	chooseBorders : function ( lineCount ) {
		var border;

		//thought bubbles always look the same
		// ( moosage line 1 )
		// ( moosage line 2 )
		if ( this.thinking ) {
			border = [ '(', ')', '(', ')', '(', ')' ];
		}
		//single line messages are enclosed in < > and have no other borders
		// < mooosage >
		else if ( lineCount === 1 ) {
			border = [ '<', '>' ];
		}
		//multi-line messages have diaganol borders and straight walls
		// / moosage line 1 \
		// | moosage line 2 |
		// \ moosage line 3 /
		else {
			border = [ '/', '\\', '\\', '/', '|', '|' ];
		}

		return border;
	}
};


function wordWrap ( str, len ) {
	var lineLen = 0;
	return str.split( ' ' ).reduce( handleWord, '' );

	function handleWord ( ret, word ) {
		var wordLen = word.length;

		//let the wrapping...commence!
		if ( lineLen + wordLen > len ) {
			ret += '\n';
			lineLen = 0;
		}
		lineLen += wordLen + 1; //+1 for the space we now add

		return ret + word + ' ';
	}
}

function rightPad ( str, len, padder ) {
	padder = padder || ' ';
	while ( str.length < len ) {
		str += padder;
	}
	return str;
}


return function () {
	return cowsay.moo.apply( cowsay, arguments );
};

}());

bot.listen(
	/cow(think|say)\s(?:([eT])=(.{0,2})\s)?(?:([eT])=(.{0,2})\s)?(.+)/,

	function ( msg ) {
		//the first item is the whole match, second item is the "think" or
		// "say", last item is the message, we only want the "parameters"
		var args = msg.matches.slice( 2, -1 ),
			opts = {};

		for ( var i = 0, len = args.length; i < len; i += 2 ) {
			//if that capturing group got something,
			if ( args[i] && args[i+1] ) {
				//set that parameter
				opts[ args[i] ] = args[ i + 1 ];
			}
		}

		//cowsay or cowthink?
		opts.t = msg.matches[ 1 ] === 'think';

		var cowreact = moo( msg.matches.slice(-1)[0], opts );
		msg.respond( msg.codify(cowreact) );
	}
);

;
(function () {
"use strict";

var randomWord = function ( cb ) {
	var url = 'http://randomword.setgetgo.com/get.php';

	IO.jsonp({
		url : url,
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		cb( resp.Word.trim() );
	}
};

var game = {

	//the dude is just a template to be filled with parts
	dude : [
		'  +---+' ,
		'  |   |' ,
		'  |  413',
		'  |   2' ,
		'  |  5 6',
		'__+__'
	].join( '\n' ),

	parts : [ '', 'O', '|', '/', '\\', '/', '\\' ],

	word : '',
	revealed : '',

	guesses : [],
	guessNum : 0,
	maxGuess : 6,
	guessMade : false,

	end : true,
	msg : null,

	validGuessRegex : /^[\w\s]+$/,

	receiveMessage : function ( msg ) {
		this.msg = msg;

		if ( this.end ) {
			this.new();
		}
		if ( msg.content ) {
			return this.handleGuess( msg );
		}
	},

	new : function () {
		var that = this;

		randomWord(function ( word ) {
			bot.log( word + ' /hang random' );

			game.word = word;
			that.revealed = new Array( word.length + 1 ).join( '-' );
			that.guesses = [];
			that.guessNum = 0;

			//oh look, another dirty hack...this one is to make sure the
			// hangman is codified
			that.guessMade = true;

			that.register();
		});
	},

	handleGuess : function ( msg ) {
		var guess = msg.slice().toLowerCase();
		bot.log( guess, 'handleGuess' );

		if ( !this.validGuessRegex.test(guess) ) {
			return 'Only alphanumeric and whitespace characters allowed';
		}

		//check if it was already submitted
		if ( this.guesses.indexOf(guess) > -1 ) {
			return guess + ' was already submitted';
		}

		//or if it's the wrong length
		if ( guess.length < this.word.length ) {
			return guess + ' is shorter than the word.';
		}

		//replace all occurences of guest within the hidden word with their
		// actual characters
		var indexes = this.word.indexesOf( guess );
		indexes.forEach(function ( index ) {
			this.uncoverPart( guess, index );
		}, this);

		//not found in secret word, penalize the evil doers!
		if ( !indexes.length ) {
			this.guessNum++;
		}

		this.guesses.push( guess );
		this.guessMade = true;

		bot.log( guess, this.guessMade, 'handleGuess handled' );

		//plain vanilla lose-win checks
		if ( this.loseCheck() ) {
			return this.lose();
		}

		if ( this.winCheck() ) {
			return this.win();
		}
	},

	//unearth a portion of the secret word
	uncoverPart : function ( guess, startIndex ) {
		this.revealed =
			this.revealed.slice( 0, startIndex ) +
			guess +
			this.revealed.slice( startIndex + guess.length );
	},

	//attach the hangman drawing to the already guessed list and to the
	// revealed portion of the secret word
	preparePrint : function () {
		var that = this;

		//replace the placeholders in the dude with body parts
		var dude = this.dude.replace( /\d/g, function ( part ) {
			return part > that.guessNum ? ' ' : that.parts[ part ];
		});

		var belowDude = this.guesses.sort().join( ', ' ) + '\n' + this.revealed;

		var hangy = this.msg.codify( dude + belowDude );
		bot.log( hangy, this.msg );
		this.msg.respond( hangy );
	},

	//win the game
	win : function () {
		this.unregister();
		return 'Correct! The phrase is ' + this.word + '.';
	},

	//lose the game. less bitter messages? maybe.
	lose : function () {
		this.unregister();
		return 'You people suck. The phrase was ' + this.word;
	},

	winCheck : function () {
		return this.word === this.revealed;
	},

	loseCheck : function () {
		return this.guessNum >= this.maxGuess;
	},

	register : function () {
		this.unregister(); //to make sure it's not added multiple times
		IO.register( 'beforeoutput', this.buildOutput, this );

		this.end = false;
	},
	unregister : function () {
		IO.unregister( 'beforeoutput', this.buildOutput );

		this.end = true;
	},

	buildOutput : function () {
		if ( this.guessMade ) {
			this.preparePrint();

			this.guessMade = false;
		}
	}
};
bot.addCommand({
	name : 'hang',
	fun : game.receiveMessage,
	thisArg : game
});

}());

;
/*global bot:true, IO:true */
(function () {
//collection of nudges; msgObj, time left and the message itself
var nudges = [],
	interval = bot.adapter.in.pollInterval || 5000;

function update () {
	var now = Date.now();
	nudges = nudges.filter(function ( nudge ) {
		nudge.time -= interval;

		if ( nudge.time <= 0 ) {
			sendNudge( nudge );
			return false;
		}
		return true;
	});

	setTimeout( update, interval );
}
function sendNudge ( nudge ) {
	console.log( nudge, 'nudge fire' );
	//check to see if the nudge was sent after a bigger delay than expected
	//TODO: that ^
	bot.reply( nudge.message, nudge.msgObj );
}
setTimeout( update, interval );

//now for the command itself
function addNudge ( delay, msg, msgObj ) {
	var inMS;
	console.log( delay, msg, '/nudge input' );

	//interval will be one of these:
	// nm  =>  n minutes
	// n   =>  n minutes
	//so erm...yeah. just parse the bitch
	delay = parseFloat( delay );
	//minsInMs = mins * 60 * 1000
	//TODO: allow more than just minutes
	//TODO: upper cap
	inMS = delay * 60000;

	if ( isNaN(inMS) ) {
		return 'Many things can be labeled Not a Number; a delay should not' +
			' be one of them.';
	}

	//let's put an arbitrary comment here

	var nudge = {
		msgObj  : msgObj,
		message : msg || '*nudge*',
		register: Date.now(),
		time    : inMS
	};
	nudges.push( nudge );
	console.log( nudge, nudges, '/nudge register')

	return 'Nudge registered.';
}

bot.addCommand({
	name : 'nudge',
	fun  : nudgeCommand,
	permissions : {
		del : 'NONE'
	}
});

bot.listen(/(?:nudge|remind|poke)\s(?:me\s)?(?:in\s)?(\d+m?)\s?(.*)$/,
	nudgeListener
);

function nudgeCommand ( args ) {
	var props = args.parse();
	return addNudge( props[0], props.slice(1).join(' '), args.get() );
}
function nudgeListener ( args ) {
	return addNudge( args.matches[1], args.matches[2], args.get() );
}

}());

;
//infix operator-precedence parser
//also supports a d operator - a dice roll
var parsePrecedence = (function () {

//we don't care about whitespace. well, most whitespace
var whitespace = {
	' ' : true,
	'\t' : true
};

//the operators we deal with
var operators = {
	'+' : {
		precedence : 1,
		exec : function ( a, b ) {
			return a + b;
		}
	},

	'-' : {
		precedence : 1,
		exec : function ( a, b ) {
			return a - b;
		}
	},

	'*' : {
		precedence : 2,
		exec : function ( a, b ) {
			return a * b;
		}
	},

	'/' : {
		precedence : 2,
		exec : function ( a, b ) {
			if ( b === 0 ) {
				throw new Error( 'Division by 0' );
			}
			return a / b;
		}
	},

	'd' : {
		precedence : 3,
		exec : function ( rolls, sides, rollsSoFar ) {
			if ( rolls > 100 ) {
				throw new Error( 'Maximum roll count is 100' );
			}

			var ret = 0, roll;
			while ( rolls-- ) {
				roll = Math.floor( Math.random() * sides ) + 1;

				ret += roll;
				rollsSoFar.push( roll );
			}

			return ret;
		}
	}
};

var parser = {
	//not exactly stacks, but meh
	numberStack : null,
	operatorStack : null,
	rolls : null,

	//the source string and some metadata
	source : null,
	pos : 0,
	len : 0,
	lookahead : '',

	parse : function ( source ) {
		this.source = source;
		this.pos = 0;
		this.len = source.length;

		this.numberStack = [];
		this.operatorStack = [];
		this.rolls = [];

		this.tokenize();
		this.execute();

		//garbage collection, important for gianormo strings
		this.source = source = null;

		return {
			//the remaining number on the "stack" is the result
			total : this.numberStack[ 0 ],
			//we execute right->left, so the rolls array will be "backwards"
			rolls : this.rolls.reverse()
		};
	},

	//take the source string, and break it down into tokens
	tokenize : function () {
		var token, last, ch;

		for ( ; this.pos < this.len; this.pos++ ) {
			ch = this.lookahead = this.source[ this.pos ];

			if ( whitespace.hasOwnProperty(ch) ) {
				continue;
			}

			token = this.nextToken();

			if ( token.type === 'number' ) {
				this.numberStack.push( token.value );
			}

			else if ( token.type === 'operator' ) {
				last = this.operatorStack[ this.operatorStack.length - 1 ];

				//check for things like 1d2d3, which aren't valid
				if ( last && token.value === 'd' && last.value === 'd' ) {
					var itOnTheGround = new Error(
						'Unexpected unchainable operator d'
					);
					itOnTheGround.column = this.pos;

					throw itOnTheGround; //I'M AN ADULT!
				}

				this.operatorStack.push( token );
			}
		}

	},

	execute : function () {
		var idx;

		while ( idx = this.operatorStack.length ) {
			//execute, BACKWARDS! OH THE INSANITY
			while ( 0 <=-- idx ) {
				//.call is used so that `this` in execute will still refer to
				// the parser
				execute.call( this, this.operatorStack[idx], idx );
			}
		}

		function execute ( token, index ) {
			var last = this.operatorStack[ index + 1 ];

			//last one is more important than we are
			if ( last && last.precedence > token.precedence ) {
				//execute it
				this.operate( index + 1 );
			}
			//we're about to finish and the last one isn't as all-mighty as we
			// thought
			else if ( !index ) {
				//execute za operator!
				this.operate( index );
			}
		}
	},

	//fetch le token!
	nextToken : function () {
		var ch  = this.lookahead;
		var ret = {
			type : null,
			value : ch
		},
		res;

		//have we overflowed, while looking for something else?
		if ( this.pos >= this.len ) {
			throw new Error( 'Unexpected end of input' );
		}

		//is it a digit?
		else if ( ch >= 0 && ch < 10 ) {
			ret.type = 'number';
			res = this.fetchNumber();

			this.pos += res.length - 1;
			ret.value = res.value;
		}

		//is it an operator?
		else if ( operators.hasOwnProperty(ch) ) {
			ret.type = 'operator';
			ret.precedence = operators[ ch ].precedence;
		}

		//Y U TROLLZ!?!?
		else {
			var chuckNorris = new Error( 'Invalid character ' + ch );
			chuckNorris.column = this.pos;

			throw chuckNorris;
		}


		return ret;
	},

	operate : function ( index ) {
		//grab the two numbers we care about
		//since the source string looks like: 2 + 1
		// and the index param is actually the index of the operator to use,
		// we grab the index-th number and the index-th+1 number
		//in the above example, index = 0, we grab numberStack[0] and
		// numberStack[1]
		var couplet = this.numberStack.slice( index, index + 2 );
		//in addition to the numbers we operate on, there's also a dice-roll
		// operator, so we take it into consideration
		couplet.push( this.rolls );

		//arr.splice removes items and returns the removed items as an array
		//we remove the index-th item from the operatorStack and grab its
		// "value", which is the operator symbol (+, * etc)
		//when we have that value, we grab the corresponding operator object
		var op = operators[ this.operatorStack.splice(index, 1)[0].value ];

		//arr.splice, as well as removing items, can also add items
		//so, we slice-n-dice at the two numbers, grab the result of executing
		// the operator, and add that result where we finished slicing
		//for example:
		// [0, 1, 2].splice( 0, 2, 42 )
		//will make the array look like
		// [42, 2]
		this.numberStack.splice( index, 2, op.exec.apply(null, couplet) );
	},

	fetchNumber : function () {
		var offset = 0, num = '', ch;

		//keep eating digits until we find a non-digit
		while ( (ch = this.source[this.pos+offset]) >= 0 && ch < 10 ) {
			num += ch;
			offset++;
		}

		if ( num.length === 0 ) {
			throw new Error(
				'Incomplete operation: Expected number at ' + this.pos
			);
		}

		return {
			value : Number( num ),
			length : offset
		};
	}

};

//returns an object:
// total => result of all dice rolls and arithmetic operations
// rolls => array of results of each individual dice roll
return function ( source ) {
	return parser.parse( source );
};
}());

//now, to the command itself...
var roll = function ( args ) {
	if ( !/^[\d\s\+\-\*\/d]+$/.test(args) ) {
		return 'Invalid /roll argument; use `/help roll` for help';
	}

	var res = parsePrecedence( args );
	return res.rolls + ' => ' + res.total;
};

bot.addCommand({
	name : 'roll',
	fun : roll,
	permissions : {
		del : 'NONE'
	},
	description : [
		'Roll dice in DnD notation. `MdN` rolls `M` `N`-sided dice',
		'`MdN+X` rolls as said above, and adds `X` to the result'  ,
		'You can use any of the four arithmetic operators +-*/,'   ,
		'`X` can also be a die roll: `MdN*XdY` for example'
	].join( '. ' )
});

;
var specParts = [{"section":"introduction","name":"Introduction"},{"section":"x1","name":"1 Scope"},{"section":"x2","name":"2 Conformance"},{"section":"x3","name":"3 Normative references"},{"section":"x4","name":"4 Overview"},{"section":"x4.1","name":"4.1 Web Scripting"},{"section":"x4.2","name":"4.2 Language Overview"},{"section":"x4.2.1","name":"4.2.1 Objects"},{"section":"x4.2.2","name":"4.2.2 The Strict Variant of ECMAScript"},{"section":"x4.3","name":"4.3 Definitions"},{"section":"x4.3.1","name":"4.3.1 type"},{"section":"x4.3.2","name":"4.3.2 primitive value"},{"section":"x4.3.3","name":"4.3.3 object"},{"section":"x4.3.4","name":"4.3.4 constructor"},{"section":"x4.3.5","name":"4.3.5 prototype"},{"section":"x4.3.6","name":"4.3.6 native object"},{"section":"x4.3.7","name":"4.3.7 built-in object"},{"section":"x4.3.8","name":"4.3.8 host object"},{"section":"x4.3.9","name":"4.3.9 undefined value"},{"section":"x4.3.10","name":"4.3.10 Undefined type"},{"section":"x4.3.11","name":"4.3.11 null value"},{"section":"x4.3.12","name":"4.3.12 Null type"},{"section":"x4.3.13","name":"4.3.13 Boolean value"},{"section":"x4.3.14","name":"4.3.14 Boolean type"},{"section":"x4.3.15","name":"4.3.15 Boolean object"},{"section":"x4.3.16","name":"4.3.16 String value"},{"section":"x4.3.17","name":"4.3.17 String type"},{"section":"x4.3.18","name":"4.3.18 String object"},{"section":"x4.3.19","name":"4.3.19 Number value"},{"section":"x4.3.20","name":"4.3.20 Number type"},{"section":"x4.3.21","name":"4.3.21 Number object"},{"section":"x4.3.22","name":"4.3.22 Infinity"},{"section":"x4.3.23","name":"4.3.23 NaN"},{"section":"x4.3.24","name":"4.3.24 function"},{"section":"x4.3.25","name":"4.3.25 built-in function"},{"section":"x4.3.26","name":"4.3.26 property"},{"section":"x4.3.27","name":"4.3.27 method"},{"section":"x4.3.28","name":"4.3.28 built-in method"},{"section":"x4.3.29","name":"4.3.29 attribute"},{"section":"x4.3.30","name":"4.3.30 own property"},{"section":"x4.3.31","name":"4.3.31 inherited property"},{"section":"x5","name":"5 Notational Conventions"},{"section":"x5.1","name":"5.1 Syntactic and Lexical Grammars"},{"section":"x5.1.1","name":"5.1.1 Context-Free Grammars"},{"section":"x5.1.2","name":"5.1.2 The Lexical and RegExp Grammars"},{"section":"x5.1.3","name":"5.1.3 The Numeric String Grammar"},{"section":"x5.1.4","name":"5.1.4 The Syntactic Grammar"},{"section":"x5.1.5","name":"5.1.5 The JSON Grammar"},{"section":"x5.1.6","name":"5.1.6 Grammar Notation"},{"section":"x5.2","name":"5.2 Algorithm Conventions"},{"section":"x6","name":"6 Source Text"},{"section":"x7","name":"7 Lexical Conventions"},{"section":"x7.1","name":"7.1 Unicode Format-Control Characters"},{"section":"x7.2","name":"7.2 White Space"},{"section":"x7.3","name":"7.3 Line Terminators"},{"section":"x7.4","name":"7.4 Comments"},{"section":"x7.5","name":"7.5 Tokens"},{"section":"x7.6","name":"7.6 Identifier Names and Identifiers"},{"section":"x7.6.1","name":"7.6.1 Reserved Words"},{"section":"x7.6.1.1","name":"7.6.1.1 Keywords"},{"section":"x7.6.1.2","name":"7.6.1.2 Future Reserved Words"},{"section":"x7.7","name":"7.7 Punctuators"},{"section":"x7.8","name":"7.8 Literals"},{"section":"x7.8.1","name":"7.8.1 Null Literals"},{"section":"x7.8.2","name":"7.8.2 Boolean Literals"},{"section":"x7.8.3","name":"7.8.3 Numeric Literals"},{"section":"x7.8.4","name":"7.8.4 String Literals"},{"section":"x7.8.5","name":"7.8.5 Regular Expression Literals"},{"section":"x7.9","name":"7.9 Automatic Semicolon Insertion"},{"section":"x7.9.1","name":"7.9.1 Rules of Automatic Semicolon Insertion"},{"section":"x7.9.2","name":"7.9.2 Examples of Automatic Semicolon Insertion"},{"section":"x8","name":"8 Types"},{"section":"x8.1","name":"8.1 The Undefined Type"},{"section":"x8.2","name":"8.2 The Null Type"},{"section":"x8.3","name":"8.3 The Boolean Type"},{"section":"x8.4","name":"8.4 The String Type"},{"section":"x8.5","name":"8.5 The Number Type"},{"section":"x8.6","name":"8.6 The Object Type"},{"section":"x8.6.1","name":"8.6.1 Property Attributes"},{"section":"x8.6.2","name":"8.6.2 Object Internal Properties and Methods"},{"section":"x8.7","name":"8.7 The Reference Specification Type"},{"section":"x8.7.1","name":"8.7.1 GetValue (V)"},{"section":"x8.7.2","name":"8.7.2 PutValue (V, W)"},{"section":"x8.8","name":"8.8 The List Specification Type"},{"section":"x8.9","name":"8.9 The Completion Specification Type"},{"section":"x8.10","name":"8.10 The Property Descriptor and Property Identifier Specification Types"},{"section":"x8.10.1","name":"8.10.1 IsAccessorDescriptor ( Desc )"},{"section":"x8.10.2","name":"8.10.2 IsDataDescriptor ( Desc )"},{"section":"x8.10.3","name":"8.10.3 IsGenericDescriptor ( Desc )"},{"section":"x8.10.4","name":"8.10.4 FromPropertyDescriptor ( Desc )"},{"section":"x8.10.5","name":"8.10.5 ToPropertyDescriptor ( Obj )"},{"section":"x8.11","name":"8.11 The Lexical Environment and Environment Record Specification Types"},{"section":"x8.12","name":"8.12 Algorithms for Object Internal Methods"},{"section":"x8.12.1","name":"8.12.1 [[GetOwnProperty]] (P)"},{"section":"x8.12.2","name":"8.12.2 [[GetProperty]] (P)"},{"section":"x8.12.3","name":"8.12.3 [[Get]] (P)"},{"section":"x8.12.4","name":"8.12.4 [[CanPut]] (P)"},{"section":"x8.12.5","name":"8.12.5 [[Put]] ( P, V, Throw )"},{"section":"x8.12.6","name":"8.12.6 [[HasProperty]] (P)"},{"section":"x8.12.7","name":"8.12.7 [[Delete]] (P, Throw)"},{"section":"x8.12.8","name":"8.12.8 [[DefaultValue]] (hint)"},{"section":"x8.12.9","name":"8.12.9 [[DefineOwnProperty]] (P, Desc, Throw)"},{"section":"x9","name":"9 Type Conversion and Testing"},{"section":"x9.1","name":"9.1 ToPrimitive"},{"section":"x9.2","name":"9.2 ToBoolean"},{"section":"x9.3","name":"9.3 ToNumber"},{"section":"x9.3.1","name":"9.3.1 ToNumber Applied to the String Type"},{"section":"x9.4","name":"9.4 ToInteger"},{"section":"x9.5","name":"9.5 ToInt32: (Signed 32 Bit Integer)"},{"section":"x9.6","name":"9.6 ToUint32: (Unsigned 32 Bit Integer)"},{"section":"x9.7","name":"9.7 ToUint16: (Unsigned 16 Bit Integer)"},{"section":"x9.8","name":"9.8 ToString"},{"section":"x9.8.1","name":"9.8.1 ToString Applied to the Number Type"},{"section":"x9.9","name":"9.9 ToObject"},{"section":"x9.10","name":"9.10 CheckObjectCoercible"},{"section":"x9.11","name":"9.11 IsCallable"},{"section":"x9.12","name":"9.12 The SameValue Algorithm"},{"section":"x10","name":"10 Executable Code and Execution Contexts"},{"section":"x10.1","name":"10.1 Types of Executable Code"},{"section":"x10.1.1","name":"10.1.1 Strict Mode Code"},{"section":"x10.2","name":"10.2 Lexical Environments"},{"section":"x10.2.1","name":"10.2.1 Environment Records"},{"section":"x10.2.1.1","name":"10.2.1.1 Declarative Environment Records"},{"section":"x10.2.1.1.1","name":"10.2.1.1.1 HasBinding(N)"},{"section":"x10.2.1.1.2","name":"10.2.1.1.2 CreateMutableBinding (N, D)"},{"section":"x10.2.1.1.3","name":"10.2.1.1.3 SetMutableBinding (N,V,S)"},{"section":"x10.2.1.1.4","name":"10.2.1.1.4 GetBindingValue(N,S)"},{"section":"x10.2.1.1.5","name":"10.2.1.1.5 DeleteBinding (N)"},{"section":"x10.2.1.1.6","name":"10.2.1.1.6 ImplicitThisValue()"},{"section":"x10.2.1.1.7","name":"10.2.1.1.7 CreateImmutableBinding (N)"},{"section":"x10.2.1.1.8","name":"10.2.1.1.8 InitializeImmutableBinding (N,V)"},{"section":"x10.2.1.2","name":"10.2.1.2 Object Environment Records"},{"section":"x10.2.1.2.1","name":"10.2.1.2.1 HasBinding(N)"},{"section":"x10.2.1.2.2","name":"10.2.1.2.2 CreateMutableBinding (N, D)"},{"section":"x10.2.1.2.3","name":"10.2.1.2.3 SetMutableBinding (N,V,S)"},{"section":"x10.2.1.2.4","name":"10.2.1.2.4 GetBindingValue(N,S)"},{"section":"x10.2.1.2.5","name":"10.2.1.2.5 DeleteBinding (N)"},{"section":"x10.2.1.2.6","name":"10.2.1.2.6 ImplicitThisValue()"},{"section":"x10.2.2","name":"10.2.2 Lexical Environment Operations"},{"section":"x10.2.2.1","name":"10.2.2.1 GetIdentifierReference (lex, name, strict)"},{"section":"x10.2.2.2","name":"10.2.2.2 NewDeclarativeEnvironment (E)"},{"section":"x10.2.2.3","name":"10.2.2.3 NewObjectEnvironment (O, E)"},{"section":"x10.2.3","name":"10.2.3 The Global Environment"},{"section":"x10.3","name":"10.3 Execution Contexts"},{"section":"x10.3.1","name":"10.3.1 Identifier Resolution"},{"section":"x10.4","name":"10.4 Establishing an Execution Context"},{"section":"x10.4.1","name":"10.4.1 Entering Global Code"},{"section":"x10.4.1.1","name":"10.4.1.1 Initial Global Execution Context"},{"section":"x10.4.2","name":"10.4.2 Entering Eval Code"},{"section":"x10.4.2.1","name":"10.4.2.1 Strict Mode Restrictions"},{"section":"x10.4.3","name":"10.4.3 Entering Function Code"},{"section":"x10.5","name":"10.5 Declaration Binding Instantiation"},{"section":"x10.6","name":"10.6 Arguments Object"},{"section":"x11","name":"11 Expressions"},{"section":"x11.1","name":"11.1 Primary Expressions"},{"section":"x11.1.1","name":"11.1.1 The this Keyword"},{"section":"x11.1.2","name":"11.1.2 Identifier Reference"},{"section":"x11.1.3","name":"11.1.3 Literal Reference"},{"section":"x11.1.4","name":"11.1.4 Array Initialiser"},{"section":"x11.1.5","name":"11.1.5 Object Initialiser"},{"section":"x11.1.6","name":"11.1.6 The Grouping Operator"},{"section":"x11.2","name":"11.2 Left-Hand-Side Expressions"},{"section":"x11.2.1","name":"11.2.1 Property Accessors"},{"section":"x11.2.2","name":"11.2.2 The new Operator"},{"section":"x11.2.3","name":"11.2.3 Function Calls"},{"section":"x11.2.4","name":"11.2.4 Argument Lists"},{"section":"x11.2.5","name":"11.2.5 Function Expressions"},{"section":"x11.3","name":"11.3 Postfix Expressions"},{"section":"x11.3.1","name":"11.3.1 Postfix Increment Operator"},{"section":"x11.3.2","name":"11.3.2 Postfix Decrement Operator"},{"section":"x11.4","name":"11.4 Unary Operators"},{"section":"x11.4.1","name":"11.4.1 The delete Operator"},{"section":"x11.4.2","name":"11.4.2 The void Operator"},{"section":"x11.4.3","name":"11.4.3 The typeof Operator"},{"section":"x11.4.4","name":"11.4.4 Prefix Increment Operator"},{"section":"x11.4.5","name":"11.4.5 Prefix Decrement Operator"},{"section":"x11.4.6","name":"11.4.6 Unary + Operator"},{"section":"x11.4.7","name":"11.4.7 Unary - Operator"},{"section":"x11.4.8","name":"11.4.8 Bitwise NOT Operator ( ~ )"},{"section":"x11.4.9","name":"11.4.9 Logical NOT Operator ( ! )"},{"section":"x11.5","name":"11.5 Multiplicative Operators"},{"section":"x11.5.1","name":"11.5.1 Applying the * Operator"},{"section":"x11.5.2","name":"11.5.2 Applying the / Operator"},{"section":"x11.5.3","name":"11.5.3 Applying the % Operator"},{"section":"x11.6","name":"11.6 Additive Operators"},{"section":"x11.6.1","name":"11.6.1 The Addition operator ( + )"},{"section":"x11.6.2","name":"11.6.2 The Subtraction Operator ( - )"},{"section":"x11.6.3","name":"11.6.3 Applying the Additive Operators to Numbers"},{"section":"x11.7","name":"11.7 Bitwise Shift Operators"},{"section":"x11.7.1","name":"11.7.1 The Left Shift Operator ( << )"},{"section":"x11.7.2","name":"11.7.2 The Signed Right Shift Operator ( >> )"},{"section":"x11.7.3","name":"11.7.3 The Unsigned Right Shift Operator ( >>> )"},{"section":"x11.8","name":"11.8 Relational Operators"},{"section":"x11.8.1","name":"11.8.1 The Less-than Operator ( < )"},{"section":"x11.8.2","name":"11.8.2 The Greater-than Operator ( > )"},{"section":"x11.8.3","name":"11.8.3 The Less-than-or-equal Operator ( <= )"},{"section":"x11.8.4","name":"11.8.4 The Greater-than-or-equal Operator ( >= )"},{"section":"x11.8.5","name":"11.8.5 The Abstract Relational Comparison Algorithm"},{"section":"x11.8.6","name":"11.8.6 The instanceof operator"},{"section":"x11.8.7","name":"11.8.7 The in operator"},{"section":"x11.9","name":"11.9 Equality Operators"},{"section":"x11.9.1","name":"11.9.1 The Equals Operator ( == )"},{"section":"x11.9.2","name":"11.9.2 The Does-not-equals Operator ( != )"},{"section":"x11.9.3","name":"11.9.3 The Abstract Equality Comparison Algorithm"},{"section":"x11.9.4","name":"11.9.4 The Strict Equals Operator ( === )"},{"section":"x11.9.5","name":"11.9.5 The Strict Does-not-equal Operator ( !== )"},{"section":"x11.9.6","name":"11.9.6 The Strict Equality Comparison Algorithm"},{"section":"x11.10","name":"11.10 Binary Bitwise Operators"},{"section":"x11.11","name":"11.11 Binary Logical Operators"},{"section":"x11.12","name":"11.12 Conditional Operator ( ? : )"},{"section":"x11.13","name":"11.13 Assignment Operators"},{"section":"x11.13.1","name":"11.13.1 Simple Assignment ( = )"},{"section":"x11.13.2","name":"11.13.2 Compound Assignment ( op= )"},{"section":"x11.14","name":"11.14 Comma Operator ( , )"},{"section":"x12","name":"12 Statements"},{"section":"x12.1","name":"12.1 Block"},{"section":"x12.2","name":"12.2 Variable Statement"},{"section":"x12.2.1","name":"12.2.1 Strict Mode Restrictions"},{"section":"x12.3","name":"12.3 Empty Statement"},{"section":"x12.4","name":"12.4 Expression Statement"},{"section":"x12.5","name":"12.5 The if Statement"},{"section":"x12.6","name":"12.6 Iteration Statements"},{"section":"x12.6.1","name":"12.6.1 The do-while Statement"},{"section":"x12.6.2","name":"12.6.2 The while Statement"},{"section":"x12.6.3","name":"12.6.3 The for Statement"},{"section":"x12.6.4","name":"12.6.4 The for-in Statement"},{"section":"x12.7","name":"12.7 The continue Statement"},{"section":"x12.8","name":"12.8 The break Statement"},{"section":"x12.9","name":"12.9 The return Statement"},{"section":"x12.10","name":"12.10 The with Statement"},{"section":"x12.10.1","name":"12.10.1 Strict Mode Restrictions"},{"section":"x12.11","name":"12.11 The switch Statement"},{"section":"x12.12","name":"12.12 Labelled Statements"},{"section":"x12.13","name":"12.13 The throw Statement"},{"section":"x12.14","name":"12.14 The try Statement"},{"section":"x12.14.1","name":"12.14.1 Strict Mode Restrictions"},{"section":"x12.15","name":"12.15 The debugger statement"},{"section":"x13","name":"13 Function Definition"},{"section":"x13.1","name":"13.1 Strict Mode Restrictions"},{"section":"x13.2","name":"13.2 Creating Function Objects"},{"section":"x13.2.1","name":"13.2.1 [[Call]]"},{"section":"x13.2.2","name":"13.2.2 [[Construct]]"},{"section":"x13.2.3","name":"13.2.3 The Function Object"},{"section":"x14","name":"14 Program"},{"section":"x14.1","name":"14.1 Directive Prologues and the Use Strict Directive"},{"section":"x15","name":"15 Standard Built-in ECMAScript Objects"},{"section":"x15.1","name":"15.1 The Global Object"},{"section":"x15.1.1","name":"15.1.1 Value Properties of the Global Object"},{"section":"x15.1.1.1","name":"15.1.1.1 NaN"},{"section":"x15.1.1.2","name":"15.1.1.2 Infinity"},{"section":"x15.1.1.3","name":"15.1.1.3 undefined"},{"section":"x15.1.2","name":"15.1.2 Function Properties of the Global Object"},{"section":"x15.1.2.1","name":"15.1.2.1 eval (x)"},{"section":"x15.1.2.1.1","name":"15.1.2.1.1 Direct Call to Eval"},{"section":"x15.1.2.2","name":"15.1.2.2 parseInt (string , radix)"},{"section":"x15.1.2.3","name":"15.1.2.3 parseFloat (string)"},{"section":"x15.1.2.4","name":"15.1.2.4 isNaN (number)"},{"section":"x15.1.2.5","name":"15.1.2.5 isFinite (number)"},{"section":"x15.1.3","name":"15.1.3 URI Handling Function Properties"},{"section":"x15.1.3.1","name":"15.1.3.1 decodeURI (encodedURI)"},{"section":"x15.1.3.2","name":"15.1.3.2 decodeURIComponent (encodedURIComponent)"},{"section":"x15.1.3.3","name":"15.1.3.3 encodeURI (uri)"},{"section":"x15.1.3.4","name":"15.1.3.4 encodeURIComponent (uriComponent)"},{"section":"x15.1.4","name":"15.1.4 Constructor Properties of the Global Object"},{"section":"x15.1.4.1","name":"15.1.4.1 Object ( . . . )"},{"section":"x15.1.4.2","name":"15.1.4.2 Function ( . . . )"},{"section":"x15.1.4.3","name":"15.1.4.3 Array ( . . . )"},{"section":"x15.1.4.4","name":"15.1.4.4 String ( . . . )"},{"section":"x15.1.4.5","name":"15.1.4.5 Boolean ( . . . )"},{"section":"x15.1.4.6","name":"15.1.4.6 Number ( . . . )"},{"section":"x15.1.4.7","name":"15.1.4.7 Date ( . . . )"},{"section":"x15.1.4.8","name":"15.1.4.8 RegExp ( . . . )"},{"section":"x15.1.4.9","name":"15.1.4.9 Error ( . . . )"},{"section":"x15.1.4.10","name":"15.1.4.10 EvalError ( . . . )"},{"section":"x15.1.4.11","name":"15.1.4.11 RangeError ( . . . )"},{"section":"x15.1.4.12","name":"15.1.4.12 ReferenceError ( . . . )"},{"section":"x15.1.4.13","name":"15.1.4.13 SyntaxError ( . . . )"},{"section":"x15.1.4.14","name":"15.1.4.14 TypeError ( . . . )"},{"section":"x15.1.4.15","name":"15.1.4.15 URIError ( . . . )"},{"section":"x15.1.5","name":"15.1.5 Other Properties of the Global Object"},{"section":"x15.1.5.1","name":"15.1.5.1 Math"},{"section":"x15.1.5.2","name":"15.1.5.2 JSON"},{"section":"x15.2","name":"15.2 Object Objects"},{"section":"x15.2.1","name":"15.2.1 The Object Constructor Called as a Function"},{"section":"x15.2.1.1","name":"15.2.1.1 Object ( [ value ] )"},{"section":"x15.2.2","name":"15.2.2 The Object Constructor"},{"section":"x15.2.2.1","name":"15.2.2.1 new Object ( [ value ] )"},{"section":"x15.2.3","name":"15.2.3 Properties of the Object Constructor"},{"section":"x15.2.3.1","name":"15.2.3.1 Object.prototype"},{"section":"x15.2.3.2","name":"15.2.3.2 Object.getPrototypeOf ( O )"},{"section":"x15.2.3.3","name":"15.2.3.3 Object.getOwnPropertyDescriptor ( O, P ) "},{"section":"x15.2.3.4","name":"15.2.3.4 Object.getOwnPropertyNames ( O )"},{"section":"x15.2.3.5","name":"15.2.3.5 Object.create ( O [, Properties] )"},{"section":"x15.2.3.6","name":"15.2.3.6 Object.defineProperty ( O, P, Attributes )"},{"section":"x15.2.3.7","name":"15.2.3.7 Object.defineProperties ( O, Properties )"},{"section":"x15.2.3.8","name":"15.2.3.8 Object.seal ( O )"},{"section":"x15.2.3.9","name":"15.2.3.9 Object.freeze ( O )"},{"section":"x15.2.3.10","name":"15.2.3.10 Object.preventExtensions ( O )"},{"section":"x15.2.3.11","name":"15.2.3.11 Object.isSealed ( O )"},{"section":"x15.2.3.12","name":"15.2.3.12 Object.isFrozen ( O )"},{"section":"x15.2.3.13","name":"15.2.3.13 Object.isExtensible ( O )"},{"section":"x15.2.3.14","name":"15.2.3.14 Object.keys ( O )"},{"section":"x15.2.4","name":"15.2.4 Properties of the Object Prototype Object"},{"section":"x15.2.4.1","name":"15.2.4.1 Object.prototype.constructor"},{"section":"x15.2.4.2","name":"15.2.4.2 Object.prototype.toString ( )"},{"section":"x15.2.4.3","name":"15.2.4.3 Object.prototype.toLocaleString ( )"},{"section":"x15.2.4.4","name":"15.2.4.4 Object.prototype.valueOf ( )"},{"section":"x15.2.4.5","name":"15.2.4.5 Object.prototype.hasOwnProperty (V)"},{"section":"x15.2.4.6","name":"15.2.4.6 Object.prototype.isPrototypeOf (V)"},{"section":"x15.2.4.7","name":"15.2.4.7 Object.prototype.propertyIsEnumerable (V)"},{"section":"x15.2.5","name":"15.2.5 Properties of Object Instances"},{"section":"x15.3","name":"15.3 Function Objects"},{"section":"x15.3.1","name":"15.3.1 The Function Constructor Called as a Function"},{"section":"x15.3.1.1","name":"15.3.1.1 Function (p1, p2, … , pn, body)"},{"section":"x15.3.2","name":"15.3.2 The Function Constructor"},{"section":"x15.3.2.1","name":"15.3.2.1 new Function (p1, p2, … , pn, body)"},{"section":"x15.3.3","name":"15.3.3 Properties of the Function Constructor"},{"section":"x15.3.3.1","name":"15.3.3.1 Function.prototype"},{"section":"x15.3.3.2","name":"15.3.3.2 Function.length"},{"section":"x15.3.4","name":"15.3.4 Properties of the Function Prototype Object"},{"section":"x15.3.4.1","name":"15.3.4.1 Function.prototype.constructor"},{"section":"x15.3.4.2","name":"15.3.4.2 Function.prototype.toString ( )"},{"section":"x15.3.4.3","name":"15.3.4.3 Function.prototype.apply (thisArg, argArray)"},{"section":"x15.3.4.4","name":"15.3.4.4 Function.prototype.call (thisArg [ , arg1 [ , arg2, … ] ] )"},{"section":"x15.3.4.5","name":"15.3.4.5 Function.prototype.bind (thisArg [, arg1 [, arg2, …]])"},{"section":"x15.3.4.5.1","name":"15.3.4.5.1 [[Call]]"},{"section":"x15.3.4.5.2","name":"15.3.4.5.2 [[Construct]]"},{"section":"x15.3.4.5.3","name":"15.3.4.5.3 [[HasInstance]] (V)"},{"section":"x15.3.5","name":"15.3.5 Properties of Function Instances"},{"section":"x15.3.5.1","name":"15.3.5.1 length"},{"section":"x15.3.5.2","name":"15.3.5.2 prototype"},{"section":"x15.3.5.3","name":"15.3.5.3 [[HasInstance]] (V)"},{"section":"x15.3.5.4","name":"15.3.5.4 [[Get]] (P)"},{"section":"x15.4","name":"15.4 Array Objects"},{"section":"x15.4.1","name":"15.4.1 The Array Constructor Called as a Function"},{"section":"x15.4.1.1","name":"15.4.1.1 Array ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.2","name":"15.4.2 The Array Constructor"},{"section":"x15.4.2.1","name":"15.4.2.1 new Array ( [ item0 [ , item1 [ , … ] ] ] )"},{"section":"x15.4.2.2","name":"15.4.2.2 new Array (len)"},{"section":"x15.4.3","name":"15.4.3 Properties of the Array Constructor"},{"section":"x15.4.3.1","name":"15.4.3.1 Array.prototype"},{"section":"x15.4.3.2","name":"15.4.3.2 Array.isArray ( arg )"},{"section":"x15.4.4","name":"15.4.4 Properties of the Array Prototype Object"},{"section":"x15.4.4.1","name":"15.4.4.1 Array.prototype.constructor"},{"section":"x15.4.4.2","name":"15.4.4.2 Array.prototype.toString ( )"},{"section":"x15.4.4.3","name":"15.4.4.3 Array.prototype.toLocaleString ( )"},{"section":"x15.4.4.4","name":"15.4.4.4 Array.prototype.concat ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.5","name":"15.4.4.5 Array.prototype.join (separator)"},{"section":"x15.4.4.6","name":"15.4.4.6 Array.prototype.pop ( )"},{"section":"x15.4.4.7","name":"15.4.4.7 Array.prototype.push ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.8","name":"15.4.4.8 Array.prototype.reverse ( )"},{"section":"x15.4.4.9","name":"15.4.4.9 Array.prototype.shift ( )"},{"section":"x15.4.4.10","name":"15.4.4.10 Array.prototype.slice (start, end)"},{"section":"x15.4.4.11","name":"15.4.4.11 Array.prototype.sort (comparefn)"},{"section":"x15.4.4.12","name":"15.4.4.12 Array.prototype.splice (start, deleteCount [ , item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.13","name":"15.4.4.13 Array.prototype.unshift ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.14","name":"15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )"},{"section":"x15.4.4.15","name":"15.4.4.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )"},{"section":"x15.4.4.16","name":"15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.17","name":"15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.18","name":"15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.19","name":"15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.20","name":"15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.21","name":"15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )"},{"section":"x15.4.4.22","name":"15.4.4.22 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )"},{"section":"x15.4.5","name":"15.4.5 Properties of Array Instances"},{"section":"x15.4.5.1","name":"15.4.5.1 [[DefineOwnProperty]] ( P, Desc, Throw )"},{"section":"x15.4.5.2","name":"15.4.5.2 length"},{"section":"x15.5","name":"15.5 String Objects"},{"section":"x15.5.1","name":"15.5.1 The String Constructor Called as a Function"},{"section":"x15.5.1.1","name":"15.5.1.1 String ( [ value ] )"},{"section":"x15.5.2","name":"15.5.2 The String Constructor"},{"section":"x15.5.2.1","name":"15.5.2.1 new String ( [ value ] )"},{"section":"x15.5.3","name":"15.5.3 Properties of the String Constructor"},{"section":"x15.5.3.1","name":"15.5.3.1 String.prototype"},{"section":"x15.5.3.2","name":"15.5.3.2 String.fromCharCode ( [ char0 [ , char1 [ , … ] ] ] )"},{"section":"x15.5.4","name":"15.5.4 Properties of the String Prototype Object"},{"section":"x15.5.4.1","name":"15.5.4.1 String.prototype.constructor"},{"section":"x15.5.4.2","name":"15.5.4.2 String.prototype.toString ( )"},{"section":"x15.5.4.3","name":"15.5.4.3 String.prototype.valueOf ( )"},{"section":"x15.5.4.4","name":"15.5.4.4 String.prototype.charAt (pos)"},{"section":"x15.5.4.5","name":"15.5.4.5 String.prototype.charCodeAt (pos)"},{"section":"x15.5.4.6","name":"15.5.4.6 String.prototype.concat ( [ string1 [ , string2 [ , … ] ] ] )"},{"section":"x15.5.4.7","name":"15.5.4.7 String.prototype.indexOf (searchString, position)"},{"section":"x15.5.4.8","name":"15.5.4.8 String.prototype.lastIndexOf (searchString, position)"},{"section":"x15.5.4.9","name":"15.5.4.9 String.prototype.localeCompare (that)"},{"section":"x15.5.4.10","name":"15.5.4.10 String.prototype.match (regexp)"},{"section":"x15.5.4.11","name":"15.5.4.11 String.prototype.replace (searchValue, replaceValue)"},{"section":"x15.5.4.12","name":"15.5.4.12 String.prototype.search (regexp)"},{"section":"x15.5.4.13","name":"15.5.4.13 String.prototype.slice (start, end)"},{"section":"x15.5.4.14","name":"15.5.4.14 String.prototype.split (separator, limit)"},{"section":"x15.5.4.15","name":"15.5.4.15 String.prototype.substring (start, end)"},{"section":"x15.5.4.16","name":"15.5.4.16 String.prototype.toLowerCase ( )"},{"section":"x15.5.4.17","name":"15.5.4.17 String.prototype.toLocaleLowerCase ( )"},{"section":"x15.5.4.18","name":"15.5.4.18 String.prototype.toUpperCase ( )"},{"section":"x15.5.4.19","name":"15.5.4.19 String.prototype.toLocaleUpperCase ( )"},{"section":"x15.5.4.20","name":"15.5.4.20 String.prototype.trim ( )"},{"section":"x15.5.5","name":"15.5.5 Properties of String Instances"},{"section":"x15.5.5.1","name":"15.5.5.1 length"},{"section":"x15.5.5.2","name":"15.5.5.2 [[GetOwnProperty]] ( P )"},{"section":"x15.6","name":"15.6 Boolean Objects"},{"section":"x15.6.1","name":"15.6.1 The Boolean Constructor Called as a Function"},{"section":"x15.6.1.1","name":"15.6.1.1 Boolean (value)"},{"section":"x15.6.2","name":"15.6.2 The Boolean Constructor"},{"section":"x15.6.2.1","name":"15.6.2.1 new Boolean (value)"},{"section":"x15.6.3","name":"15.6.3 Properties of the Boolean Constructor"},{"section":"x15.6.3.1","name":"15.6.3.1 Boolean.prototype"},{"section":"x15.6.4","name":"15.6.4 Properties of the Boolean Prototype Object"},{"section":"x15.6.4.1","name":"15.6.4.1 Boolean.prototype.constructor"},{"section":"x15.6.4.2","name":"15.6.4.2 Boolean.prototype.toString ( )"},{"section":"x15.6.4.3","name":"15.6.4.3 Boolean.prototype.valueOf ( )"},{"section":"x15.6.5","name":"15.6.5 Properties of Boolean Instances"},{"section":"x15.7","name":"15.7 Number Objects"},{"section":"x15.7.1","name":"15.7.1 The Number Constructor Called as a Function"},{"section":"x15.7.1.1","name":"15.7.1.1 Number ( [ value ] )"},{"section":"x15.7.2","name":"15.7.2 The Number Constructor"},{"section":"x15.7.2.1","name":"15.7.2.1 new Number ( [ value ] )"},{"section":"x15.7.3","name":"15.7.3 Properties of the Number Constructor"},{"section":"x15.7.3.1","name":"15.7.3.1 Number.prototype"},{"section":"x15.7.3.2","name":"15.7.3.2 Number.MAX_VALUE"},{"section":"x15.7.3.3","name":"15.7.3.3 Number.MIN_VALUE"},{"section":"x15.7.3.4","name":"15.7.3.4 Number.NaN"},{"section":"x15.7.3.5","name":"15.7.3.5 Number.NEGATIVE_INFINITY"},{"section":"x15.7.3.6","name":"15.7.3.6 Number.POSITIVE_INFINITY"},{"section":"x15.7.4","name":"15.7.4 Properties of the Number Prototype Object"},{"section":"x15.7.4.1","name":"15.7.4.1 Number.prototype.constructor"},{"section":"x15.7.4.2","name":"15.7.4.2 Number.prototype.toString ( [ radix ] )"},{"section":"x15.7.4.3","name":"15.7.4.3 Number.prototype.toLocaleString()"},{"section":"x15.7.4.4","name":"15.7.4.4 Number.prototype.valueOf ( )"},{"section":"x15.7.4.5","name":"15.7.4.5 Number.prototype.toFixed (fractionDigits)"},{"section":"x15.7.4.6","name":"15.7.4.6 Number.prototype.toExponential (fractionDigits)"},{"section":"x15.7.4.7","name":"15.7.4.7 Number.prototype.toPrecision (precision)"},{"section":"x15.7.5","name":"15.7.5 Properties of Number Instances"},{"section":"x15.8","name":"15.8 The Math Object"},{"section":"x15.8.1","name":"15.8.1 Value Properties of the Math Object"},{"section":"x15.8.1.1","name":"15.8.1.1 E"},{"section":"x15.8.1.2","name":"15.8.1.2 LN10"},{"section":"x15.8.1.3","name":"15.8.1.3 LN2"},{"section":"x15.8.1.4","name":"15.8.1.4 LOG2E"},{"section":"x15.8.1.5","name":"15.8.1.5 LOG10E"},{"section":"x15.8.1.6","name":"15.8.1.6 PI"},{"section":"x15.8.1.7","name":"15.8.1.7 SQRT1_2"},{"section":"x15.8.1.8","name":"15.8.1.8 SQRT2"},{"section":"x15.8.2","name":"15.8.2 Function Properties of the Math Object"},{"section":"x15.8.2.1","name":"15.8.2.1 abs (x)"},{"section":"x15.8.2.2","name":"15.8.2.2 acos (x)"},{"section":"x15.8.2.3","name":"15.8.2.3 asin (x)"},{"section":"x15.8.2.4","name":"15.8.2.4 atan (x)"},{"section":"x15.8.2.5","name":"15.8.2.5 atan2 (y, x)"},{"section":"x15.8.2.6","name":"15.8.2.6 ceil (x)"},{"section":"x15.8.2.7","name":"15.8.2.7 cos (x)"},{"section":"x15.8.2.8","name":"15.8.2.8 exp (x)"},{"section":"x15.8.2.9","name":"15.8.2.9 floor (x)"},{"section":"x15.8.2.10","name":"15.8.2.10 log (x)"},{"section":"x15.8.2.11","name":"15.8.2.11 max ( [ value1 [ , value2 [ , … ] ] ] )"},{"section":"x15.8.2.12","name":"15.8.2.12 min ( [ value1 [ , value2 [ , … ] ] ] )"},{"section":"x15.8.2.13","name":"15.8.2.13 pow (x, y)"},{"section":"x15.8.2.14","name":"15.8.2.14 random ( )"},{"section":"x15.8.2.15","name":"15.8.2.15 round (x)"},{"section":"x15.8.2.16","name":"15.8.2.16 sin (x)"},{"section":"x15.8.2.17","name":"15.8.2.17 sqrt (x)"},{"section":"x15.8.2.18","name":"15.8.2.18 tan (x)"},{"section":"x15.9","name":"15.9 Date Objects"},{"section":"x15.9.1","name":"15.9.1 Overview of Date Objects and Definitions of Abstract Operators"},{"section":"x15.9.1.1","name":"15.9.1.1 Time Values and Time Range"},{"section":"x15.9.1.2","name":"15.9.1.2 Day Number and Time within Day"},{"section":"x15.9.1.3","name":"15.9.1.3 Year Number"},{"section":"x15.9.1.4","name":"15.9.1.4 Month Number"},{"section":"x15.9.1.5","name":"15.9.1.5 Date Number"},{"section":"x15.9.1.6","name":"15.9.1.6 Week Day"},{"section":"x15.9.1.7","name":"15.9.1.7 Local Time Zone Adjustment"},{"section":"x15.9.1.8","name":"15.9.1.8 Daylight Saving Time Adjustment"},{"section":"x15.9.1.9","name":"15.9.1.9 Local Time"},{"section":"x15.9.1.10","name":"15.9.1.10 Hours, Minutes, Second, and Milliseconds"},{"section":"x15.9.1.11","name":"15.9.1.11 MakeTime (hour, min, sec, ms)"},{"section":"x15.9.1.12","name":"15.9.1.12 MakeDay (year, month, date)"},{"section":"x15.9.1.13","name":"15.9.1.13 MakeDate (day, time)"},{"section":"x15.9.1.14","name":"15.9.1.14 TimeClip (time)"},{"section":"x15.9.1.15","name":"15.9.1.15 Date Time String Format"},{"section":"x15.9.1.15.1","name":"15.9.1.15.1 Extended years"},{"section":"x15.9.2","name":"15.9.2 The Date Constructor Called as a Function"},{"section":"x15.9.2.1","name":"15.9.2.1 Date ( [ year [, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ] ] ] )"},{"section":"x15.9.3","name":"15.9.3 The Date Constructor"},{"section":"x15.9.3.1","name":"15.9.3.1 new Date (year, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ] )"},{"section":"x15.9.3.2","name":"15.9.3.2 new Date (value)"},{"section":"x15.9.3.3","name":"15.9.3.3 new Date ( )"},{"section":"x15.9.4","name":"15.9.4 Properties of the Date Constructor"},{"section":"x15.9.4.1","name":"15.9.4.1 Date.prototype"},{"section":"x15.9.4.2","name":"15.9.4.2 Date.parse (string)"},{"section":"x15.9.4.3","name":"15.9.4.3 Date.UTC (year, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ])"},{"section":"x15.9.4.4","name":"15.9.4.4 Date.now ( )"},{"section":"x15.9.5","name":"15.9.5 Properties of the Date Prototype Object"},{"section":"x15.9.5.1","name":"15.9.5.1 Date.prototype.constructor"},{"section":"x15.9.5.2","name":"15.9.5.2 Date.prototype.toString ( )"},{"section":"x15.9.5.3","name":"15.9.5.3 Date.prototype.toDateString ( )"},{"section":"x15.9.5.4","name":"15.9.5.4 Date.prototype.toTimeString ( )"},{"section":"x15.9.5.5","name":"15.9.5.5 Date.prototype.toLocaleString ( )"},{"section":"x15.9.5.6","name":"15.9.5.6 Date.prototype.toLocaleDateString ( )"},{"section":"x15.9.5.7","name":"15.9.5.7 Date.prototype.toLocaleTimeString ( )"},{"section":"x15.9.5.8","name":"15.9.5.8 Date.prototype.valueOf ( )"},{"section":"x15.9.5.9","name":"15.9.5.9 Date.prototype.getTime ( )"},{"section":"x15.9.5.10","name":"15.9.5.10 Date.prototype.getFullYear ( )"},{"section":"x15.9.5.11","name":"15.9.5.11 Date.prototype.getUTCFullYear ( )"},{"section":"x15.9.5.12","name":"15.9.5.12 Date.prototype.getMonth ( )"},{"section":"x15.9.5.13","name":"15.9.5.13 Date.prototype.getUTCMonth ( )"},{"section":"x15.9.5.14","name":"15.9.5.14 Date.prototype.getDate ( )"},{"section":"x15.9.5.15","name":"15.9.5.15 Date.prototype.getUTCDate ( )"},{"section":"x15.9.5.16","name":"15.9.5.16 Date.prototype.getDay ( )"},{"section":"x15.9.5.17","name":"15.9.5.17 Date.prototype.getUTCDay ( )"},{"section":"x15.9.5.18","name":"15.9.5.18 Date.prototype.getHours ( )"},{"section":"x15.9.5.19","name":"15.9.5.19 Date.prototype.getUTCHours ( )"},{"section":"x15.9.5.20","name":"15.9.5.20 Date.prototype.getMinutes ( )"},{"section":"x15.9.5.21","name":"15.9.5.21 Date.prototype.getUTCMinutes ( )"},{"section":"x15.9.5.22","name":"15.9.5.22 Date.prototype.getSeconds ( )"},{"section":"x15.9.5.23","name":"15.9.5.23 Date.prototype.getUTCSeconds ( )"},{"section":"x15.9.5.24","name":"15.9.5.24 Date.prototype.getMilliseconds ( )"},{"section":"x15.9.5.25","name":"15.9.5.25 Date.prototype.getUTCMilliseconds ( )"},{"section":"x15.9.5.26","name":"15.9.5.26 Date.prototype.getTimezoneOffset ( )"},{"section":"x15.9.5.27","name":"15.9.5.27 Date.prototype.setTime (time)"},{"section":"x15.9.5.28","name":"15.9.5.28 Date.prototype.setMilliseconds (ms)"},{"section":"x15.9.5.29","name":"15.9.5.29 Date.prototype.setUTCMilliseconds (ms)"},{"section":"x15.9.5.30","name":"15.9.5.30 Date.prototype.setSeconds (sec [, ms ] )"},{"section":"x15.9.5.31","name":"15.9.5.31 Date.prototype.setUTCSeconds (sec [, ms ] )"},{"section":"x15.9.5.32","name":"15.9.5.32 Date.prototype.setMinutes (min [, sec [, ms ] ] )"},{"section":"x15.9.5.33","name":"15.9.5.33 Date.prototype.setUTCMinutes (min [, sec [, ms ] ] )"},{"section":"x15.9.5.34","name":"15.9.5.34 Date.prototype.setHours (hour [, min [, sec [, ms ] ] ] )"},{"section":"x15.9.5.35","name":"15.9.5.35 Date.prototype.setUTCHours (hour [, min [, sec [, ms ] ] ] )"},{"section":"x15.9.5.36","name":"15.9.5.36 Date.prototype.setDate (date)"},{"section":"x15.9.5.37","name":"15.9.5.37 Date.prototype.setUTCDate (date)"},{"section":"x15.9.5.38","name":"15.9.5.38 Date.prototype.setMonth (month [, date ] )"},{"section":"x15.9.5.39","name":"15.9.5.39 Date.prototype.setUTCMonth (month [, date ] )"},{"section":"x15.9.5.40","name":"15.9.5.40 Date.prototype.setFullYear (year [, month [, date ] ] )"},{"section":"x15.9.5.41","name":"15.9.5.41 Date.prototype.setUTCFullYear (year [, month [, date ] ] )"},{"section":"x15.9.5.42","name":"15.9.5.42 Date.prototype.toUTCString ( )"},{"section":"x15.9.5.43","name":"15.9.5.43 Date.prototype.toISOString ( )"},{"section":"x15.9.5.44","name":"15.9.5.44 Date.prototype.toJSON ( key )"},{"section":"x15.9.6","name":"15.9.6 Properties of Date Instances"},{"section":"x15.10","name":"15.10 RegExp (Regular Expression) Objects"},{"section":"x15.10.1","name":"15.10.1 Patterns"},{"section":"x15.10.2","name":"15.10.2 Pattern Semantics"},{"section":"x15.10.2.1","name":"15.10.2.1 Notation"},{"section":"x15.10.2.2","name":"15.10.2.2 Pattern"},{"section":"x15.10.2.3","name":"15.10.2.3 Disjunction"},{"section":"x15.10.2.4","name":"15.10.2.4 Alternative"},{"section":"x15.10.2.5","name":"15.10.2.5 Term"},{"section":"x15.10.2.6","name":"15.10.2.6 Assertion"},{"section":"x15.10.2.7","name":"15.10.2.7 Quantifier"},{"section":"x15.10.2.8","name":"15.10.2.8 Atom"},{"section":"x15.10.2.9","name":"15.10.2.9 AtomEscape"},{"section":"x15.10.2.10","name":"15.10.2.10 CharacterEscape"},{"section":"x15.10.2.11","name":"15.10.2.11 DecimalEscape"},{"section":"x15.10.2.12","name":"15.10.2.12 CharacterClassEscape"},{"section":"x15.10.2.13","name":"15.10.2.13 CharacterClass"},{"section":"x15.10.2.14","name":"15.10.2.14 ClassRanges"},{"section":"x15.10.2.15","name":"15.10.2.15 NonemptyClassRanges"},{"section":"x15.10.2.16","name":"15.10.2.16 NonemptyClassRangesNoDash"},{"section":"x15.10.2.17","name":"15.10.2.17 ClassAtom"},{"section":"x15.10.2.18","name":"15.10.2.18 ClassAtomNoDash"},{"section":"x15.10.2.19","name":"15.10.2.19 ClassEscape"},{"section":"x15.10.3","name":"15.10.3 The RegExp Constructor Called as a Function"},{"section":"x15.10.3.1","name":"15.10.3.1 RegExp(pattern, flags)"},{"section":"x15.10.4","name":"15.10.4 The RegExp Constructor"},{"section":"x15.10.4.1","name":"15.10.4.1 new RegExp(pattern, flags)"},{"section":"x15.10.5","name":"15.10.5 Properties of the RegExp Constructor"},{"section":"x15.10.5.1","name":"15.10.5.1 RegExp.prototype"},{"section":"x15.10.6","name":"15.10.6 Properties of the RegExp Prototype Object"},{"section":"x15.10.6.1","name":"15.10.6.1 RegExp.prototype.constructor"},{"section":"x15.10.6.2","name":"15.10.6.2 RegExp.prototype.exec(string)"},{"section":"x15.10.6.3","name":"15.10.6.3 RegExp.prototype.test(string)"},{"section":"x15.10.6.4","name":"15.10.6.4 RegExp.prototype.toString()"},{"section":"x15.10.7","name":"15.10.7 Properties of RegExp Instances"},{"section":"x15.10.7.1","name":"15.10.7.1 source"},{"section":"x15.10.7.2","name":"15.10.7.2 global"},{"section":"x15.10.7.3","name":"15.10.7.3 ignoreCase"},{"section":"x15.10.7.4","name":"15.10.7.4 multiline"},{"section":"x15.10.7.5","name":"15.10.7.5 lastIndex"},{"section":"x15.11","name":"15.11 Error Objects"},{"section":"x15.11.1","name":"15.11.1 The Error Constructor Called as a Function"},{"section":"x15.11.1.1","name":"15.11.1.1 Error (message)"},{"section":"x15.11.2","name":"15.11.2 The Error Constructor"},{"section":"x15.11.2.1","name":"15.11.2.1 new Error (message)"},{"section":"x15.11.3","name":"15.11.3 Properties of the Error Constructor"},{"section":"x15.11.3.1","name":"15.11.3.1 Error.prototype"},{"section":"x15.11.4","name":"15.11.4 Properties of the Error Prototype Object"},{"section":"x15.11.4.1","name":"15.11.4.1 Error.prototype.constructor"},{"section":"x15.11.4.2","name":"15.11.4.2 Error.prototype.name"},{"section":"x15.11.4.3","name":"15.11.4.3 Error.prototype.message"},{"section":"x15.11.4.4","name":"15.11.4.4 Error.prototype.toString ( )"},{"section":"x15.11.5","name":"15.11.5 Properties of Error Instances"},{"section":"x15.11.6","name":"15.11.6 Native Error Types Used in This Standard"},{"section":"x15.11.6.1","name":"15.11.6.1 EvalError"},{"section":"x15.11.6.2","name":"15.11.6.2 RangeError"},{"section":"x15.11.6.3","name":"15.11.6.3 ReferenceError"},{"section":"x15.11.6.4","name":"15.11.6.4 SyntaxError"},{"section":"x15.11.6.5","name":"15.11.6.5 TypeError"},{"section":"x15.11.6.6","name":"15.11.6.6 URIError"},{"section":"x15.11.7","name":"15.11.7 NativeError Object Structure"},{"section":"x15.11.7.1","name":"15.11.7.1 NativeError Constructors Called as Functions"},{"section":"x15.11.7.2","name":"15.11.7.2 NativeError (message)"},{"section":"x15.11.7.3","name":"15.11.7.3 The NativeError Constructors"},{"section":"x15.11.7.4","name":"15.11.7.4 New NativeError (message)"},{"section":"x15.11.7.5","name":"15.11.7.5 Properties of the NativeError Constructors"},{"section":"x15.11.7.6","name":"15.11.7.6 NativeError.prototype"},{"section":"x15.11.7.7","name":"15.11.7.7 Properties of the NativeError Prototype Objects"},{"section":"x15.11.7.8","name":"15.11.7.8 NativeError.prototype.constructor"},{"section":"x15.11.7.9","name":"15.11.7.9 NativeError.prototype.name"},{"section":"x15.11.7.10","name":"15.11.7.10 NativeError.prototype.message"},{"section":"x15.11.7.11","name":"15.11.7.11 Properties of NativeError Instances"},{"section":"x15.12","name":"15.12 The JSON Object"},{"section":"x15.12.1","name":"15.12.1 The JSON Grammar  "},{"section":"x15.12.1.1","name":"15.12.1.1 The JSON Lexical Grammar"},{"section":"x15.12.1.2","name":"15.12.1.2 The JSON Syntactic Grammar"},{"section":"x15.12.2","name":"15.12.2 parse ( text [ , reviver ] )"},{"section":"x15.12.3","name":"15.12.3 stringify ( value [ , replacer [ , space ] ] )"},{"section":"x16","name":"16 Errors"},{"section":"A","name":"Annex A (informative) Grammar Summary"},{"section":"A.1","name":"A.1 Lexical Grammar"},{"section":"A.2","name":"A.2 Number Conversions"},{"section":"A.3","name":"A.3 Expressions"},{"section":"A.4","name":"A.4 Statements"},{"section":"A.5","name":"A.5 Functions and Programs"},{"section":"A.6","name":"A.6 Universal Resource Identifier Character Classes"},{"section":"A.7","name":"A.7 Regular Expressions"},{"section":"A.8","name":"A.8 JSON"},{"section":"A.8.1","name":"A.8.1 JSON Lexical Grammar"},{"section":"A.8.2","name":"A.8.2 JSON Syntactic Grammar"},{"section":"B","name":"Annex B (informative) Compatibility"},{"section":"B.1","name":"B.1 Additional Syntax"},{"section":"B.1.1","name":"B.1.1 Numeric Literals"},{"section":"B.1.2","name":"B.1.2 String Literals"},{"section":"B.2","name":"B.2 Additional Properties"},{"section":"B.2.1","name":"B.2.1 escape (string)"},{"section":"B.2.2","name":"B.2.2 unescape (string)"},{"section":"B.2.3","name":"B.2.3 String.prototype.substr (start, length)"},{"section":"B.2.4","name":"B.2.4 Date.prototype.getYear ( )"},{"section":"B.2.5","name":"B.2.5 Date.prototype.setYear (year)"},{"section":"B.2.6","name":"B.2.6 Date.prototype.toGMTString ( )"},{"section":"C","name":"Annex C (informative) The Strict Mode of ECMAScript"},{"section":"D","name":"Annex D (informative) Corrections and Clarifications in the 5th Edition with Possible 3rd Edition Compatibility Impact"},{"section":"E","name":"Annex E (informative) Additions and Changes in the 5th Edition that Introduce Incompatibilities with the 3rd Edition"},{"section":"bibliography","name":"Bibliography"}];

var spec = function ( args ) {
	var lookup = args.content.toLowerCase(),
	matches = specParts
		.filter(function ( obj ) {
			return ~obj.name.toLowerCase().indexOf( lookup );
		})
		.map(function ( obj ) {
			var name = args.escape( obj.name );
			return '[' + name + '](http://es5.github.com/#' + obj.section + ')';
		});

	bot.log( matches, '/spec done' );
	if ( !matches.length ) {
		return args + ' not found in spec';
	}
	return matches.join( ', ' );
};

bot.addCommand({
	name : 'spec',
	fun : spec,
	permissions : {
		del : 'NONE'
	},
	description : 'Find a section in the ES5 spec'
});

;
(function () {
var list = JSON.parse( localStorage.getItem('todo') || '{}' );

var userlist = function ( usrid ) {

	var usr = list[ usrid ], toRemove = [];
	if ( !usr ) {
		usr = list[ usrid ] = [];
	}

	return {
		get : function ( count ) {
			return usr.slice( count ).map(function ( item, index ) {
				return '(' + (index+1) + ')' + item;
			}).join( ', ' );
		},

		add : function ( item ) {
			usr.push( item );
			return true;
		},

		remove : function ( item ) {
			toRemove.push( usr.indexOf(item) );
			return true;
		},
		removeByIndex : function ( idx ) {
			if ( idx >= usr.length ) {
				return false;
			}
			toRemove.push( idx );

			return true;
		},

		save : function () {
			bot.log( toRemove.slice(), usr.slice() );
			usr = usr.filter(function ( item, idx ) {
				return toRemove.indexOf( idx ) === -1;
			});

			toRemove.length = 0;

			list[ usrid ] = usr;
		},

		exists : function ( suspect ) {
			suspect = suspect.toLowerCase();
			//it could be re-written as:
			//usr.invoke( 'toLowerCase' ).indexOf( suspect ) > -1
			return usr.some(function (item) {
				return suspect === item.toLowerCase();
			});
		}
	};
};

var todo = function ( args ) {
	var props = args.parse();
	bot.log( props, 'todo input' );

	if ( !props[0] ) {
		props = [ 'get' ];
	}
	var action = props[ 0 ],
		usr = userlist( args.get('user_id') ),
		items = props.slice( 1 ),
		res, ret;

	//user wants to get n items, we just want the count
	if ( action === 'get' ) {
		ret = usr.get( items[0] );

		if ( !ret ) {
			ret = 'No items on your todo.';
		}
		bot.log( ret, 'todo get' );
	}

	else if ( action === 'add' ) {
		res = items.every(function ( item ) {

			if ( usr.exists(item) ) {
				ret = item + ' already exists.';
				return false;
			}
			else {
				usr.add( item );
			}

			return true;
		});

		if ( res ) {
			ret = 'Item(s) added.';
		}

		bot.log( ret, 'todo add' );
	}

	else if ( action === 'rem' ) {
		res = items.every(function ( item ) {

			if ( /^\d+$/.test(item) ) {
				usr.removeByIndex( Number(item - 1) );
			}
			else if ( !usr.exists(item) ) {
				ret = item + ' does not exist.';
				return false;
			}
			else {
				usr.remove( item );
			}

			return true;
		});

		if ( res ) {
			ret = 'Item(s) removed.';
		}

		bot.log( ret, 'todo rem' );
	}
	//not a valid action
	else {
		ret = 'Unidentified /todo action ' + action;
		bot.log( ret, 'todo undefined' );
	}

	//save the updated list
	usr.save();
	localStorage.setItem( 'todo', JSON.stringify(list) );

	return ret;
};

bot.addCommand({
	name : 'todo',
	fun  : todo,
	permissions : {
		del : 'NONE'
	},
	description : 'Your personal todo list. ' +
		'`get [count]` retrieves everything or count items. ' +
		'`add [items]` adds n-items to your todo list (make sure items ' +
			'with spaces are wrapped in quotes) ' +
		'`rem [indices]` removes items specified by indice'
});

}());