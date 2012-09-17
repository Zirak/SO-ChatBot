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

			that.preventDefault = call === false;
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
			}).join( '&' );
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

/*
  &       -all entities start with &
  (
   #      -charcode entities also have a #
   x?     -hex charcodes
  )
  [\w;]   -now the entity (alphanumeric, separated by ;)
  +?      -capture em until there aint no more (don't get the trailing ;)
  ;       -trailing ;
*/
var entityRegex = /&(#x?)?[\w;]+?;/g;
var replaceEntities = function ( entities ) {
	//remove the & and split into each separate entity
	return entities.slice( 1 ).split( ';' ).map( decodeEntity ).join( '' );
};
var decodeEntity = function ( entity ) {
	//starts with a #, it's charcode
	if ( entity[0] === '#' ) {
		return decodeCharcodeEntity( entity );
	}

	return entities[ entity ] || entity;
};
var decodeCharcodeEntity = function ( entity ) {
	//remove the # prefix
	entity = entity.slice( 1 );

	var cc;
	//hex entities
	if ( entity[0] === 'x' ) {
		cc = parseInt( entity.slice(1), 16 );
	}
	//decimal entities
	else {
		cc = parseInt( entity, 10 );
	}

	return String.fromCharCode( cc );
};

return function ( html ) {
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
////bot ends
}());
