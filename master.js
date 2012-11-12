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
var entities; //will be filled in the following line
entities = {"quot":"\"","amp":"&","apos":"'","lt":"<","gt":">","nbsp":" ","iexcl":"¡","cent":"¢","pound":"£","curren":"¤","yen":"¥","brvbar":"¦","sect":"§","uml":"¨","copy":"©","ordf":"ª","laquo":"«","not":"¬","reg":"®","macr":"¯","deg":"°","plusmn":"±","sup2":"²","sup3":"³","acute":"´","micro":"µ","para":"¶","middot":"·","cedil":"¸","sup1":"¹","ordm":"º","raquo":"»","frac14":"¼","frac12":"½","frac34":"¾","iquest":"¿","Agrave":"À","Aacute":"Á","Acirc":"Â","Atilde":"Ã","Auml":"Ä","Aring":"Å","AElig":"Æ","Ccedil":"Ç","Egrave":"È","Eacute":"É","Ecirc":"Ê","Euml":"Ë","Igrave":"Ì","Iacute":"Í","Icirc":"Î","Iuml":"Ï","ETH":"Ð","Ntilde":"Ñ","Ograve":"Ò","Oacute":"Ó","Ocirc":"Ô","Otilde":"Õ","Ouml":"Ö","times":"×","Oslash":"Ø","Ugrave":"Ù","Uacute":"Ú","Ucirc":"Û","Uuml":"Ü","Yacute":"Ý","THORN":"Þ","szlig":"ß","agrave":"à","aacute":"á","acirc":"â","atilde":"ã","auml":"ä","aring":"å","aelig":"æ","ccedil":"ç","egrave":"è","eacute":"é","ecirc":"ê","euml":"ë","igrave":"ì","iacute":"í","icirc":"î","iuml":"ï","eth":"ð","ntilde":"ñ","ograve":"ò","oacute":"ó","ocirc":"ô","otilde":"õ","ouml":"ö","divide":"÷","oslash":"ø","ugrave":"ù","uacute":"ú","ucirc":"û","uuml":"ü","yacute":"ý","thorn":"þ","yuml":"ÿ","OElig":"Œ","oelig":"œ","Scaron":"Š","scaron":"š","Yuml":"Ÿ","fnof":"ƒ","circ":"ˆ","tilde":"˜","Alpha":"Α","Beta":"Β","Gamma":"Γ","Delta":"Δ","Epsilon":"Ε","Zeta":"Ζ","Eta":"Η","Theta":"Θ","Iota":"Ι","Kappa":"Κ","Lambda":"Λ","Mu":"Μ","Nu":"Ν","Xi":"Ξ","Omicron":"Ο","Pi":"Π","Rho":"Ρ","Sigma":"Σ","Tau":"Τ","Upsilon":"Υ","Phi":"Φ","Chi":"Χ","Psi":"Ψ","Omega":"Ω","alpha":"α","beta":"β","gamma":"γ","delta":"δ","epsilon":"ε","zeta":"ζ","eta":"η","theta":"θ","iota":"ι","kappa":"κ","lambda":"λ","mu":"μ","nu":"ν","xi":"ξ","omicron":"ο","pi":"π","rho":"ρ","sigmaf":"ς","sigma":"σ","tau":"τ","upsilon":"υ","phi":"φ","chi":"χ","psi":"ψ","omega":"ω","thetasym":"ϑ","upsih":"ϒ","piv":"ϖ","ensp":" ","emsp":" ","thinsp":" ","ndash":"–","mdash":"—","lsquo":"‘","rsquo":"’","sbquo":"‚","ldquo":"“","rdquo":"”","bdquo":"„","dagger":"†","Dagger":"‡","bull":"•","hellip":"…","permil":"‰","prime":"′","Prime":"″","lsaquo":"‹","rsaquo":"›","oline":"‾","frasl":"⁄","euro":"€","image":"ℑ","weierp":"℘","real":"ℜ","trade":"™","alefsym":"ℵ","larr":"←","uarr":"↑","rarr":"→","darr":"↓","harr":"↔","crarr":"↵","lArr":"⇐","uArr":"⇑","rArr":"⇒","dArr":"⇓","hArr":"⇔","forall":"∀","part":"∂","exist":"∃","empty":"∅","nabla":"∇","isin":"∈","notin":"∉","ni":"∋","prod":"∏","sum":"∑","minus":"−","lowast":"∗","radic":"√","prop":"∝","infin":"∞","ang":"∠","and":"∧","or":"∨","cap":"∩","cup":"∪","int":"∫","there4":"∴","sim":"∼","cong":"≅","asymp":"≈","ne":"≠","equiv":"≡","le":"≤","ge":"≥","sub":"⊂","sup":"⊃","nsub":"⊄","sube":"⊆","supe":"⊇","oplus":"⊕","otimes":"⊗","perp":"⊥","sdot":"⋅","lceil":"⌈","rceil":"⌉","lfloor":"⌊","rfloor":"⌋","lang":"〈","rang":"〉","loz":"◊","spades":"♠","clubs":"♣","hearts":"♥","diams":"♦"};


/*
  &       -all entities start with &
  (
   #      -charcode entities also have a #
   x?     -hex charcodes
  )?
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

IO.xhr = function ( params ) {
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
};

IO.jsonp = function ( opts ) {
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
}

//generic, pre-made calls to be used inside commands
IO.jsonp.define = function ( what, cb ) {
	IO.jsonp({
		url : 'http://api.duckduckgo.com/',
		jsonpName : 'callback',
		data : {
			format : 'json',
			q : 'define ' + what
		},
		fun : cb
	});
};

IO.jsonp.google = function ( query, cb ) {
	IO.jsonp({
		url : 'http://ajax.googleapis.com/ajax/services/search/web',
		jsonpName : 'callback',
		data : {
			v : '1.0',
			q : query
		},
		fun : cb
	});
};

;
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

		codify : bot.adapter.codify.bind( bot.adapter ),
		escape : bot.adapter.escape.bind( bot.adapter ),
		link : bot.adapter.link.bind( bot.adapter ),

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

//fuck you readability
//left this comment as company for future viewers with their new riddle
Object.defineProperty( Array.prototype, 'first', {
	value : function ( fun ) {
		return this.some(function ( item ) {
			return fun.apply( null, arguments ) && ( (fun = item) || true );
		}) ? fun : null;
	},

	configurable : true,
	writable : true
});

Function.prototype.memoize = function () {
	var cache = Object.create( null ), fun = this;

	return function ( hash ) {
		if ( hash in cache ) {
			return cache[ hash ];
		}

		var res = fun.apply( null, arguments );

		cache[ hash ] = res;
		return res;
	};
};

//async memoizer
Function.prototype.memoizeAsync = function ( hasher ) {
	var cache = Object.create( null ), fun = this,
		hasher = hasher || function (x) { return x; };

	return function () {
		var args = [].slice.call( arguments ),
			cb = args.pop(), //HEAVY assumption that cb is always passed
			hash = hasher.apply( null, arguments );

		if ( hash in cache ) {
			cb.apply( null, cache[hash] );
			return;
		}

		//push the callback to the to-be-passed arguments
		args.push( resultFun );
		fun.apply( this, args );

		function resultFun () {
			cache[ hash ] = arguments;
			cb.apply( null, arguments );
		}
	};
};

//returns the number with at most `places` digits after the dot
//examples:
// 1.337.maxDecimal(1) === 1.3
// floor(1.337 * 10e1) / 10e1 = 13
// 13 / 10e1 = 1.3
Number.prototype.maxDecimal = function ( places ) {
	var exponent = Math.pow( 10, places );

	return Math.floor( this * exponent ) / exponent;
}

//calculates a:b to string form
Math.ratio = function ( a, b ) {
    a = Number( a );
    b = Number( b );

    var gcd = this.gcd( a, b );
    return ( a / gcd ) + ':' + ( b / gcd );
};

//Euclidean gcd
Math.gcd = function ( a, b ) {
    if ( !b ) {
        return a;
    }
    return this.gcd( b, a % b );
};

//Crockford's supplant
String.prototype.supplant = function ( obj ) {
	return this.replace( /\{([^\}]+)\}/g, replace );

	function replace ( $0, $1 ) {
		return obj.hasOwnProperty( $1 ) ?
			obj[ $1 ] :
			$0;
	}
};

String.prototype.add = function ( str, nonewline ) {
	return this + str + ( nonewline ? '' : '\n' );
};

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
			'https://github.com/Zirak/SO-ChatBot/wiki/' +
				'Interacting-with-the-bot'
		);
	},

	listen : function ( msg ) {
		return bot.callListeners( msg );
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
			if ( /^\d+$/.test(usrid) ) {
				id = args.findUserid( usrid );
			}

			if ( !id ) {
				msg += 'Cannot find user ' + usrid + '. ';
			}
			else if ( bot.isOwner(id) ) {
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
			if ( /^\d+$/.test(usrid) ) {
				id = args.findUserid( usrid );
			}

			if ( !id ) {
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

			what = parts.shift(),
			pattern = parts.shift(),
			flags = parts.shift() || '',

			regex = new RegExp( pattern, flags.toLowerCase() ),
			matches = regex.exec( what );

		bot.log( what, pattern, flags, regex, 'regex parsed' );
		bot.log( matches, 'regex matched' );

		if ( !matches ) {
			return 'No matches.';
		}

		return matches.map(function ( match ) {
			return '`' + match + '`';
		}).join( ', ' );
	},

	jquery : function jquery ( args ) {
		//check to see if more than one thing is requested
		var parsed = args.parse( true );
		if ( parsed.length > 1 ) {
			return parsed.map( jquery ).join( ' ' );
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
		//                     jQuery.prop if it's on jQuery

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
		var opts = args.parse().filter( conjunctions ),
			rnd = Math.random(),
			len = opts.length;

		bot.log( opts, rnd, '/choose input' );

		//10% chance to get a "none-of-the-above"
		if ( rnd < 0.1 ) {
			return len === 2 ? 'Neither' : 'None of the above';
		}
		//15% chance to get "all-of-the-above"
		// (the first 10% are covered in the previous option)
		else if ( rnd < 0.25 ) {
			return len === 2 ? 'Both!' : 'All of the above';
		}

		return opts[ Math.floor(Math.random() * len) ];

		//TODO: add support for words like and, e.g.
		// skip and jump or cry and die
		//  =>
		// "skip and jump", "cry and die"
		function conjunctions ( word ) {
			return word !== 'or';
		}
	},

	user : function ( args ) {
		var props = args.parse(),
			usrid = props[ 0 ] || args.get( 'user_id' ),
			id = usrid;

		//check for searching by username
		if ( !(/^\d+$/.test(usrid)) ) {
			id = args.findUserid( usrid );

			if ( !id ) {
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

	IO.jsonp.define( args.toString(), finishCall );

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
		var msg;

		if ( resp.result_type === 'no_results' ) {
			msg = 'Y U NO MAEK SENSE!!!???!!?11 No results for ' + args;
		}
		else {
			msg = formatTop( resp.list[0] );
		}
		cache[ args ] = msg;

		finish( msg );
	}

	function finish ( def ) {
		if ( cb && cb.call ) {
			cb( def );
		}
		else {
			args.reply( def );
		}
	}

	function formatTop ( top ) {
		return args.link( args.toString(), top.permalink ) +
			' ' +
			top.definition;
	}
};
}());
commands.urban.async = true;

var parse = commands.parse = (function () {
var macros = {
	who : function () {
		return [].pop.call( arguments ).get( 'user_name' );
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
			return 'Nobody! I\'m all alone :(';
		}

		return user.getElementsByTagName( 'img' )[ 0 ].title;
	},

	digit : function () {
		return Math.floor( Math.random() * 10 );
	},

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
var macroRegex = /(?:.|^)\$(\w+)(?:\((.*?)\))?/g;

//extraVars is for internal usage via other commands
return function parse ( args, extraVars ) {
	var msgObj = ( args.get && args.get() ) || {};
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
		console.log( macroArgs, '/parse parseMacroArgs' );
		if ( !macroArgs ) {
			return [];
		}

		//parse the arguments, split them into individual arguments,
		// and trim'em (to cover the case of "arg,arg" and "arg, arg")
		return (
			parse( macroArgs, extraVars )
				.split( ',' ).invoke( 'trim' ).concat( args )
		);
	}

	function findMacro ( macro ) {
		return (
			[ macros, msgObj, extraVars ].first( hasMacro ) || [] )[ macro ];

		function hasMacro ( obj ) {
			return obj.hasOwnProperty( macro );
		}
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
	if ( /^:?\d+$/.test(replyTo) ) {
		msgObj.message_id = replyTo.replace( /^:/, '' );
		direct = true;
	}
	else {
		msgObj.user_name = replyTo.replace( /^@/, '' );
	}

	var cmdArgs = bot.Message(
		//the + 2 is for the two spaces after each arg
		// /tell replyTo1cmdName2args
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

commands.mdn = function ( args, cb ) {
	var template = '[{titleNoFormatting}]({url})';

	IO.jsonp.google(
		args.toString() + ' site:developer.mozilla.org', finishCall );

	function finishCall ( resp ) {
		if ( resp.responseStatus !== 200 ) {
			finish( 'Something went on fire; status ' + resp.responseStatus );
			return;
		}

		var result = resp.responseData.results[ 0 ];
		bot.log( result, '/mdn result' );
		finish( template.supplant(result) );
	}

	function finish ( res ) {
		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.reply( res );
		}
	}
};
commands.mdn.async = true;

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
		params.fromdate = Date.parse( parts[2] );
		params.todate = Date.parse( parts[3] );

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



var descriptions = {
	help : 'Fetches documentation for given command, or general help article.' +
		' `/help [cmdName]`',

	listen : 'Forwards the message to the listen API (as if called without' +
		'the /)',

	live : 'Resurrects the bot if it\'s down',

	die  : 'Kills the bot',

	forget : 'Forgets a given command. `/forget cmdName`',

	ban : 'Bans a user from using a bot. `/ban usr_id|usr_name`',

	unban : 'Removes a user from bot\'s mindjail. `/unban usr_id|usr_name`',

	regex : 'Executes a regex against text input. `/regex text regex [flags]`',

	jquery : 'Fetches documentation link from jQuery API. `/jquery what`',

	choose : '"Randomly" choose an option given. `/choose option0 option1 ...`',

	user : 'Fetches user-link for specified user. `/user usr_id|usr_name`',

	listcommands : 'This seems pretty obvious',

	define : 'Fetches definition for a given word. `/define something`',

	norris : 'Random chuck norris joke!',

	urban : 'Fetches UrbanDictionary definition. `/urban something`',

	parse : 'Returns result of "parsing" message according to the bot\'s mini' +
		'-macro capabilities',

	tell : 'Redirect command result to user/message.' +
		' /tell `msg_id|usr_name cmdName [cmdArgs]`',

	mdn : 'Fetches mdn documentation. `/mdn what`',

	get : '', //I can't intelligibly explain this in a sentence

	learn : 'Teach the bot a command.' +
		' '
};

Object.keys( commands ).forEach(function ( cmdName ) {
	bot.addCommand({
		name : cmdName,
		fun  : commands[ cmdName ],
		permissions : {
			del : 'NONE'
		},
		description : descriptions[ cmdName ],
		async : commands[ cmdName ].async
	});
});

//only allow specific users to use certain commands
[ 'die', 'live', 'ban', 'unban' ].forEach(function ( cmdName ) {
	bot.commands[ cmdName ].permissions.use = bot.owners;
});

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

bot.listen( /^tell (me (your|the) )?(rules|laws)/, function ( msg ) {
	return laws;
});

bot.listen( /^give ([\w\s]+) a lick/, function ( msg ) {
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
	//what is an animal?
	//and all those above without a ?
	//explanation in the post-mortem
	/^what(?:'s|'re)?\s(?:(?:is|are)\s)?(?:(?:an|a)\s)?([\w\s\-]+)\??/,

	//define squid
	//define a squid
	//define an animal
	/^define\s(?:(?:an|a)\s)?([\w\s\-]+)/
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
(?:'s|'re)?       --optional suffix (what's, what're)
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

}());

;
(function () {
var linkTemplate = '[{text}]({url})';

bot.adapter = {
	//a pretty crucial function. accepts the msgObj we know nothing about,
	// and returns an object with these properties:
	//  user_name, user_id, room_id, content
	// and any other properties, as the abstraction sees fit
	//since the bot was designed around the SO chat message object, in this
	// case, we simply do nothing
	transform : function ( msgObj ) {
		return msgObj;
	},

	//escape characters meaningful to the chat, such as parentheses
	//full list of escaped characters: `*_()[]
	escape : function ( msg ) {
		return msg.replace( /([`\*_\(\)\[\]])/g, '\\$1' );
	},

	//receives a msg and the msgObj, and returns a message which will be
	// recognized as a reply to a user
	reply : function ( msg, msgObj ) {
		var usr = msgObj.user_name.replace( /\s/g, '' );
		return '@' + usr + ' ' + msg;
	},
	//again, receives msg and msgObj, returns a message which is a reply to
	// another message
	directreply : function ( msg, msgObj ) {
		return ':' + msgObj.message_id + ' ' + msg;
	},

	//receives text and turns it into a codified version
	//codified is ambiguous for a simple reason: it means nicely-aligned and
	// mono-spaced. in SO chat, it handles it for us nicely; in others, more
	// clever methods may need to be taken
	codify : function ( msg ) {
		var tab = '    ',
			spacified = msg.replace( '\t', tab ),
			lines = spacified.split( /[\r\n]/g );

		if ( lines.length === 1 ) {
			return '`' + lines[ 0 ] + '`';
		}

		return lines.map(function ( line ) {
			return tab + line;
		}).join( '\n' );
	},

	//receives a url and text to display, returns a recognizable link
	link : function ( text, url ) {
		return linkTemplate.supplant({
			text : this.escape( text ),
			url  : url
		});
	}
};

//the input is not used by the bot directly, so you can implement it however
// you like
var polling = bot.adapter.in = {
	//used in the SO chat requests, dunno exactly what for, but guessing it's
	// the latest id or something like that. could also be the time last
	// sent, which is why I called it times at the beginning. or something.
	times : {},

	interval : 5000,

	init : function () {
		var that = this,
			roomid = bot.roomid;

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
			//slice upto the beginning of the ending tag
			.slice( 0, msg.content.lastIndexOf('</div>') )
			//and strip away the beginning tag
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
		}, this.interval );
	}
};

//the output is expected to have only one method: add, which receives a message
// and the room_id. everything else is up to the implementation.
var output = bot.adapter.out = {
	interval : polling.interval + 500,

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

	//send output to all the good boys and girls
	//no messages for naughty kids
	//...what's red and sits in the corner?
	//a naughty strawberry
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

	//what's brown and sticky?
	//a stick
	sendToRoom : function ( text, roomid ) {
		IO.xhr({
			url : '/chats/' + roomid + '/messages/new',
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
				output.add( text, roomid );
			}
			//server error, usually caused by message being too long
			else if ( xhr.status === 500 ) {
				output.add( 'Server error (status 500) occured', roomid );
			}
		}
	},

	//what do you call a boomerang which doesn't return?
	//a stick
	loopage : function () {
		var that = this;
		setTimeout(function () {
			IO.out.flush();
			that.loopage();
		}, this.interval );
	}
};
//what's orange and sounds like a parrot?
//a carrot
IO.register( 'output', output.build, output );
IO.register( 'afteroutput', output.send, output );

//two guys walk into a bar. the bartender asks them "is this some kind of joke?"
polling.init();
output.loopage();
}());

;

;
(function () {

//collection of nudges; msgObj, time left and the message itself
var nudges = [],
	interval = bot.adapter &&
		bot.adapter.in.interval || 5000;

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
		message : '*nudge*' + ( msg || '' ),
		register: Date.now(),
		time    : inMS
	};
	nudges.push( nudge );
	console.log( nudge, nudges, '/nudge register' );

	return 'Nudge registered.';
}

bot.addCommand({
	name : 'nudge',
	fun  : nudgeCommand,
	permissions : {
		del : 'NONE'
	},

	description : 'Register a nudge after an interval. ' +
		'`/nudge intervalInMinutes message`, or the listener, ' +
		'`nudge|remind|poke me? in? intervalInMinutes message`'
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
(function () {
//var rings = {
//   roomid : [ members ]
//}
var rings;
if ( !localStorage.bot_rings ) {
	localStorage.bot_rings = '{}';
}
rings = JSON.parse( localStorage.bot_rings );

// /ring activate ringName message
// /ring register ringName
var ring = function ( args ) {
	var parts = args.parse(),
		command = parts[ 0 ],
		ringName = parts[ 1 ],
		message = parts[ 2 ],

		usrname = args.get( 'user_name' ),
		roomid = args.get( 'room_id' ),

		res;
	bot.log( parts, '/ring input' );

	if ( command === 'activate' ) {
		res = activate( message, ringName, usrname, roomid );
	}
	else if ( command === 'register' ) {
		res = register( ringName, usrname, roomid );
	}
	else {
		res = 'Cannot understand command: ' + command + '. See /help ring';
	}

	return res;
};

bot.addCommand({
	name : 'ring',
	fun  : ring,
	permissions : {
		del : 'NONE'
	},

	description : 'Rings are room specific. ' +
		'`/ring activate ringName message` - activate a ring. ' +
		'`/ring register ringName` - register to a ring.'
});

function activate ( message, ringName, usrname, roomid ) {
	bot.log( message, ringName, usrname, roomid, '/ring activate' );
	if ( !rings[roomid] ) {
		return 'There are no rings in your chat-room';
	}

	var roomRing = rings[ roomid ];
	if ( !roomRing[ringName] ) {
		return 'There exists no ' + ringName + ' ring in your chat-room';
	}

	message = 'Ring ' + ringName +
		' activated by ' + usrname + '! ' +
		message;

	return roomRing[ ringName ].map(function ( name ) {
		return '@' + name;
	}).join( ', ' ) + ': ' + message;
}

function register ( ringName, usrname, roomid ) {
	bot.log( ringName, usrname, roomid, '/ring register' );
	if ( !rings[roomid] ) {
		rings[ roomid ] = {};
	}
	var roomRing = rings[ roomid ];

	if ( !roomRing[ringName] ) {
		roomRing[ ringName ] = [];
	}
	var ring = roomRing[ ringName ];

	if ( ring.indexOf(usrname) > -1 ) {
		return 'You are already registered to ring ' + ringName;
	}
	ring.push( usrname );

	update();

	return 'Registered to ring ' + ringName + ' in room #' + roomid;
}

function update () {
	localStorage.bot_rings = JSON.stringify( rings );
}

}());


;
(function () {
if ( !localStorage.bot_alias ) {
	localStorage.bot_alias = JSON.stringify( {} );
}

var dict = JSON.parse( localStorage.bot_alias );

bot.listen( /\~([\w\-_]+)(?:\s?(=)(=)?\s?(.+))?/, function ( msg ) {
	var name = msg.matches[ 1 ];

	//check to see if it's an assignment
	// msg.matches[2] is the optional =
	if ( msg.matches[2] ) {
		return save( msg );
	}
	else {
		return dict[ name ] || 'Nothing found for ' + name;
	}
});

function save ( msg ) {
	var name = msg.matches[ 1 ],
		force  = msg.matches[ 3 ],
		exists = !!dict[ name ],
		authorized = false;

	//only owners can force new values
	if ( exists && force ) {
		authorized = bot.isOwner( msg.get('user_id') );
	}
	else if ( !exists ) {
		authorized = true;
	}

	if ( !authorized ) {
		return 'You are not allowed to do this, young padawan';
	}

	var value = msg.matches[ 4 ];
	if ( !value ) {
		return 'Provide a value for the alias';
	}

	dict[ name ] = value;
	localStorage.bot_alias = JSON.stringify( dict );
	return 'Saved alias ' + name;
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
(function () {
/*
     _____ _           ______      _                    __   _   _
    |_   _| |          | ___ \    | |                  / _| | | | |
      | | | |__   ___  | |_/ /   _| | ___  ___    ___ | |_  | |_| |__   ___
      | | |  _ \ / _ \ |    / | | | |/ _ \/ __|  / _ \|  _| | __|  _ \ / _ \
      | | | | | |  __/ | |\ \ |_| | |  __/\__ \ | (_) | |   | |_| | | |  __/
      \_/ |_| |_|\___| \_| \_\__,_|_|\___||___/  \___/|_|    \__|_| |_|\___|


                     _____      _                       _
                    |_   _|    | |                     | |
                      | | _ __ | |_ ___ _ __ _ __   ___| |_
                      | || '_ \| __/ _ \ '__| '_ \ / _ \ __|
                     _| || | | | ||  __/ |  | | | |  __/ |_
                     \___/_| |_|\__\___|_|  |_| |_|\___|\__|
*/
var rulz = [
	'1. Do not talk about /b/',
	'2. Do NOT talk about /b/',
	'3. We are Anonymous.',
	'4. Anonymous is legion.',
	'5. Anonymous does not forgive, Anonymous does not forget.',
	'6. Anonymous can be horrible, senseless, uncaring monster.',
	'7. Anonymous is still able to deliver.',
	'8. There are no real rules about posting.',
	'9. There are no real rules about moderation either — enjoy your ban.',
	'10. If you enjoy any rival sites — DON\'T.',
	'11. You must have pictures to prove your statement.',
	'12. Lurk moar — it\'s never enough.',
	'13. Nothing is Sacred.',
	'14. Do not argue with a troll — it means that they win.',
	'15. The more beautiful and pure a thing is, the more satisfying it is to corrupt it.',
	'16. There are NO girls on the internet.',
	'17. A cat is fine too.',
	'18. One cat leads to another.',
	'19. The more you hate it, the stronger it gets.',
	'20. It is delicious cake. You must eat it.',
	'21. It is delicious trap. You must hit it.',
	'22. /b/ sucks today.',
	'23. Cock goes in here.',
	'24. You will never have sex.',
	'25. ????',
	'26. PROFIT!',
	'27. It needs more Desu. No exceptions.',
	'28. There will always be more fucked up shit than what you just saw.',
	'29. You can not divide by zero (just because the calculator says so).',
	'30. No real limits of any kind apply here — not even the sky',
	'31. CAPSLOCK IS CRUISE CONTROL FOR COOL.',
	'32. EVEN WITH CRUISE CONTROL YOU STILL HAVE TO STEER.',
	'33. Desu isn\'t funny. Seriously guys. It\'s worse than Chuck Norris jokes.',
	'34. There is porn of it. No exceptions.',
	'35. If no porn is found of it, it will be created.',
	'36. No matter what it is, it is somebody\'s fetish. No exceptions.',
	'37. Even one positive comment about Japanese things can make you a weeaboo.',
	'38. When one sees a lion, one must get into the car',
	'39. There is furry porn of it. No exceptions.',
	'40. The pool is always closed due to AIDS (and stingrays, which also have AIDS).',
	'41. If there isn\'t enough just ask for Moar.',
	'42. Everything has been cracked and pirated.',
	'43. DISREGARD THAT I SUCK COCKS',
	'44. The internet is not your personal army.',
	'45. Rule 45 is a lie.',
	'46. The cake is a lie.',
	'47. If you post it, they will cum.',
	'48. It will always need moar sauce.',
	'49. The internet makes you stupid.',
	'50. Anything can be a meme.',
	'51. Longcat is looooooooooong.',
	'52. If something goes wrong, Ebaums did it.',
	'53. Anonymous is a virgin by default.',
	'54. Moot has cat ears, even in real life. No exceptions.',
	'55. CP is awwwright, but DSFARGEG will get you b&.',
	'56. Don\'t mess with football.',
	'57. MrSpooky has never seen so many ingrates.',
	'58. Anonymous does not "buy", he downloads.',
	'59. The term "sage" does not refer to the spice.',
	'60. If you say Candlejack, you w',
	'61. You cannot divide by zero.',
	'62. The internet is SERIOUS FUCKING BUSINESS.',
	'63. If you do not believe it, then it must be habeebed for great justice.',
	'64. Not even Spider-Man knows how to shot web.',
	'65. Mitchell Henderson was an hero to us all.',
	'66. This is not lupus, it\'s SPARTAAAAAAAAAA.',
	'67. One does not simply shoop da whoop into Mordor.',
	'68. Katy is bi, so deal w/it.',
	'69. LOL SIXTY NINE AMIRITE?',
	'70. Also, cocks.',
	'71. This is a showdown, a throwdown, hell no I can\'t slow down, it\'s gonna go.',
	'72. Anonymous did NOT, under any circumstances, tk him 2da bar|?',
	'73. If you express astonishment at someone\'s claim, it is most likely just a clever ruse.',
	'74. If it hadn\'t been for Cotton Eyed Joe, Anonymous would have been married a long time ago.',
	'75. Around Snacks, CP is lax.',
	'76. All numbers are at least 100 but always OVER NINE THOUSAAAAAND.',
	'77. Hal Turner definitely needs to gb2/hell/.',
	'78. Mods are fucking fags. No exceptions.',
	'79. All Caturday threads will be bombarded with Zippocat. No exceptions.',
	'80. No matter how cute it is, it probably skullfucked your mother last night.',
	'81. That\'s not mud.',
	'82. Steve Irwin\'s death is really, really funny.',
	'83. The Internet is SERIOUS FUCKING BUSINESS.',
	'84. Rule 87 is true.',
	'85. Yes, it is some chickens.',
	'86. Bobba bobba is bobba.',
	'87. Rule 84 is false. OH SHI-',
	'88. If your statement is preceded by "HAY GUYZ", then you are not doing it right.',
	'89. If you cannot understand it, it is machine code.',
	'90. Anonymous still owes Hal Turner one trillion U.S. dollars.',
	'91. Spengbab Sqarpaint is luv Padtwick Zhstar iz fwend.',
	'92. Disregard Bigmike, he sucks cocks.',
	'93. Secure tripcodes are for jerks.',
	'94. If someone herd u liek Mudkips, deny it constantly for the lulz.',
	'95. Combo breakers are inevitable. If the combo is completed successfully, it is gay.',
	'96. I am a huge faggot. Please rape my face.',
	'97. Shit sucks and will never be stickied.',
	'98. Bricks must are required to be shat whenever Anonymous is surprised.',
	'99. If you have no bricks to shit, you are made of fail and AIDS.',
	'100. ZOMG NONE',
	'101. The internet is always right. No exceptions',
	'102. The internet is really, really great, FOR PORN.'
];

function findRulz ( msg ) {
	//matches will look like this:
	// [ ruleIndex, to/and, ruleIndex ]
	var start = Math.max( msg.matches[1], 1 ) - 1,
		end = Math.min( msg.matches[3], rulz.length ),
		preposition = msg.matches[ 2 ],
		tmp, res;

	console.log( start, end, preposition, 'rulz' );

	if ( start && !end ) {
		return rulz[ start ];
	}

	if ( preposition === 'to' ) {
		if ( start > end ) {
			tmp = start;
			start = end;
			end = tmp;
		}

		res = rulz.slice( start, end );
	}
	else {
		res = [ rulz[start], rulz[end] ];
	}

	return res.join( '\n' );
}

var regex = /(?:show|tell) (?:me)? rules? (\d+)\s?(?:(,|and|to)\s?(\d+))?/;

bot.listen( regex, findRulz );
}());

;
IO.register( 'input', function ( msgObj ) {
	var words = msgObj.content.match( /\w+/g ) || [];

	if ( words.length === 1 && words[0].toUpperCase() === 'STOP' ) {
		bot.adapter.out.add( 'HAMMERTIME!', msgObj.room_id );
	}
});

;
(function () {
var specParts;
specParts = [{"section":"introduction","name":"Introduction"},{"section":"x1","name":"1 Scope"},{"section":"x2","name":"2 Conformance"},{"section":"x3","name":"3 Normative references"},{"section":"x4","name":"4 Overview"},{"section":"x4.1","name":"4.1 Web Scripting"},{"section":"x4.2","name":"4.2 Language Overview"},{"section":"x4.2.1","name":"4.2.1 Objects"},{"section":"x4.2.2","name":"4.2.2 The Strict Variant of ECMAScript"},{"section":"x4.3","name":"4.3 Definitions"},{"section":"x4.3.1","name":"4.3.1 type"},{"section":"x4.3.2","name":"4.3.2 primitive value"},{"section":"x4.3.3","name":"4.3.3 object"},{"section":"x4.3.4","name":"4.3.4 constructor"},{"section":"x4.3.5","name":"4.3.5 prototype"},{"section":"x4.3.6","name":"4.3.6 native object"},{"section":"x4.3.7","name":"4.3.7 built-in object"},{"section":"x4.3.8","name":"4.3.8 host object"},{"section":"x4.3.9","name":"4.3.9 undefined value"},{"section":"x4.3.10","name":"4.3.10 Undefined type"},{"section":"x4.3.11","name":"4.3.11 null value"},{"section":"x4.3.12","name":"4.3.12 Null type"},{"section":"x4.3.13","name":"4.3.13 Boolean value"},{"section":"x4.3.14","name":"4.3.14 Boolean type"},{"section":"x4.3.15","name":"4.3.15 Boolean object"},{"section":"x4.3.16","name":"4.3.16 String value"},{"section":"x4.3.17","name":"4.3.17 String type"},{"section":"x4.3.18","name":"4.3.18 String object"},{"section":"x4.3.19","name":"4.3.19 Number value"},{"section":"x4.3.20","name":"4.3.20 Number type"},{"section":"x4.3.21","name":"4.3.21 Number object"},{"section":"x4.3.22","name":"4.3.22 Infinity"},{"section":"x4.3.23","name":"4.3.23 NaN"},{"section":"x4.3.24","name":"4.3.24 function"},{"section":"x4.3.25","name":"4.3.25 built-in function"},{"section":"x4.3.26","name":"4.3.26 property"},{"section":"x4.3.27","name":"4.3.27 method"},{"section":"x4.3.28","name":"4.3.28 built-in method"},{"section":"x4.3.29","name":"4.3.29 attribute"},{"section":"x4.3.30","name":"4.3.30 own property"},{"section":"x4.3.31","name":"4.3.31 inherited property"},{"section":"x5","name":"5 Notational Conventions"},{"section":"x5.1","name":"5.1 Syntactic and Lexical Grammars"},{"section":"x5.1.1","name":"5.1.1 Context-Free Grammars"},{"section":"x5.1.2","name":"5.1.2 The Lexical and RegExp Grammars"},{"section":"x5.1.3","name":"5.1.3 The Numeric String Grammar"},{"section":"x5.1.4","name":"5.1.4 The Syntactic Grammar"},{"section":"x5.1.5","name":"5.1.5 The JSON Grammar"},{"section":"x5.1.6","name":"5.1.6 Grammar Notation"},{"section":"x5.2","name":"5.2 Algorithm Conventions"},{"section":"x6","name":"6 Source Text"},{"section":"x7","name":"7 Lexical Conventions"},{"section":"x7.1","name":"7.1 Unicode Format-Control Characters"},{"section":"x7.2","name":"7.2 White Space"},{"section":"x7.3","name":"7.3 Line Terminators"},{"section":"x7.4","name":"7.4 Comments"},{"section":"x7.5","name":"7.5 Tokens"},{"section":"x7.6","name":"7.6 Identifier Names and Identifiers"},{"section":"x7.6.1","name":"7.6.1 Reserved Words"},{"section":"x7.6.1.1","name":"7.6.1.1 Keywords"},{"section":"x7.6.1.2","name":"7.6.1.2 Future Reserved Words"},{"section":"x7.7","name":"7.7 Punctuators"},{"section":"x7.8","name":"7.8 Literals"},{"section":"x7.8.1","name":"7.8.1 Null Literals"},{"section":"x7.8.2","name":"7.8.2 Boolean Literals"},{"section":"x7.8.3","name":"7.8.3 Numeric Literals"},{"section":"x7.8.4","name":"7.8.4 String Literals"},{"section":"x7.8.5","name":"7.8.5 Regular Expression Literals"},{"section":"x7.9","name":"7.9 Automatic Semicolon Insertion"},{"section":"x7.9.1","name":"7.9.1 Rules of Automatic Semicolon Insertion"},{"section":"x7.9.2","name":"7.9.2 Examples of Automatic Semicolon Insertion"},{"section":"x8","name":"8 Types"},{"section":"x8.1","name":"8.1 The Undefined Type"},{"section":"x8.2","name":"8.2 The Null Type"},{"section":"x8.3","name":"8.3 The Boolean Type"},{"section":"x8.4","name":"8.4 The String Type"},{"section":"x8.5","name":"8.5 The Number Type"},{"section":"x8.6","name":"8.6 The Object Type"},{"section":"x8.6.1","name":"8.6.1 Property Attributes"},{"section":"x8.6.2","name":"8.6.2 Object Internal Properties and Methods"},{"section":"x8.7","name":"8.7 The Reference Specification Type"},{"section":"x8.7.1","name":"8.7.1 GetValue (V)"},{"section":"x8.7.2","name":"8.7.2 PutValue (V, W)"},{"section":"x8.8","name":"8.8 The List Specification Type"},{"section":"x8.9","name":"8.9 The Completion Specification Type"},{"section":"x8.10","name":"8.10 The Property Descriptor and Property Identifier Specification Types"},{"section":"x8.10.1","name":"8.10.1 IsAccessorDescriptor ( Desc )"},{"section":"x8.10.2","name":"8.10.2 IsDataDescriptor ( Desc )"},{"section":"x8.10.3","name":"8.10.3 IsGenericDescriptor ( Desc )"},{"section":"x8.10.4","name":"8.10.4 FromPropertyDescriptor ( Desc )"},{"section":"x8.10.5","name":"8.10.5 ToPropertyDescriptor ( Obj )"},{"section":"x8.11","name":"8.11 The Lexical Environment and Environment Record Specification Types"},{"section":"x8.12","name":"8.12 Algorithms for Object Internal Methods"},{"section":"x8.12.1","name":"8.12.1 [[GetOwnProperty]] (P)"},{"section":"x8.12.2","name":"8.12.2 [[GetProperty]] (P)"},{"section":"x8.12.3","name":"8.12.3 [[Get]] (P)"},{"section":"x8.12.4","name":"8.12.4 [[CanPut]] (P)"},{"section":"x8.12.5","name":"8.12.5 [[Put]] ( P, V, Throw )"},{"section":"x8.12.6","name":"8.12.6 [[HasProperty]] (P)"},{"section":"x8.12.7","name":"8.12.7 [[Delete]] (P, Throw)"},{"section":"x8.12.8","name":"8.12.8 [[DefaultValue]] (hint)"},{"section":"x8.12.9","name":"8.12.9 [[DefineOwnProperty]] (P, Desc, Throw)"},{"section":"x9","name":"9 Type Conversion and Testing"},{"section":"x9.1","name":"9.1 ToPrimitive"},{"section":"x9.2","name":"9.2 ToBoolean"},{"section":"x9.3","name":"9.3 ToNumber"},{"section":"x9.3.1","name":"9.3.1 ToNumber Applied to the String Type"},{"section":"x9.4","name":"9.4 ToInteger"},{"section":"x9.5","name":"9.5 ToInt32: (Signed 32 Bit Integer)"},{"section":"x9.6","name":"9.6 ToUint32: (Unsigned 32 Bit Integer)"},{"section":"x9.7","name":"9.7 ToUint16: (Unsigned 16 Bit Integer)"},{"section":"x9.8","name":"9.8 ToString"},{"section":"x9.8.1","name":"9.8.1 ToString Applied to the Number Type"},{"section":"x9.9","name":"9.9 ToObject"},{"section":"x9.10","name":"9.10 CheckObjectCoercible"},{"section":"x9.11","name":"9.11 IsCallable"},{"section":"x9.12","name":"9.12 The SameValue Algorithm"},{"section":"x10","name":"10 Executable Code and Execution Contexts"},{"section":"x10.1","name":"10.1 Types of Executable Code"},{"section":"x10.1.1","name":"10.1.1 Strict Mode Code"},{"section":"x10.2","name":"10.2 Lexical Environments"},{"section":"x10.2.1","name":"10.2.1 Environment Records"},{"section":"x10.2.1.1","name":"10.2.1.1 Declarative Environment Records"},{"section":"x10.2.1.1.1","name":"10.2.1.1.1 HasBinding(N)"},{"section":"x10.2.1.1.2","name":"10.2.1.1.2 CreateMutableBinding (N, D)"},{"section":"x10.2.1.1.3","name":"10.2.1.1.3 SetMutableBinding (N,V,S)"},{"section":"x10.2.1.1.4","name":"10.2.1.1.4 GetBindingValue(N,S)"},{"section":"x10.2.1.1.5","name":"10.2.1.1.5 DeleteBinding (N)"},{"section":"x10.2.1.1.6","name":"10.2.1.1.6 ImplicitThisValue()"},{"section":"x10.2.1.1.7","name":"10.2.1.1.7 CreateImmutableBinding (N)"},{"section":"x10.2.1.1.8","name":"10.2.1.1.8 InitializeImmutableBinding (N,V)"},{"section":"x10.2.1.2","name":"10.2.1.2 Object Environment Records"},{"section":"x10.2.1.2.1","name":"10.2.1.2.1 HasBinding(N)"},{"section":"x10.2.1.2.2","name":"10.2.1.2.2 CreateMutableBinding (N, D)"},{"section":"x10.2.1.2.3","name":"10.2.1.2.3 SetMutableBinding (N,V,S)"},{"section":"x10.2.1.2.4","name":"10.2.1.2.4 GetBindingValue(N,S)"},{"section":"x10.2.1.2.5","name":"10.2.1.2.5 DeleteBinding (N)"},{"section":"x10.2.1.2.6","name":"10.2.1.2.6 ImplicitThisValue()"},{"section":"x10.2.2","name":"10.2.2 Lexical Environment Operations"},{"section":"x10.2.2.1","name":"10.2.2.1 GetIdentifierReference (lex, name, strict)"},{"section":"x10.2.2.2","name":"10.2.2.2 NewDeclarativeEnvironment (E)"},{"section":"x10.2.2.3","name":"10.2.2.3 NewObjectEnvironment (O, E)"},{"section":"x10.2.3","name":"10.2.3 The Global Environment"},{"section":"x10.3","name":"10.3 Execution Contexts"},{"section":"x10.3.1","name":"10.3.1 Identifier Resolution"},{"section":"x10.4","name":"10.4 Establishing an Execution Context"},{"section":"x10.4.1","name":"10.4.1 Entering Global Code"},{"section":"x10.4.1.1","name":"10.4.1.1 Initial Global Execution Context"},{"section":"x10.4.2","name":"10.4.2 Entering Eval Code"},{"section":"x10.4.2.1","name":"10.4.2.1 Strict Mode Restrictions"},{"section":"x10.4.3","name":"10.4.3 Entering Function Code"},{"section":"x10.5","name":"10.5 Declaration Binding Instantiation"},{"section":"x10.6","name":"10.6 Arguments Object"},{"section":"x11","name":"11 Expressions"},{"section":"x11.1","name":"11.1 Primary Expressions"},{"section":"x11.1.1","name":"11.1.1 The this Keyword"},{"section":"x11.1.2","name":"11.1.2 Identifier Reference"},{"section":"x11.1.3","name":"11.1.3 Literal Reference"},{"section":"x11.1.4","name":"11.1.4 Array Initialiser"},{"section":"x11.1.5","name":"11.1.5 Object Initialiser"},{"section":"x11.1.6","name":"11.1.6 The Grouping Operator"},{"section":"x11.2","name":"11.2 Left-Hand-Side Expressions"},{"section":"x11.2.1","name":"11.2.1 Property Accessors"},{"section":"x11.2.2","name":"11.2.2 The new Operator"},{"section":"x11.2.3","name":"11.2.3 Function Calls"},{"section":"x11.2.4","name":"11.2.4 Argument Lists"},{"section":"x11.2.5","name":"11.2.5 Function Expressions"},{"section":"x11.3","name":"11.3 Postfix Expressions"},{"section":"x11.3.1","name":"11.3.1 Postfix Increment Operator"},{"section":"x11.3.2","name":"11.3.2 Postfix Decrement Operator"},{"section":"x11.4","name":"11.4 Unary Operators"},{"section":"x11.4.1","name":"11.4.1 The delete Operator"},{"section":"x11.4.2","name":"11.4.2 The void Operator"},{"section":"x11.4.3","name":"11.4.3 The typeof Operator"},{"section":"x11.4.4","name":"11.4.4 Prefix Increment Operator"},{"section":"x11.4.5","name":"11.4.5 Prefix Decrement Operator"},{"section":"x11.4.6","name":"11.4.6 Unary + Operator"},{"section":"x11.4.7","name":"11.4.7 Unary - Operator"},{"section":"x11.4.8","name":"11.4.8 Bitwise NOT Operator ( ~ )"},{"section":"x11.4.9","name":"11.4.9 Logical NOT Operator ( ! )"},{"section":"x11.5","name":"11.5 Multiplicative Operators"},{"section":"x11.5.1","name":"11.5.1 Applying the * Operator"},{"section":"x11.5.2","name":"11.5.2 Applying the / Operator"},{"section":"x11.5.3","name":"11.5.3 Applying the % Operator"},{"section":"x11.6","name":"11.6 Additive Operators"},{"section":"x11.6.1","name":"11.6.1 The Addition operator ( + )"},{"section":"x11.6.2","name":"11.6.2 The Subtraction Operator ( - )"},{"section":"x11.6.3","name":"11.6.3 Applying the Additive Operators to Numbers"},{"section":"x11.7","name":"11.7 Bitwise Shift Operators"},{"section":"x11.7.1","name":"11.7.1 The Left Shift Operator ( << )"},{"section":"x11.7.2","name":"11.7.2 The Signed Right Shift Operator ( >> )"},{"section":"x11.7.3","name":"11.7.3 The Unsigned Right Shift Operator ( >>> )"},{"section":"x11.8","name":"11.8 Relational Operators"},{"section":"x11.8.1","name":"11.8.1 The Less-than Operator ( < )"},{"section":"x11.8.2","name":"11.8.2 The Greater-than Operator ( > )"},{"section":"x11.8.3","name":"11.8.3 The Less-than-or-equal Operator ( <= )"},{"section":"x11.8.4","name":"11.8.4 The Greater-than-or-equal Operator ( >= )"},{"section":"x11.8.5","name":"11.8.5 The Abstract Relational Comparison Algorithm"},{"section":"x11.8.6","name":"11.8.6 The instanceof operator"},{"section":"x11.8.7","name":"11.8.7 The in operator"},{"section":"x11.9","name":"11.9 Equality Operators"},{"section":"x11.9.1","name":"11.9.1 The Equals Operator ( == )"},{"section":"x11.9.2","name":"11.9.2 The Does-not-equals Operator ( != )"},{"section":"x11.9.3","name":"11.9.3 The Abstract Equality Comparison Algorithm"},{"section":"x11.9.4","name":"11.9.4 The Strict Equals Operator ( === )"},{"section":"x11.9.5","name":"11.9.5 The Strict Does-not-equal Operator ( !== )"},{"section":"x11.9.6","name":"11.9.6 The Strict Equality Comparison Algorithm"},{"section":"x11.10","name":"11.10 Binary Bitwise Operators"},{"section":"x11.11","name":"11.11 Binary Logical Operators"},{"section":"x11.12","name":"11.12 Conditional Operator ( ? : )"},{"section":"x11.13","name":"11.13 Assignment Operators"},{"section":"x11.13.1","name":"11.13.1 Simple Assignment ( = )"},{"section":"x11.13.2","name":"11.13.2 Compound Assignment ( op= )"},{"section":"x11.14","name":"11.14 Comma Operator ( , )"},{"section":"x12","name":"12 Statements"},{"section":"x12.1","name":"12.1 Block"},{"section":"x12.2","name":"12.2 Variable Statement"},{"section":"x12.2.1","name":"12.2.1 Strict Mode Restrictions"},{"section":"x12.3","name":"12.3 Empty Statement"},{"section":"x12.4","name":"12.4 Expression Statement"},{"section":"x12.5","name":"12.5 The if Statement"},{"section":"x12.6","name":"12.6 Iteration Statements"},{"section":"x12.6.1","name":"12.6.1 The do-while Statement"},{"section":"x12.6.2","name":"12.6.2 The while Statement"},{"section":"x12.6.3","name":"12.6.3 The for Statement"},{"section":"x12.6.4","name":"12.6.4 The for-in Statement"},{"section":"x12.7","name":"12.7 The continue Statement"},{"section":"x12.8","name":"12.8 The break Statement"},{"section":"x12.9","name":"12.9 The return Statement"},{"section":"x12.10","name":"12.10 The with Statement"},{"section":"x12.10.1","name":"12.10.1 Strict Mode Restrictions"},{"section":"x12.11","name":"12.11 The switch Statement"},{"section":"x12.12","name":"12.12 Labelled Statements"},{"section":"x12.13","name":"12.13 The throw Statement"},{"section":"x12.14","name":"12.14 The try Statement"},{"section":"x12.14.1","name":"12.14.1 Strict Mode Restrictions"},{"section":"x12.15","name":"12.15 The debugger statement"},{"section":"x13","name":"13 Function Definition"},{"section":"x13.1","name":"13.1 Strict Mode Restrictions"},{"section":"x13.2","name":"13.2 Creating Function Objects"},{"section":"x13.2.1","name":"13.2.1 [[Call]]"},{"section":"x13.2.2","name":"13.2.2 [[Construct]]"},{"section":"x13.2.3","name":"13.2.3 The Function Object"},{"section":"x14","name":"14 Program"},{"section":"x14.1","name":"14.1 Directive Prologues and the Use Strict Directive"},{"section":"x15","name":"15 Standard Built-in ECMAScript Objects"},{"section":"x15.1","name":"15.1 The Global Object"},{"section":"x15.1.1","name":"15.1.1 Value Properties of the Global Object"},{"section":"x15.1.1.1","name":"15.1.1.1 NaN"},{"section":"x15.1.1.2","name":"15.1.1.2 Infinity"},{"section":"x15.1.1.3","name":"15.1.1.3 undefined"},{"section":"x15.1.2","name":"15.1.2 Function Properties of the Global Object"},{"section":"x15.1.2.1","name":"15.1.2.1 eval (x)"},{"section":"x15.1.2.1.1","name":"15.1.2.1.1 Direct Call to Eval"},{"section":"x15.1.2.2","name":"15.1.2.2 parseInt (string , radix)"},{"section":"x15.1.2.3","name":"15.1.2.3 parseFloat (string)"},{"section":"x15.1.2.4","name":"15.1.2.4 isNaN (number)"},{"section":"x15.1.2.5","name":"15.1.2.5 isFinite (number)"},{"section":"x15.1.3","name":"15.1.3 URI Handling Function Properties"},{"section":"x15.1.3.1","name":"15.1.3.1 decodeURI (encodedURI)"},{"section":"x15.1.3.2","name":"15.1.3.2 decodeURIComponent (encodedURIComponent)"},{"section":"x15.1.3.3","name":"15.1.3.3 encodeURI (uri)"},{"section":"x15.1.3.4","name":"15.1.3.4 encodeURIComponent (uriComponent)"},{"section":"x15.1.4","name":"15.1.4 Constructor Properties of the Global Object"},{"section":"x15.1.4.1","name":"15.1.4.1 Object ( . . . )"},{"section":"x15.1.4.2","name":"15.1.4.2 Function ( . . . )"},{"section":"x15.1.4.3","name":"15.1.4.3 Array ( . . . )"},{"section":"x15.1.4.4","name":"15.1.4.4 String ( . . . )"},{"section":"x15.1.4.5","name":"15.1.4.5 Boolean ( . . . )"},{"section":"x15.1.4.6","name":"15.1.4.6 Number ( . . . )"},{"section":"x15.1.4.7","name":"15.1.4.7 Date ( . . . )"},{"section":"x15.1.4.8","name":"15.1.4.8 RegExp ( . . . )"},{"section":"x15.1.4.9","name":"15.1.4.9 Error ( . . . )"},{"section":"x15.1.4.10","name":"15.1.4.10 EvalError ( . . . )"},{"section":"x15.1.4.11","name":"15.1.4.11 RangeError ( . . . )"},{"section":"x15.1.4.12","name":"15.1.4.12 ReferenceError ( . . . )"},{"section":"x15.1.4.13","name":"15.1.4.13 SyntaxError ( . . . )"},{"section":"x15.1.4.14","name":"15.1.4.14 TypeError ( . . . )"},{"section":"x15.1.4.15","name":"15.1.4.15 URIError ( . . . )"},{"section":"x15.1.5","name":"15.1.5 Other Properties of the Global Object"},{"section":"x15.1.5.1","name":"15.1.5.1 Math"},{"section":"x15.1.5.2","name":"15.1.5.2 JSON"},{"section":"x15.2","name":"15.2 Object Objects"},{"section":"x15.2.1","name":"15.2.1 The Object Constructor Called as a Function"},{"section":"x15.2.1.1","name":"15.2.1.1 Object ( [ value ] )"},{"section":"x15.2.2","name":"15.2.2 The Object Constructor"},{"section":"x15.2.2.1","name":"15.2.2.1 new Object ( [ value ] )"},{"section":"x15.2.3","name":"15.2.3 Properties of the Object Constructor"},{"section":"x15.2.3.1","name":"15.2.3.1 Object.prototype"},{"section":"x15.2.3.2","name":"15.2.3.2 Object.getPrototypeOf ( O )"},{"section":"x15.2.3.3","name":"15.2.3.3 Object.getOwnPropertyDescriptor ( O, P ) "},{"section":"x15.2.3.4","name":"15.2.3.4 Object.getOwnPropertyNames ( O )"},{"section":"x15.2.3.5","name":"15.2.3.5 Object.create ( O [, Properties] )"},{"section":"x15.2.3.6","name":"15.2.3.6 Object.defineProperty ( O, P, Attributes )"},{"section":"x15.2.3.7","name":"15.2.3.7 Object.defineProperties ( O, Properties )"},{"section":"x15.2.3.8","name":"15.2.3.8 Object.seal ( O )"},{"section":"x15.2.3.9","name":"15.2.3.9 Object.freeze ( O )"},{"section":"x15.2.3.10","name":"15.2.3.10 Object.preventExtensions ( O )"},{"section":"x15.2.3.11","name":"15.2.3.11 Object.isSealed ( O )"},{"section":"x15.2.3.12","name":"15.2.3.12 Object.isFrozen ( O )"},{"section":"x15.2.3.13","name":"15.2.3.13 Object.isExtensible ( O )"},{"section":"x15.2.3.14","name":"15.2.3.14 Object.keys ( O )"},{"section":"x15.2.4","name":"15.2.4 Properties of the Object Prototype Object"},{"section":"x15.2.4.1","name":"15.2.4.1 Object.prototype.constructor"},{"section":"x15.2.4.2","name":"15.2.4.2 Object.prototype.toString ( )"},{"section":"x15.2.4.3","name":"15.2.4.3 Object.prototype.toLocaleString ( )"},{"section":"x15.2.4.4","name":"15.2.4.4 Object.prototype.valueOf ( )"},{"section":"x15.2.4.5","name":"15.2.4.5 Object.prototype.hasOwnProperty (V)"},{"section":"x15.2.4.6","name":"15.2.4.6 Object.prototype.isPrototypeOf (V)"},{"section":"x15.2.4.7","name":"15.2.4.7 Object.prototype.propertyIsEnumerable (V)"},{"section":"x15.2.5","name":"15.2.5 Properties of Object Instances"},{"section":"x15.3","name":"15.3 Function Objects"},{"section":"x15.3.1","name":"15.3.1 The Function Constructor Called as a Function"},{"section":"x15.3.1.1","name":"15.3.1.1 Function (p1, p2, … , pn, body)"},{"section":"x15.3.2","name":"15.3.2 The Function Constructor"},{"section":"x15.3.2.1","name":"15.3.2.1 new Function (p1, p2, … , pn, body)"},{"section":"x15.3.3","name":"15.3.3 Properties of the Function Constructor"},{"section":"x15.3.3.1","name":"15.3.3.1 Function.prototype"},{"section":"x15.3.3.2","name":"15.3.3.2 Function.length"},{"section":"x15.3.4","name":"15.3.4 Properties of the Function Prototype Object"},{"section":"x15.3.4.1","name":"15.3.4.1 Function.prototype.constructor"},{"section":"x15.3.4.2","name":"15.3.4.2 Function.prototype.toString ( )"},{"section":"x15.3.4.3","name":"15.3.4.3 Function.prototype.apply (thisArg, argArray)"},{"section":"x15.3.4.4","name":"15.3.4.4 Function.prototype.call (thisArg [ , arg1 [ , arg2, … ] ] )"},{"section":"x15.3.4.5","name":"15.3.4.5 Function.prototype.bind (thisArg [, arg1 [, arg2, …]])"},{"section":"x15.3.4.5.1","name":"15.3.4.5.1 [[Call]]"},{"section":"x15.3.4.5.2","name":"15.3.4.5.2 [[Construct]]"},{"section":"x15.3.4.5.3","name":"15.3.4.5.3 [[HasInstance]] (V)"},{"section":"x15.3.5","name":"15.3.5 Properties of Function Instances"},{"section":"x15.3.5.1","name":"15.3.5.1 length"},{"section":"x15.3.5.2","name":"15.3.5.2 prototype"},{"section":"x15.3.5.3","name":"15.3.5.3 [[HasInstance]] (V)"},{"section":"x15.3.5.4","name":"15.3.5.4 [[Get]] (P)"},{"section":"x15.4","name":"15.4 Array Objects"},{"section":"x15.4.1","name":"15.4.1 The Array Constructor Called as a Function"},{"section":"x15.4.1.1","name":"15.4.1.1 Array ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.2","name":"15.4.2 The Array Constructor"},{"section":"x15.4.2.1","name":"15.4.2.1 new Array ( [ item0 [ , item1 [ , … ] ] ] )"},{"section":"x15.4.2.2","name":"15.4.2.2 new Array (len)"},{"section":"x15.4.3","name":"15.4.3 Properties of the Array Constructor"},{"section":"x15.4.3.1","name":"15.4.3.1 Array.prototype"},{"section":"x15.4.3.2","name":"15.4.3.2 Array.isArray ( arg )"},{"section":"x15.4.4","name":"15.4.4 Properties of the Array Prototype Object"},{"section":"x15.4.4.1","name":"15.4.4.1 Array.prototype.constructor"},{"section":"x15.4.4.2","name":"15.4.4.2 Array.prototype.toString ( )"},{"section":"x15.4.4.3","name":"15.4.4.3 Array.prototype.toLocaleString ( )"},{"section":"x15.4.4.4","name":"15.4.4.4 Array.prototype.concat ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.5","name":"15.4.4.5 Array.prototype.join (separator)"},{"section":"x15.4.4.6","name":"15.4.4.6 Array.prototype.pop ( )"},{"section":"x15.4.4.7","name":"15.4.4.7 Array.prototype.push ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.8","name":"15.4.4.8 Array.prototype.reverse ( )"},{"section":"x15.4.4.9","name":"15.4.4.9 Array.prototype.shift ( )"},{"section":"x15.4.4.10","name":"15.4.4.10 Array.prototype.slice (start, end)"},{"section":"x15.4.4.11","name":"15.4.4.11 Array.prototype.sort (comparefn)"},{"section":"x15.4.4.12","name":"15.4.4.12 Array.prototype.splice (start, deleteCount [ , item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.13","name":"15.4.4.13 Array.prototype.unshift ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.14","name":"15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )"},{"section":"x15.4.4.15","name":"15.4.4.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )"},{"section":"x15.4.4.16","name":"15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.17","name":"15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.18","name":"15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.19","name":"15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.20","name":"15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.21","name":"15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )"},{"section":"x15.4.4.22","name":"15.4.4.22 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )"},{"section":"x15.4.5","name":"15.4.5 Properties of Array Instances"},{"section":"x15.4.5.1","name":"15.4.5.1 [[DefineOwnProperty]] ( P, Desc, Throw )"},{"section":"x15.4.5.2","name":"15.4.5.2 length"},{"section":"x15.5","name":"15.5 String Objects"},{"section":"x15.5.1","name":"15.5.1 The String Constructor Called as a Function"},{"section":"x15.5.1.1","name":"15.5.1.1 String ( [ value ] )"},{"section":"x15.5.2","name":"15.5.2 The String Constructor"},{"section":"x15.5.2.1","name":"15.5.2.1 new String ( [ value ] )"},{"section":"x15.5.3","name":"15.5.3 Properties of the String Constructor"},{"section":"x15.5.3.1","name":"15.5.3.1 String.prototype"},{"section":"x15.5.3.2","name":"15.5.3.2 String.fromCharCode ( [ char0 [ , char1 [ , … ] ] ] )"},{"section":"x15.5.4","name":"15.5.4 Properties of the String Prototype Object"},{"section":"x15.5.4.1","name":"15.5.4.1 String.prototype.constructor"},{"section":"x15.5.4.2","name":"15.5.4.2 String.prototype.toString ( )"},{"section":"x15.5.4.3","name":"15.5.4.3 String.prototype.valueOf ( )"},{"section":"x15.5.4.4","name":"15.5.4.4 String.prototype.charAt (pos)"},{"section":"x15.5.4.5","name":"15.5.4.5 String.prototype.charCodeAt (pos)"},{"section":"x15.5.4.6","name":"15.5.4.6 String.prototype.concat ( [ string1 [ , string2 [ , … ] ] ] )"},{"section":"x15.5.4.7","name":"15.5.4.7 String.prototype.indexOf (searchString, position)"},{"section":"x15.5.4.8","name":"15.5.4.8 String.prototype.lastIndexOf (searchString, position)"},{"section":"x15.5.4.9","name":"15.5.4.9 String.prototype.localeCompare (that)"},{"section":"x15.5.4.10","name":"15.5.4.10 String.prototype.match (regexp)"},{"section":"x15.5.4.11","name":"15.5.4.11 String.prototype.replace (searchValue, replaceValue)"},{"section":"x15.5.4.12","name":"15.5.4.12 String.prototype.search (regexp)"},{"section":"x15.5.4.13","name":"15.5.4.13 String.prototype.slice (start, end)"},{"section":"x15.5.4.14","name":"15.5.4.14 String.prototype.split (separator, limit)"},{"section":"x15.5.4.15","name":"15.5.4.15 String.prototype.substring (start, end)"},{"section":"x15.5.4.16","name":"15.5.4.16 String.prototype.toLowerCase ( )"},{"section":"x15.5.4.17","name":"15.5.4.17 String.prototype.toLocaleLowerCase ( )"},{"section":"x15.5.4.18","name":"15.5.4.18 String.prototype.toUpperCase ( )"},{"section":"x15.5.4.19","name":"15.5.4.19 String.prototype.toLocaleUpperCase ( )"},{"section":"x15.5.4.20","name":"15.5.4.20 String.prototype.trim ( )"},{"section":"x15.5.5","name":"15.5.5 Properties of String Instances"},{"section":"x15.5.5.1","name":"15.5.5.1 length"},{"section":"x15.5.5.2","name":"15.5.5.2 [[GetOwnProperty]] ( P )"},{"section":"x15.6","name":"15.6 Boolean Objects"},{"section":"x15.6.1","name":"15.6.1 The Boolean Constructor Called as a Function"},{"section":"x15.6.1.1","name":"15.6.1.1 Boolean (value)"},{"section":"x15.6.2","name":"15.6.2 The Boolean Constructor"},{"section":"x15.6.2.1","name":"15.6.2.1 new Boolean (value)"},{"section":"x15.6.3","name":"15.6.3 Properties of the Boolean Constructor"},{"section":"x15.6.3.1","name":"15.6.3.1 Boolean.prototype"},{"section":"x15.6.4","name":"15.6.4 Properties of the Boolean Prototype Object"},{"section":"x15.6.4.1","name":"15.6.4.1 Boolean.prototype.constructor"},{"section":"x15.6.4.2","name":"15.6.4.2 Boolean.prototype.toString ( )"},{"section":"x15.6.4.3","name":"15.6.4.3 Boolean.prototype.valueOf ( )"},{"section":"x15.6.5","name":"15.6.5 Properties of Boolean Instances"},{"section":"x15.7","name":"15.7 Number Objects"},{"section":"x15.7.1","name":"15.7.1 The Number Constructor Called as a Function"},{"section":"x15.7.1.1","name":"15.7.1.1 Number ( [ value ] )"},{"section":"x15.7.2","name":"15.7.2 The Number Constructor"},{"section":"x15.7.2.1","name":"15.7.2.1 new Number ( [ value ] )"},{"section":"x15.7.3","name":"15.7.3 Properties of the Number Constructor"},{"section":"x15.7.3.1","name":"15.7.3.1 Number.prototype"},{"section":"x15.7.3.2","name":"15.7.3.2 Number.MAX_VALUE"},{"section":"x15.7.3.3","name":"15.7.3.3 Number.MIN_VALUE"},{"section":"x15.7.3.4","name":"15.7.3.4 Number.NaN"},{"section":"x15.7.3.5","name":"15.7.3.5 Number.NEGATIVE_INFINITY"},{"section":"x15.7.3.6","name":"15.7.3.6 Number.POSITIVE_INFINITY"},{"section":"x15.7.4","name":"15.7.4 Properties of the Number Prototype Object"},{"section":"x15.7.4.1","name":"15.7.4.1 Number.prototype.constructor"},{"section":"x15.7.4.2","name":"15.7.4.2 Number.prototype.toString ( [ radix ] )"},{"section":"x15.7.4.3","name":"15.7.4.3 Number.prototype.toLocaleString()"},{"section":"x15.7.4.4","name":"15.7.4.4 Number.prototype.valueOf ( )"},{"section":"x15.7.4.5","name":"15.7.4.5 Number.prototype.toFixed (fractionDigits)"},{"section":"x15.7.4.6","name":"15.7.4.6 Number.prototype.toExponential (fractionDigits)"},{"section":"x15.7.4.7","name":"15.7.4.7 Number.prototype.toPrecision (precision)"},{"section":"x15.7.5","name":"15.7.5 Properties of Number Instances"},{"section":"x15.8","name":"15.8 The Math Object"},{"section":"x15.8.1","name":"15.8.1 Value Properties of the Math Object"},{"section":"x15.8.1.1","name":"15.8.1.1 E"},{"section":"x15.8.1.2","name":"15.8.1.2 LN10"},{"section":"x15.8.1.3","name":"15.8.1.3 LN2"},{"section":"x15.8.1.4","name":"15.8.1.4 LOG2E"},{"section":"x15.8.1.5","name":"15.8.1.5 LOG10E"},{"section":"x15.8.1.6","name":"15.8.1.6 PI"},{"section":"x15.8.1.7","name":"15.8.1.7 SQRT1_2"},{"section":"x15.8.1.8","name":"15.8.1.8 SQRT2"},{"section":"x15.8.2","name":"15.8.2 Function Properties of the Math Object"},{"section":"x15.8.2.1","name":"15.8.2.1 abs (x)"},{"section":"x15.8.2.2","name":"15.8.2.2 acos (x)"},{"section":"x15.8.2.3","name":"15.8.2.3 asin (x)"},{"section":"x15.8.2.4","name":"15.8.2.4 atan (x)"},{"section":"x15.8.2.5","name":"15.8.2.5 atan2 (y, x)"},{"section":"x15.8.2.6","name":"15.8.2.6 ceil (x)"},{"section":"x15.8.2.7","name":"15.8.2.7 cos (x)"},{"section":"x15.8.2.8","name":"15.8.2.8 exp (x)"},{"section":"x15.8.2.9","name":"15.8.2.9 floor (x)"},{"section":"x15.8.2.10","name":"15.8.2.10 log (x)"},{"section":"x15.8.2.11","name":"15.8.2.11 max ( [ value1 [ , value2 [ , … ] ] ] )"},{"section":"x15.8.2.12","name":"15.8.2.12 min ( [ value1 [ , value2 [ , … ] ] ] )"},{"section":"x15.8.2.13","name":"15.8.2.13 pow (x, y)"},{"section":"x15.8.2.14","name":"15.8.2.14 random ( )"},{"section":"x15.8.2.15","name":"15.8.2.15 round (x)"},{"section":"x15.8.2.16","name":"15.8.2.16 sin (x)"},{"section":"x15.8.2.17","name":"15.8.2.17 sqrt (x)"},{"section":"x15.8.2.18","name":"15.8.2.18 tan (x)"},{"section":"x15.9","name":"15.9 Date Objects"},{"section":"x15.9.1","name":"15.9.1 Overview of Date Objects and Definitions of Abstract Operators"},{"section":"x15.9.1.1","name":"15.9.1.1 Time Values and Time Range"},{"section":"x15.9.1.2","name":"15.9.1.2 Day Number and Time within Day"},{"section":"x15.9.1.3","name":"15.9.1.3 Year Number"},{"section":"x15.9.1.4","name":"15.9.1.4 Month Number"},{"section":"x15.9.1.5","name":"15.9.1.5 Date Number"},{"section":"x15.9.1.6","name":"15.9.1.6 Week Day"},{"section":"x15.9.1.7","name":"15.9.1.7 Local Time Zone Adjustment"},{"section":"x15.9.1.8","name":"15.9.1.8 Daylight Saving Time Adjustment"},{"section":"x15.9.1.9","name":"15.9.1.9 Local Time"},{"section":"x15.9.1.10","name":"15.9.1.10 Hours, Minutes, Second, and Milliseconds"},{"section":"x15.9.1.11","name":"15.9.1.11 MakeTime (hour, min, sec, ms)"},{"section":"x15.9.1.12","name":"15.9.1.12 MakeDay (year, month, date)"},{"section":"x15.9.1.13","name":"15.9.1.13 MakeDate (day, time)"},{"section":"x15.9.1.14","name":"15.9.1.14 TimeClip (time)"},{"section":"x15.9.1.15","name":"15.9.1.15 Date Time String Format"},{"section":"x15.9.1.15.1","name":"15.9.1.15.1 Extended years"},{"section":"x15.9.2","name":"15.9.2 The Date Constructor Called as a Function"},{"section":"x15.9.2.1","name":"15.9.2.1 Date ( [ year [, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ] ] ] )"},{"section":"x15.9.3","name":"15.9.3 The Date Constructor"},{"section":"x15.9.3.1","name":"15.9.3.1 new Date (year, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ] )"},{"section":"x15.9.3.2","name":"15.9.3.2 new Date (value)"},{"section":"x15.9.3.3","name":"15.9.3.3 new Date ( )"},{"section":"x15.9.4","name":"15.9.4 Properties of the Date Constructor"},{"section":"x15.9.4.1","name":"15.9.4.1 Date.prototype"},{"section":"x15.9.4.2","name":"15.9.4.2 Date.parse (string)"},{"section":"x15.9.4.3","name":"15.9.4.3 Date.UTC (year, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ])"},{"section":"x15.9.4.4","name":"15.9.4.4 Date.now ( )"},{"section":"x15.9.5","name":"15.9.5 Properties of the Date Prototype Object"},{"section":"x15.9.5.1","name":"15.9.5.1 Date.prototype.constructor"},{"section":"x15.9.5.2","name":"15.9.5.2 Date.prototype.toString ( )"},{"section":"x15.9.5.3","name":"15.9.5.3 Date.prototype.toDateString ( )"},{"section":"x15.9.5.4","name":"15.9.5.4 Date.prototype.toTimeString ( )"},{"section":"x15.9.5.5","name":"15.9.5.5 Date.prototype.toLocaleString ( )"},{"section":"x15.9.5.6","name":"15.9.5.6 Date.prototype.toLocaleDateString ( )"},{"section":"x15.9.5.7","name":"15.9.5.7 Date.prototype.toLocaleTimeString ( )"},{"section":"x15.9.5.8","name":"15.9.5.8 Date.prototype.valueOf ( )"},{"section":"x15.9.5.9","name":"15.9.5.9 Date.prototype.getTime ( )"},{"section":"x15.9.5.10","name":"15.9.5.10 Date.prototype.getFullYear ( )"},{"section":"x15.9.5.11","name":"15.9.5.11 Date.prototype.getUTCFullYear ( )"},{"section":"x15.9.5.12","name":"15.9.5.12 Date.prototype.getMonth ( )"},{"section":"x15.9.5.13","name":"15.9.5.13 Date.prototype.getUTCMonth ( )"},{"section":"x15.9.5.14","name":"15.9.5.14 Date.prototype.getDate ( )"},{"section":"x15.9.5.15","name":"15.9.5.15 Date.prototype.getUTCDate ( )"},{"section":"x15.9.5.16","name":"15.9.5.16 Date.prototype.getDay ( )"},{"section":"x15.9.5.17","name":"15.9.5.17 Date.prototype.getUTCDay ( )"},{"section":"x15.9.5.18","name":"15.9.5.18 Date.prototype.getHours ( )"},{"section":"x15.9.5.19","name":"15.9.5.19 Date.prototype.getUTCHours ( )"},{"section":"x15.9.5.20","name":"15.9.5.20 Date.prototype.getMinutes ( )"},{"section":"x15.9.5.21","name":"15.9.5.21 Date.prototype.getUTCMinutes ( )"},{"section":"x15.9.5.22","name":"15.9.5.22 Date.prototype.getSeconds ( )"},{"section":"x15.9.5.23","name":"15.9.5.23 Date.prototype.getUTCSeconds ( )"},{"section":"x15.9.5.24","name":"15.9.5.24 Date.prototype.getMilliseconds ( )"},{"section":"x15.9.5.25","name":"15.9.5.25 Date.prototype.getUTCMilliseconds ( )"},{"section":"x15.9.5.26","name":"15.9.5.26 Date.prototype.getTimezoneOffset ( )"},{"section":"x15.9.5.27","name":"15.9.5.27 Date.prototype.setTime (time)"},{"section":"x15.9.5.28","name":"15.9.5.28 Date.prototype.setMilliseconds (ms)"},{"section":"x15.9.5.29","name":"15.9.5.29 Date.prototype.setUTCMilliseconds (ms)"},{"section":"x15.9.5.30","name":"15.9.5.30 Date.prototype.setSeconds (sec [, ms ] )"},{"section":"x15.9.5.31","name":"15.9.5.31 Date.prototype.setUTCSeconds (sec [, ms ] )"},{"section":"x15.9.5.32","name":"15.9.5.32 Date.prototype.setMinutes (min [, sec [, ms ] ] )"},{"section":"x15.9.5.33","name":"15.9.5.33 Date.prototype.setUTCMinutes (min [, sec [, ms ] ] )"},{"section":"x15.9.5.34","name":"15.9.5.34 Date.prototype.setHours (hour [, min [, sec [, ms ] ] ] )"},{"section":"x15.9.5.35","name":"15.9.5.35 Date.prototype.setUTCHours (hour [, min [, sec [, ms ] ] ] )"},{"section":"x15.9.5.36","name":"15.9.5.36 Date.prototype.setDate (date)"},{"section":"x15.9.5.37","name":"15.9.5.37 Date.prototype.setUTCDate (date)"},{"section":"x15.9.5.38","name":"15.9.5.38 Date.prototype.setMonth (month [, date ] )"},{"section":"x15.9.5.39","name":"15.9.5.39 Date.prototype.setUTCMonth (month [, date ] )"},{"section":"x15.9.5.40","name":"15.9.5.40 Date.prototype.setFullYear (year [, month [, date ] ] )"},{"section":"x15.9.5.41","name":"15.9.5.41 Date.prototype.setUTCFullYear (year [, month [, date ] ] )"},{"section":"x15.9.5.42","name":"15.9.5.42 Date.prototype.toUTCString ( )"},{"section":"x15.9.5.43","name":"15.9.5.43 Date.prototype.toISOString ( )"},{"section":"x15.9.5.44","name":"15.9.5.44 Date.prototype.toJSON ( key )"},{"section":"x15.9.6","name":"15.9.6 Properties of Date Instances"},{"section":"x15.10","name":"15.10 RegExp (Regular Expression) Objects"},{"section":"x15.10.1","name":"15.10.1 Patterns"},{"section":"x15.10.2","name":"15.10.2 Pattern Semantics"},{"section":"x15.10.2.1","name":"15.10.2.1 Notation"},{"section":"x15.10.2.2","name":"15.10.2.2 Pattern"},{"section":"x15.10.2.3","name":"15.10.2.3 Disjunction"},{"section":"x15.10.2.4","name":"15.10.2.4 Alternative"},{"section":"x15.10.2.5","name":"15.10.2.5 Term"},{"section":"x15.10.2.6","name":"15.10.2.6 Assertion"},{"section":"x15.10.2.7","name":"15.10.2.7 Quantifier"},{"section":"x15.10.2.8","name":"15.10.2.8 Atom"},{"section":"x15.10.2.9","name":"15.10.2.9 AtomEscape"},{"section":"x15.10.2.10","name":"15.10.2.10 CharacterEscape"},{"section":"x15.10.2.11","name":"15.10.2.11 DecimalEscape"},{"section":"x15.10.2.12","name":"15.10.2.12 CharacterClassEscape"},{"section":"x15.10.2.13","name":"15.10.2.13 CharacterClass"},{"section":"x15.10.2.14","name":"15.10.2.14 ClassRanges"},{"section":"x15.10.2.15","name":"15.10.2.15 NonemptyClassRanges"},{"section":"x15.10.2.16","name":"15.10.2.16 NonemptyClassRangesNoDash"},{"section":"x15.10.2.17","name":"15.10.2.17 ClassAtom"},{"section":"x15.10.2.18","name":"15.10.2.18 ClassAtomNoDash"},{"section":"x15.10.2.19","name":"15.10.2.19 ClassEscape"},{"section":"x15.10.3","name":"15.10.3 The RegExp Constructor Called as a Function"},{"section":"x15.10.3.1","name":"15.10.3.1 RegExp(pattern, flags)"},{"section":"x15.10.4","name":"15.10.4 The RegExp Constructor"},{"section":"x15.10.4.1","name":"15.10.4.1 new RegExp(pattern, flags)"},{"section":"x15.10.5","name":"15.10.5 Properties of the RegExp Constructor"},{"section":"x15.10.5.1","name":"15.10.5.1 RegExp.prototype"},{"section":"x15.10.6","name":"15.10.6 Properties of the RegExp Prototype Object"},{"section":"x15.10.6.1","name":"15.10.6.1 RegExp.prototype.constructor"},{"section":"x15.10.6.2","name":"15.10.6.2 RegExp.prototype.exec(string)"},{"section":"x15.10.6.3","name":"15.10.6.3 RegExp.prototype.test(string)"},{"section":"x15.10.6.4","name":"15.10.6.4 RegExp.prototype.toString()"},{"section":"x15.10.7","name":"15.10.7 Properties of RegExp Instances"},{"section":"x15.10.7.1","name":"15.10.7.1 source"},{"section":"x15.10.7.2","name":"15.10.7.2 global"},{"section":"x15.10.7.3","name":"15.10.7.3 ignoreCase"},{"section":"x15.10.7.4","name":"15.10.7.4 multiline"},{"section":"x15.10.7.5","name":"15.10.7.5 lastIndex"},{"section":"x15.11","name":"15.11 Error Objects"},{"section":"x15.11.1","name":"15.11.1 The Error Constructor Called as a Function"},{"section":"x15.11.1.1","name":"15.11.1.1 Error (message)"},{"section":"x15.11.2","name":"15.11.2 The Error Constructor"},{"section":"x15.11.2.1","name":"15.11.2.1 new Error (message)"},{"section":"x15.11.3","name":"15.11.3 Properties of the Error Constructor"},{"section":"x15.11.3.1","name":"15.11.3.1 Error.prototype"},{"section":"x15.11.4","name":"15.11.4 Properties of the Error Prototype Object"},{"section":"x15.11.4.1","name":"15.11.4.1 Error.prototype.constructor"},{"section":"x15.11.4.2","name":"15.11.4.2 Error.prototype.name"},{"section":"x15.11.4.3","name":"15.11.4.3 Error.prototype.message"},{"section":"x15.11.4.4","name":"15.11.4.4 Error.prototype.toString ( )"},{"section":"x15.11.5","name":"15.11.5 Properties of Error Instances"},{"section":"x15.11.6","name":"15.11.6 Native Error Types Used in This Standard"},{"section":"x15.11.6.1","name":"15.11.6.1 EvalError"},{"section":"x15.11.6.2","name":"15.11.6.2 RangeError"},{"section":"x15.11.6.3","name":"15.11.6.3 ReferenceError"},{"section":"x15.11.6.4","name":"15.11.6.4 SyntaxError"},{"section":"x15.11.6.5","name":"15.11.6.5 TypeError"},{"section":"x15.11.6.6","name":"15.11.6.6 URIError"},{"section":"x15.11.7","name":"15.11.7 NativeError Object Structure"},{"section":"x15.11.7.1","name":"15.11.7.1 NativeError Constructors Called as Functions"},{"section":"x15.11.7.2","name":"15.11.7.2 NativeError (message)"},{"section":"x15.11.7.3","name":"15.11.7.3 The NativeError Constructors"},{"section":"x15.11.7.4","name":"15.11.7.4 New NativeError (message)"},{"section":"x15.11.7.5","name":"15.11.7.5 Properties of the NativeError Constructors"},{"section":"x15.11.7.6","name":"15.11.7.6 NativeError.prototype"},{"section":"x15.11.7.7","name":"15.11.7.7 Properties of the NativeError Prototype Objects"},{"section":"x15.11.7.8","name":"15.11.7.8 NativeError.prototype.constructor"},{"section":"x15.11.7.9","name":"15.11.7.9 NativeError.prototype.name"},{"section":"x15.11.7.10","name":"15.11.7.10 NativeError.prototype.message"},{"section":"x15.11.7.11","name":"15.11.7.11 Properties of NativeError Instances"},{"section":"x15.12","name":"15.12 The JSON Object"},{"section":"x15.12.1","name":"15.12.1 The JSON Grammar  "},{"section":"x15.12.1.1","name":"15.12.1.1 The JSON Lexical Grammar"},{"section":"x15.12.1.2","name":"15.12.1.2 The JSON Syntactic Grammar"},{"section":"x15.12.2","name":"15.12.2 parse ( text [ , reviver ] )"},{"section":"x15.12.3","name":"15.12.3 stringify ( value [ , replacer [ , space ] ] )"},{"section":"x16","name":"16 Errors"},{"section":"A","name":"Annex A (informative) Grammar Summary"},{"section":"A.1","name":"A.1 Lexical Grammar"},{"section":"A.2","name":"A.2 Number Conversions"},{"section":"A.3","name":"A.3 Expressions"},{"section":"A.4","name":"A.4 Statements"},{"section":"A.5","name":"A.5 Functions and Programs"},{"section":"A.6","name":"A.6 Universal Resource Identifier Character Classes"},{"section":"A.7","name":"A.7 Regular Expressions"},{"section":"A.8","name":"A.8 JSON"},{"section":"A.8.1","name":"A.8.1 JSON Lexical Grammar"},{"section":"A.8.2","name":"A.8.2 JSON Syntactic Grammar"},{"section":"B","name":"Annex B (informative) Compatibility"},{"section":"B.1","name":"B.1 Additional Syntax"},{"section":"B.1.1","name":"B.1.1 Numeric Literals"},{"section":"B.1.2","name":"B.1.2 String Literals"},{"section":"B.2","name":"B.2 Additional Properties"},{"section":"B.2.1","name":"B.2.1 escape (string)"},{"section":"B.2.2","name":"B.2.2 unescape (string)"},{"section":"B.2.3","name":"B.2.3 String.prototype.substr (start, length)"},{"section":"B.2.4","name":"B.2.4 Date.prototype.getYear ( )"},{"section":"B.2.5","name":"B.2.5 Date.prototype.setYear (year)"},{"section":"B.2.6","name":"B.2.6 Date.prototype.toGMTString ( )"},{"section":"C","name":"Annex C (informative) The Strict Mode of ECMAScript"},{"section":"D","name":"Annex D (informative) Corrections and Clarifications in the 5th Edition with Possible 3rd Edition Compatibility Impact"},{"section":"E","name":"Annex E (informative) Additions and Changes in the 5th Edition that Introduce Incompatibilities with the 3rd Edition"},{"section":"bibliography","name":"Bibliography"}];


function spec ( args ) {
	var lookup = args.content.toLowerCase(), matches;

	matches = specParts.filter( hasLookup ).map( mapLink );

	bot.log( matches, '/spec done' );
	if ( !matches.length ) {
		return args + ' not found in spec';
	}
	return matches.join( ', ' );

	function hasLookup ( obj ) {
		return obj.name.toLowerCase().indexOf( lookup ) > -1;
	}
	function mapLink ( obj ) {
		var name = args.escape( obj.name );
		return '[' + name + '](http://es5.github.com/#' + obj.section + ')';
	}
};

bot.addCommand({
	name : 'spec',
	fun : spec,
	permissions : {
		del : 'NONE'
	},
	description : 'Find a section in the ES5 spec'
});
}());

;
(function () {
var list = JSON.parse( localStorage.getItem('bot_todo') || '{}' ),

	userCache = Object.create( null );

var userlist = function ( usrid ) {
	if ( userCache[usrid] ) {
		return userCache[usrid];
	}

	var usr = list[ usrid ], toRemove = [];
	if ( !usr ) {
		usr = list[ usrid ] = [];
	}

	return userCache[ usrid ] = {
		get : function ( count ) {
			return usr.slice( count ).map(function ( item, idx ) {
				return '(' + (idx+1) + ')' + item;
			}).join( ', ' );
		},

		add : function ( item ) {
			usr.push( item );
			return true;
		},

		remove : function ( item ) {
			var idx = usr.indexOf( item );
			if ( idx === -1 ) {
				return false;
			}
			toRemove.push( idx );

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
			localStorage.bot_todo = JSON.stringify( list );
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

	//user wants to get n items, count is the first arg
	if ( action === 'get' ) {
		//if the user didn't provide an argument, the entire thing is returned
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
		'`add items` adds items to your todo list (make sure items ' +
			'with spaces are wrapped in quotes) ' +
		'`rem items|indices` removes items specified by indice or content'
});

}());

;
(function () {
"use strict";

var converters = {
	//temperatures
	// 1C = 32.8F = 274.15K
	C : function ( c ) {
		return {
			F : c * 1.8 + 32, // 9/5 = 1.8
			K : c + 273.15 };
	},
	F : function ( f ) {
		return {
			C : (f - 32) / 1.8,
			K : (f + 459.67) * 5 / 9 };
	},
	K : function ( k ) {
		if ( k < 0 ) {
			return null;
		}

		return {
			C : k - 273.15,
			F : k * 1.8 - 459.67 };
	},

	//lengths
	//1m = 3.2808(...)f
	m : function ( m ) {
		return {
			f : m * 3.280839895 };
	},
	f : function ( f ) {
		return {
			m : f / 3.28083989 };
	},

	//km: 1m = 1km * 1000
	km : function ( km ) {
		return converters.m( km * 1000 );
	},
	//millimeters: 1m = 1mm / 1000
	mm : function ( mm ) {
		return converters.m( mm / 1000 );
	},
	//inches: 1f = 1i / 12
	i : function ( i ) {
		return converters.f( i / 12 );
	},

	//angles
	d : function ( d ) {
		return {
			r : d * 180 / Math.PI };
	},
	r : function ( r ) {
		return {
			d : r * Math.PI / 180 };
	},

	//weights
	g : function ( g ) {
		return {
			lb : g * 0.0022 };
	},
	lb : function ( lb ) {
		return {
			g : lb * 453.592 };
	}
};
var alias = {};

/*
  (        #start number matching
   -?      #optional negative
   \d+     #the integer part of the number
   \.?     #optional dot for decimal portion
   \d*     #optional decimal portion
  )
  \s*      #optional whitespace, just 'cus
  (        #start unit matching
   [^\s]+  #the unit. we don't know anyhing about it, besides having no ws
  )
 */
var re = /(-?\d+\.?\d*)\s*([^\s]+)/;

//string is in the form of:
// <number><unit>
//note that units are case-sensitive: F is the temperature, f is the length
var convert = function ( inp ) {
	bot.log( inp, '/convert input' );
	if ( inp.toString() === 'list' ) {
		return listUnits().join( ', ' );
	}

	var parts = re.exec( inp ),
		number = Number( parts[1] ),
		unit = parts[ 2 ];
	bot.log( parts, '/convert broken' );

	if ( alias[unit] ) {
		unit = alias[ unit ];
	}
	if ( !converters[unit] ) {
		return 'Confuse converter with ' + unit + ', receive error message';
	}

	var res = converters[ unit ]( number );
	bot.log( res, '/console answer' );
	return Object.keys( res ).map( format ).join( ', ' );

	function format ( key ) {
		return res[ key ].maxDecimal( 4 ) + key;
	}
};

function listUnits () {
	return Object.keys( converters )
		.concat( Object.keys(alias) );
}

bot.addCommand({
	name : 'convert',
	fun : convert,
	permissions : {
		del : 'NONE'
	},
	description : 'Converts several units, case sensitive. ' +
		'`/convert <num><unit>` ' +
		'Pass in list for supported units `/convert list`'
});
}());

;
(function () {

var template = '[{display_name}]({link}) '          +
		'has {reputation} reputation, '             +
		'earned {reputation_change_day} rep today, '+
		'asked {question_count} questions, '        +
		'gave {answer_count} answers, '             +
		'for a q:a ratio of {ratio}.\n';

var extended_template = 'avg. rep/post: {avg_rep_post}, ' +
		'{gold} gold badges, ' +
		'{silver} silver badges and ' +
		'{bronze} bronze badges. ';

function stat ( msg, cb ) {
	var args = msg.parse(),
		id = args[ 0 ], extended = args[ 1 ] === 'extended';

	if ( !id ) {
		id = msg.get( 'user_id' );
	}
	else if ( !/^\d+$/.test(id) ) {
		id = msg.findUserid( id );
	}

	//~10% chance
	if ( Math.random() <= 0.1 ) {
		finish( 'That dude sucks' );
		return;
	}

	IO.jsonp({
		url : 'https://api.stackexchange.com/2.0/users/' + id,
		data : {
			site   : 'stackoverflow',
			filter :  '!G*klMsSp1IcBUKxXMwhRe8TaI(' //ugh, don't ask...
		},
		fun : done
	});

	function done ( resp ) {
		if ( resp.error_message ) {
			finish( resp.error_message );
			return;
		}

		var user = resp.items[ 0 ], res;

		if ( !user ) {
			res = 'User ' + id + ' not found';
		}
		else {
			res = handle_user_object( user, extended );
		}

		finish( res );
	}

	function finish ( res ) {
		if ( cb ) {
			cb( res );
		}
		else {
			msg.reply( res );
		}
	}
}

function handle_user_object ( user, extended ) {
	user = normalize_stats( user );

	var res = template.supplant( user );

	if ( extended ) {
		res += extended_template.supplant( calc_extended_stats(user) );
	}

	return res;
}

function normalize_stats ( stats ) {
	stats = Object.merge(
		{
			question_count        : 0,
			answer_count          : 0,
			reputation_change_day : 0
		},
		stats );

	//for teh lulz
	if ( !stats.question_count && stats.answer_count ) {
		stats.ratio = "H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ";
	}
	else if ( !stats.answer_count && stats.question_count ) {
		stats.ratio = "TO͇̹̺ͅƝ̴ȳ̳ TH̘Ë͖́̉ ͠P̯͍̭O̚​N̐Y̡";
	}
	else if ( !stats.answer_count && !stats.question_count ) {
		stats.ratio = 'http://www.imgzzz.com/i/image_1294737413.png';
	}
	else {
		stats.ratio = Math.ratio( stats.question_count, stats.answer_count );
	}

	console.log( stats, '/stat normalized' );
	return stats;
}

function calc_extended_stats ( stats ) {
	stats = Object.merge( stats.badge_counts, stats );

	stats.avg_rep_post = stats.reputation
		/
		( stats.question_count + stats.answer_count );

	//1 / 0 === Infinity
	if ( stats.avg_rep_post === Infinity ) {
		stats.avg_rep_post = 'T͎͍̘͙̖̤̉̌̇̅ͯ͋͢͜͝H̖͙̗̗̺͚̱͕̒́͟E̫̺̯͖͎̗̒͑̅̈ ̈ͮ̽ͯ̆̋́͏͙͓͓͇̹<̩̟̳̫̪̇ͩ̑̆͗̽̇͆́ͅC̬͎ͪͩ̓̑͊ͮͪ̄̚̕Ě̯̰̤̗̜̗͓͛͝N̶̴̞͇̟̲̪̅̓ͯͅT͍̯̰͓̬͚̅͆̄E̠͇͇̬̬͕͖ͨ̔̓͞R͚̠̻̲̗̹̀>̇̏ͣ҉̳̖̟̫͕ ̧̛͈͙͇͂̓̚͡C͈̞̻̩̯̠̻ͥ̆͐̄ͦ́̀͟A̛̪̫͙̺̱̥̞̙ͦͧ̽͛̈́ͯ̅̍N̦̭͕̹̤͓͙̲̑͋̾͊ͣŅ̜̝͌͟O̡̝͍͚̲̝ͣ̔́͝Ť͈͢ ̪̘̳͔̂̒̋ͭ͆̽͠H̢͈̤͚̬̪̭͗ͧͬ̈́̈̀͌͒͡Ơ̮͍͇̝̰͍͚͖̿ͮ̀̍́L͐̆ͨ̏̎͡҉̧̱̯̤̹͓̗̻̭ͅḐ̲̰͙͑̂̒̐́̊';
	}

	console.log( stats, '/stat extended' );
	return stats;
}

bot.addCommand({
	name : 'stat',
	fun : stat,
	permissions : {
		del : 'NONE'
	},

	description : 'Gives useless stats on a user. `/stat usrid|usrname`',
	async : true
});

}());


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

;
(function () {
//TODO: maybe move this somewhere else?
function google ( args, cb ) {
	IO.jsonp.google( args.toString(), finishCall );

	function finishCall ( resp ) {
		bot.log( resp, '/google response' );
		if ( resp.responseStatus !== 200 ) {
			finish( 'My Google-Fu is on vacation; status ' +
					resp.responseStatus );
			return;
		}

		//TODO: change hard limit to argument
		var results = resp.responseData.results.slice( 0, 3 );
		bot.log( results, '/google results' );
		finish(
			results.map( format ).join( ' ; ' ) );

		function format ( result ) {
			var title = decodeURIComponent( result.titleNoFormatting )
			return args.link( title, result.url );
		}
	}

	function finish ( res ) {
		bot.log( res, '/google final' );
		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.reply( res );
		}
	}
}

bot.addCommand({
	name : 'google',
	fun  : google,
	permissions : {
		del : 'NONE'
	},
	description : 'Search Google. `/google query`',
	async : true
});
}());

;
(function () {
var help_message = 'Fetches and beautifies a message containing html, ' +
		'css or js. `/beautify msgid [lang=js]`';

function beautifyMsg ( msg ) {
	var args = msg.parse(),
		id = args.shift(),
		lang = args.shift() || 'js';

	lang = lang.toLowerCase();

	console.log( id, lang, '/beautify input' );

	if ( ['html', 'css', 'js'].indexOf(lang) < 0 ) {
		return help_message;
	}

	var mormons = {
		js   : js_beautify,
		css  : css_beautify,
		html : style_html
	};

	var containing_message = fetch_message( id, msg );
	if ( !containing_message ) {
		return '404 Message ' + id + ' Not Found';
	}
	var code = containing_message
			.getElementsByClassName( 'content' )[ 0 ].textContent;

	console.log( code, '/beautify beautifying' );

	msg.respond(
		msg.codify( mormons[lang](code) )
	);
}

function fetch_message ( id, msg ) {
	if ( !/^\d+$/.test(id) ) {
		console.log( id, '/beautify fetch_message' );
		return fetch_last_message( msg.findUserid(id) );
	}

	return document.getElementById( 'message-' + id );
}

function fetch_last_message ( usrid ) {
	var last_monologue = [].filter.call(
		document.getElementsByClassName( 'user-' + usrid ),
		class_test
	).pop();

	if ( !last_monologue ) {
		return undefined;
	}

	return [].pop.call(
		last_monologue.getElementsByClassName( 'message' )
	);

	function class_test ( elem ) {
		return /\bmonologue\b/.test( elem.className )
	}
}

bot.addCommand({
	name : 'beautify',
	fun  : beautifyMsg,
	permission : {
		del : 'NONE'
	},

	description : help_message,
});

}());


/*jslint onevar: false, plusplus: false */
/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einar@jsbeautifier.org>
	  http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>
  "End braces on own line" added by Chris J. Shull, <chrisjshull@gmail.com>

  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
	js_beautify(js_source_text);
	js_beautify(js_source_text, options);

  The options are:
	indent_size (default 4)          - indentation size,
	indent_char (default space)      - character to indent with,
	preserve_newlines (default true) - whether existing line breaks should be preserved,
	preserve_max_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,

	jslint_happy (default false) - if true, then jslint-stricter mode is enforced.

			jslint_happy   !jslint_happy
			---------------------------------
			 function ()      function()

	brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "expand-strict"
			put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.

			expand-strict: put brace on own line even in such cases:

				var a =
				{
					a: 5,
					b: 6
				}
			This mode may break your scripts - e.g "return { a: 1 }" will be broken into two lines, so beware.

	space_before_conditional (default true) - should the space before conditional statement be added, "if(true)" vs "if (true)",

	unescape_strings (default false) - should printable characters in strings encoded in \xNN notation be unescaped, "example" vs "\x65\x78\x61\x6d\x70\x6c\x65"

	e.g

	js_beautify(js_source_text, {
	  'indent_size': 1,
	  'indent_char': '\t'
	});


*/



function js_beautify(js_source_text, options) {

	var input, output, token_text, last_type, last_text, last_last_text, last_word, flags, flag_store, indent_string;
	var whitespace, wordchar, punct, parser_pos, line_starters, digits;
	var prefix, token_type, do_block_just_closed;
	var wanted_newline, just_added_newline, n_newlines;
	var preindent_string = '';


	// Some interpreters have unexpected results with foo = baz || bar;
	options = options ? options : {};

	var opt_brace_style;

	// compatibility
	if (options.space_after_anon_function !== undefined && options.jslint_happy === undefined) {
		options.jslint_happy = options.space_after_anon_function;
	}
	if (options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
		opt_brace_style = options.braces_on_own_line ? "expand" : "collapse";
	}
	opt_brace_style = options.brace_style ? options.brace_style : (opt_brace_style ? opt_brace_style : "collapse");


	var opt_indent_size = options.indent_size ? options.indent_size : 4;
	var opt_indent_char = options.indent_char ? options.indent_char : ' ';
	var opt_preserve_newlines = typeof options.preserve_newlines === 'undefined' ? true : options.preserve_newlines;
	var opt_max_preserve_newlines = typeof options.max_preserve_newlines === 'undefined' ? false : options.max_preserve_newlines;
	var opt_jslint_happy = options.jslint_happy === 'undefined' ? false : options.jslint_happy;
	var opt_keep_array_indentation = typeof options.keep_array_indentation === 'undefined' ? false : options.keep_array_indentation;
	var opt_space_before_conditional = typeof options.space_before_conditional === 'undefined' ? true : options.space_before_conditional;
	var opt_indent_case = typeof options.indent_case === 'undefined' ? false : options.indent_case;
	var opt_unescape_strings = typeof options.unescape_strings === 'undefined' ? false : options.unescape_strings;

	just_added_newline = false;

	// cache the source's length.
	var input_length = js_source_text.length;

	function trim_output(eat_newlines) {
		eat_newlines = typeof eat_newlines === 'undefined' ? false : eat_newlines;
		while (output.length && (output[output.length - 1] === ' '
			|| output[output.length - 1] === indent_string
			|| output[output.length - 1] === preindent_string
			|| (eat_newlines && (output[output.length - 1] === '\n' || output[output.length - 1] === '\r')))) {
			output.pop();
		}
	}

	function trim(s) {
		return s.replace(/^\s\s*|\s\s*$/, '');
	}

	// we could use just string.split, but
	// IE doesn't like returning empty strings
	function split_newlines(s) {
		//return s.split(/\x0d\x0a|\x0a/);

		s = s.replace(/\x0d/g, '');
		var out = [],
			idx = s.indexOf("\n");
		while (idx !== -1) {
			out.push(s.substring(0, idx));
			s = s.substring(idx + 1);
			idx = s.indexOf("\n");
		}
		if (s.length) {
			out.push(s);
		}
		return out;
	}

	function force_newline() {
		var old_keep_array_indentation = opt_keep_array_indentation;
		opt_keep_array_indentation = false;
		print_newline();
		opt_keep_array_indentation = old_keep_array_indentation;
	}

	function print_newline(ignore_repeated) {

		flags.eat_next_space = false;
		if (opt_keep_array_indentation && is_array(flags.mode)) {
			return;
		}

		ignore_repeated = typeof ignore_repeated === 'undefined' ? true : ignore_repeated;

		flags.if_line = false;
		trim_output();

		if (!output.length) {
			return; // no newline on start of file
		}

		if (output[output.length - 1] !== "\n" || !ignore_repeated) {
			just_added_newline = true;
			output.push("\n");
		}
		if (preindent_string) {
			output.push(preindent_string);
		}
		for (var i = 0; i < flags.indentation_level; i += 1) {
			output.push(indent_string);
		}
		if (flags.var_line && flags.var_line_reindented) {
			output.push(indent_string); // skip space-stuffing, if indenting with a tab
		}
		if (flags.case_body) {
			output.push(indent_string);
		}
	}



	function print_single_space() {

		if (last_type === 'TK_COMMENT') {
			return print_newline();
		}
		if (flags.eat_next_space) {
			flags.eat_next_space = false;
			return;
		}
		var last_output = ' ';
		if (output.length) {
			last_output = output[output.length - 1];
		}
		if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
			output.push(' ');
		}
	}


	function print_token() {
		just_added_newline = false;
		flags.eat_next_space = false;
		output.push(token_text);
	}

	function indent() {
		flags.indentation_level += 1;
	}


	function remove_indent() {
		if (output.length && output[output.length - 1] === indent_string) {
			output.pop();
		}
	}

	function set_mode(mode) {
		if (flags) {
			flag_store.push(flags);
		}
		flags = {
			previous_mode: flags ? flags.mode : 'BLOCK',
			mode: mode,
			var_line: false,
			var_line_tainted: false,
			var_line_reindented: false,
			in_html_comment: false,
			if_line: false,
			in_case_statement: false, // switch(..){ INSIDE HERE }
			in_case: false, // we're on the exact line with "case 0:"
			case_body: false, // the indented case-action block
			eat_next_space: false,
			indentation_baseline: -1,
			indentation_level: (flags ? flags.indentation_level + (flags.case_body ? 1 : 0) + ((flags.var_line && flags.var_line_reindented) ? 1 : 0) : 0),
			ternary_depth: 0
		};
	}

	function is_array(mode) {
		return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]';
	}

	function is_expression(mode) {
		return in_array(mode, ['[EXPRESSION]', '(EXPRESSION)', '(FOR-EXPRESSION)', '(COND-EXPRESSION)']);
	}

	function restore_mode() {
		do_block_just_closed = flags.mode === 'DO_BLOCK';
		if (flag_store.length > 0) {
			var mode = flags.mode;
			flags = flag_store.pop();
			flags.previous_mode = mode;
		}
	}

	function all_lines_start_with(lines, c) {
		for (var i = 0; i < lines.length; i++) {
			var line = trim(lines[i]);
			if (line.charAt(0) !== c) {
				return false;
			}
		}
		return true;
	}

	function is_special_word(word) {
		return in_array(word, ['case', 'return', 'do', 'if', 'throw', 'else']);
	}

	function in_array(what, arr) {
		for (var i = 0; i < arr.length; i += 1) {
			if (arr[i] === what) {
				return true;
			}
		}
		return false;
	}

	function look_up(exclude) {
		var local_pos = parser_pos;
		var c = input.charAt(local_pos);
		while (in_array(c, whitespace) && c !== exclude) {
			local_pos++;
			if (local_pos >= input_length) {
				return 0;
			}
			c = input.charAt(local_pos);
		}
		return c;
	}

	function get_next_token() {
		var i;
		var resulting_string;

		n_newlines = 0;

		if (parser_pos >= input_length) {
			return ['', 'TK_EOF'];
		}

		wanted_newline = false;

		var c = input.charAt(parser_pos);
		parser_pos += 1;


		var keep_whitespace = opt_keep_array_indentation && is_array(flags.mode);

		if (keep_whitespace) {

			//
			// slight mess to allow nice preservation of array indentation and reindent that correctly
			// first time when we get to the arrays:
			// var a = [
			// ....'something'
			// we make note of whitespace_count = 4 into flags.indentation_baseline
			// so we know that 4 whitespaces in original source match indent_level of reindented source
			//
			// and afterwards, when we get to
			//    'something,
			// .......'something else'
			// we know that this should be indented to indent_level + (7 - indentation_baseline) spaces
			//
			var whitespace_count = 0;

			while (in_array(c, whitespace)) {

				if (c === "\n") {
					trim_output();
					output.push("\n");
					just_added_newline = true;
					whitespace_count = 0;
				} else {
					if (c === '\t') {
						whitespace_count += 4;
					} else if (c === '\r') {
						// nothing
					} else {
						whitespace_count += 1;
					}
				}

				if (parser_pos >= input_length) {
					return ['', 'TK_EOF'];
				}

				c = input.charAt(parser_pos);
				parser_pos += 1;

			}
			if (flags.indentation_baseline === -1) {
				flags.indentation_baseline = whitespace_count;
			}

			if (just_added_newline) {
				for (i = 0; i < flags.indentation_level + 1; i += 1) {
					output.push(indent_string);
				}
				if (flags.indentation_baseline !== -1) {
					for (i = 0; i < whitespace_count - flags.indentation_baseline; i++) {
						output.push(' ');
					}
				}
			}

		} else {
			while (in_array(c, whitespace)) {

				if (c === "\n") {
					n_newlines += ((opt_max_preserve_newlines) ? (n_newlines <= opt_max_preserve_newlines) ? 1 : 0 : 1);
				}


				if (parser_pos >= input_length) {
					return ['', 'TK_EOF'];
				}

				c = input.charAt(parser_pos);
				parser_pos += 1;

			}

			if (opt_preserve_newlines) {
				if (n_newlines > 1) {
					for (i = 0; i < n_newlines; i += 1) {
						print_newline(i === 0);
						just_added_newline = true;
					}
				}
			}
			wanted_newline = n_newlines > 0;
		}


		if (in_array(c, wordchar)) {
			if (parser_pos < input_length) {
				while (in_array(input.charAt(parser_pos), wordchar)) {
					c += input.charAt(parser_pos);
					parser_pos += 1;
					if (parser_pos === input_length) {
						break;
					}
				}
			}

			// small and surprisingly unugly hack for 1E-10 representation
			if (parser_pos !== input_length && c.match(/^[0-9]+[Ee]$/) && (input.charAt(parser_pos) === '-' || input.charAt(parser_pos) === '+')) {

				var sign = input.charAt(parser_pos);
				parser_pos += 1;

				var t = get_next_token();
				c += sign + t[0];
				return [c, 'TK_WORD'];
			}

			if (c === 'in') { // hack for 'in' operator
				return [c, 'TK_OPERATOR'];
			}
			if (wanted_newline && last_type !== 'TK_OPERATOR'
				&& last_type !== 'TK_EQUALS'
				&& !flags.if_line && (opt_preserve_newlines || last_text !== 'var')) {
				print_newline();
			}
			return [c, 'TK_WORD'];
		}

		if (c === '(' || c === '[') {
			return [c, 'TK_START_EXPR'];
		}

		if (c === ')' || c === ']') {
			return [c, 'TK_END_EXPR'];
		}

		if (c === '{') {
			return [c, 'TK_START_BLOCK'];
		}

		if (c === '}') {
			return [c, 'TK_END_BLOCK'];
		}

		if (c === ';') {
			return [c, 'TK_SEMICOLON'];
		}

		if (c === '/') {
			var comment = '';
			// peek for comment /* ... */
			var inline_comment = true;
			if (input.charAt(parser_pos) === '*') {
				parser_pos += 1;
				if (parser_pos < input_length) {
					while (parser_pos < input_length &&
						! (input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/')) {
						c = input.charAt(parser_pos);
						comment += c;
						if (c === "\n" || c === "\r") {
							inline_comment = false;
						}
						parser_pos += 1;
						if (parser_pos >= input_length) {
							break;
						}
					}
				}
				parser_pos += 2;
				if (inline_comment && n_newlines === 0) {
					return ['/*' + comment + '*/', 'TK_INLINE_COMMENT'];
				} else {
					return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
				}
			}
			// peek for comment // ...
			if (input.charAt(parser_pos) === '/') {
				comment = c;
				while (input.charAt(parser_pos) !== '\r' && input.charAt(parser_pos) !== '\n') {
					comment += input.charAt(parser_pos);
					parser_pos += 1;
					if (parser_pos >= input_length) {
						break;
					}
				}
				if (wanted_newline) {
					print_newline();
				}
				return [comment, 'TK_COMMENT'];
			}

		}

		if (c === "'" || // string
		c === '"' || // string
		(c === '/' &&
			((last_type === 'TK_WORD' && is_special_word(last_text)) ||
				(last_text === ')' && in_array(flags.previous_mode, ['(COND-EXPRESSION)', '(FOR-EXPRESSION)'])) ||
				(last_type === 'TK_COMMA' || last_type === 'TK_COMMENT' || last_type === 'TK_START_EXPR' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EQUALS' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
			var sep = c;
			var esc = false;
			var esc1 = 0;
			var esc2 = 0;
			resulting_string = c;

			if (parser_pos < input_length) {
				if (sep === '/') {
					//
					// handle regexp separately...
					//
					var in_char_class = false;
					while (esc || in_char_class || input.charAt(parser_pos) !== sep) {
						resulting_string += input.charAt(parser_pos);
						if (!esc) {
							esc = input.charAt(parser_pos) === '\\';
							if (input.charAt(parser_pos) === '[') {
								in_char_class = true;
							} else if (input.charAt(parser_pos) === ']') {
								in_char_class = false;
							}
						} else {
							esc = false;
						}
						parser_pos += 1;
						if (parser_pos >= input_length) {
							// incomplete string/rexp when end-of-file reached.
							// bail out with what had been received so far.
							return [resulting_string, 'TK_STRING'];
						}
					}

				} else {
					//
					// and handle string also separately
					//
					while (esc || input.charAt(parser_pos) !== sep) {
						resulting_string += input.charAt(parser_pos);
						if (esc1 && esc1 >= esc2) {
							esc1 = parseInt(resulting_string.substr(-esc2), 16);
							if (esc1 && esc1 >= 0x20 && esc1 <= 0x7e) {
								esc1 = String.fromCharCode(esc1);
								resulting_string = resulting_string.substr(0, resulting_string.length - esc2 - 2) + (((esc1 === sep) || (esc1 === '\\')) ? '\\' : '') + esc1;
							}
							esc1 = 0;
						}
						if (esc1) {
							esc1++;
						} else if (!esc) {
							esc = input.charAt(parser_pos) === '\\';
						} else {
							esc = false;
							if (opt_unescape_strings) {
								if (input.charAt(parser_pos) === 'x') {
									esc1++;
									esc2 = 2;
								} else if (input.charAt(parser_pos) === 'u') {
									esc1++;
									esc2 = 4;
								}
							}
						}
						parser_pos += 1;
						if (parser_pos >= input_length) {
							// incomplete string/rexp when end-of-file reached.
							// bail out with what had been received so far.
							return [resulting_string, 'TK_STRING'];
						}
					}
				}



			}

			parser_pos += 1;

			resulting_string += sep;

			if (sep === '/') {
				// regexps may have modifiers /regexp/MOD , so fetch those, too
				while (parser_pos < input_length && in_array(input.charAt(parser_pos), wordchar)) {
					resulting_string += input.charAt(parser_pos);
					parser_pos += 1;
				}
			}
			return [resulting_string, 'TK_STRING'];
		}

		if (c === '#') {


			if (output.length === 0 && input.charAt(parser_pos) === '!') {
				// shebang
				resulting_string = c;
				while (parser_pos < input_length && c !== '\n') {
					c = input.charAt(parser_pos);
					resulting_string += c;
					parser_pos += 1;
				}
				output.push(trim(resulting_string) + '\n');
				print_newline();
				return get_next_token();
			}



			// Spidermonkey-specific sharp variables for circular references
			// https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
			// http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
			var sharp = '#';
			if (parser_pos < input_length && in_array(input.charAt(parser_pos), digits)) {
				do {
					c = input.charAt(parser_pos);
					sharp += c;
					parser_pos += 1;
				} while (parser_pos < input_length && c !== '#' && c !== '=');
				if (c === '#') {
					//
				} else if (input.charAt(parser_pos) === '[' && input.charAt(parser_pos + 1) === ']') {
					sharp += '[]';
					parser_pos += 2;
				} else if (input.charAt(parser_pos) === '{' && input.charAt(parser_pos + 1) === '}') {
					sharp += '{}';
					parser_pos += 2;
				}
				return [sharp, 'TK_WORD'];
			}
		}

		if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
			parser_pos += 3;
			c = '<!--';
			while (input.charAt(parser_pos) !== '\n' && parser_pos < input_length) {
				c += input.charAt(parser_pos);
				parser_pos++;
			}
			flags.in_html_comment = true;
			return [c, 'TK_COMMENT'];
		}

		if (c === '-' && flags.in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
			flags.in_html_comment = false;
			parser_pos += 2;
			if (wanted_newline) {
				print_newline();
			}
			return ['-->', 'TK_COMMENT'];
		}

		if (in_array(c, punct)) {
			while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
				c += input.charAt(parser_pos);
				parser_pos += 1;
				if (parser_pos >= input_length) {
					break;
				}
			}

			if (c === ',') {
				return [c, 'TK_COMMA'];
			} else if (c === '=') {
				return [c, 'TK_EQUALS'];
			} else {
				return [c, 'TK_OPERATOR'];
			}
		}

		return [c, 'TK_UNKNOWN'];
	}

	//----------------------------------
	indent_string = '';
	while (opt_indent_size > 0) {
		indent_string += opt_indent_char;
		opt_indent_size -= 1;
	}

	while (js_source_text && (js_source_text.charAt(0) === ' ' || js_source_text.charAt(0) === '\t')) {
		preindent_string += js_source_text.charAt(0);
		js_source_text = js_source_text.substring(1);
	}
	input = js_source_text;

	last_word = ''; // last 'TK_WORD' passed
	last_type = 'TK_START_EXPR'; // last token type
	last_text = ''; // last token text
	last_last_text = ''; // pre-last token text
	output = [];

	do_block_just_closed = false;

	whitespace = "\n\r\t ".split('');
	wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
	digits = '0123456789'.split('');

	punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::';
	punct += ' <%= <% %> <?= <? ?>'; // try to be a good boy and try not to break the markup language identifiers
	punct = punct.split(' ');

	// words which should always start on new line.
	line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

	// states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
	// some formatting depends on that.
	flag_store = [];
	set_mode('BLOCK');

	parser_pos = 0;
	while (true) {
		var t = get_next_token();
		token_text = t[0];
		token_type = t[1];
		if (token_type === 'TK_EOF') {
			break;
		}

		switch (token_type) {

		case 'TK_START_EXPR':

			if (token_text === '[') {

				if (last_type === 'TK_WORD' || last_text === ')') {
					// this is array index specifier, break immediately
					// a[x], fn()[x]
					if (in_array(last_text, line_starters)) {
						print_single_space();
					}
					set_mode('(EXPRESSION)');
					print_token();
					break;
				}

				if (flags.mode === '[EXPRESSION]' || flags.mode === '[INDENTED-EXPRESSION]') {
					if (last_last_text === ']' && last_text === ',') {
						// ], [ goes to new line
						if (flags.mode === '[EXPRESSION]') {
							flags.mode = '[INDENTED-EXPRESSION]';
							if (!opt_keep_array_indentation) {
								indent();
							}
						}
						set_mode('[EXPRESSION]');
						if (!opt_keep_array_indentation) {
							print_newline();
						}
					} else if (last_text === '[') {
						if (flags.mode === '[EXPRESSION]') {
							flags.mode = '[INDENTED-EXPRESSION]';
							if (!opt_keep_array_indentation) {
								indent();
							}
						}
						set_mode('[EXPRESSION]');

						if (!opt_keep_array_indentation) {
							print_newline();
						}
					} else {
						set_mode('[EXPRESSION]');
					}
				} else {
					set_mode('[EXPRESSION]');
				}



			} else {
				if (last_word === 'for') {
					set_mode('(FOR-EXPRESSION)');
				} else if (in_array(last_word, ['if', 'while'])) {
					set_mode('(COND-EXPRESSION)');
				} else {
					set_mode('(EXPRESSION)');
				}
			}

			if (last_text === ';' || last_type === 'TK_START_BLOCK') {
				print_newline();
			} else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_text === '.') {
				if (wanted_newline) {
					print_newline();
				}
				// do nothing on (( and )( and ][ and ]( and .(
			} else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
				print_single_space();
			} else if (last_word === 'function' || last_word === 'typeof') {
				// function() vs function ()
				if (opt_jslint_happy) {
					print_single_space();
				}
			} else if (in_array(last_text, line_starters) || last_text === 'catch') {
				if (opt_space_before_conditional) {
					print_single_space();
				}
			}
			print_token();

			break;

		case 'TK_END_EXPR':
			if (token_text === ']') {
				if (opt_keep_array_indentation) {
					if (last_text === '}') {
						// trim_output();
						// print_newline(true);
						remove_indent();
						print_token();
						restore_mode();
						break;
					}
				} else {
					if (flags.mode === '[INDENTED-EXPRESSION]') {
						if (last_text === ']') {
							restore_mode();
							print_newline();
							print_token();
							break;
						}
					}
				}
			}
			restore_mode();
			print_token();
			break;

		case 'TK_START_BLOCK':

			if (last_word === 'do') {
				set_mode('DO_BLOCK');
			} else {
				set_mode('BLOCK');
			}
			if (opt_brace_style === "expand" || opt_brace_style === "expand-strict") {
				var empty_braces = false;
				if (opt_brace_style === "expand-strict") {
					empty_braces = (look_up() === '}');
					if (!empty_braces) {
						print_newline(true);
					}
				} else {
					if (last_type !== 'TK_OPERATOR') {
						if (last_text === '=' || (is_special_word(last_text) && last_text !== 'else')) {
							print_single_space();
						} else {
							print_newline(true);
						}
					}
				}
				print_token();
				if (!empty_braces) {
					indent();
				}
			} else {
				if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
					if (last_type === 'TK_START_BLOCK') {
						print_newline();
					} else {
						print_single_space();
					}
				} else {
					// if TK_OPERATOR or TK_START_EXPR
					if (is_array(flags.previous_mode) && last_text === ',') {
						if (last_last_text === '}') {
							// }, { in array context
							print_single_space();
						} else {
							print_newline(); // [a, b, c, {
						}
					}
				}
				indent();
				print_token();
			}

			break;

		case 'TK_END_BLOCK':
			restore_mode();
			if (opt_brace_style === "expand" || opt_brace_style === "expand-strict") {
				if (last_text !== '{') {
					print_newline();
				}
				print_token();
			} else {
				if (last_type === 'TK_START_BLOCK') {
					// nothing
					if (just_added_newline) {
						remove_indent();
					} else {
						// {}
						trim_output();
					}
				} else {
					if (is_array(flags.mode) && opt_keep_array_indentation) {
						// we REALLY need a newline here, but newliner would skip that
						opt_keep_array_indentation = false;
						print_newline();
						opt_keep_array_indentation = true;

					} else {
						print_newline();
					}
				}
				print_token();
			}
			break;

		case 'TK_WORD':

			// no, it's not you. even I have problems understanding how this works
			// and what does what.
			if (do_block_just_closed) {
				// do {} ## while ()
				print_single_space();
				print_token();
				print_single_space();
				do_block_just_closed = false;
				break;
			}

			prefix = 'NONE';

			if (token_text === 'function') {
				if (flags.var_line && last_type !== 'TK_EQUALS' ) {
					flags.var_line_reindented = true;
				}
				if ((just_added_newline || last_text === ';') && last_text !== '{'
				&& last_type !== 'TK_BLOCK_COMMENT' && last_type !== 'TK_COMMENT') {
					// make sure there is a nice clean space of at least one blank line
					// before a new function definition
					n_newlines = just_added_newline ? n_newlines : 0;
					if (!opt_preserve_newlines) {
						n_newlines = 1;
					}

					for (var i = 0; i < 2 - n_newlines; i++) {
						print_newline(false);
					}
				}
				if (last_type === 'TK_WORD') {
					if (last_text === 'get' || last_text === 'set' || last_text === 'new' || last_text === 'return') {
						print_single_space();
					} else {
						print_newline();
					}
				} else if (last_type === 'TK_OPERATOR' || last_text === '=') {
					// foo = function
					print_single_space();
				} else if (is_expression(flags.mode)) {
						//ää print nothing
				} else {
					print_newline();
				}

				print_token();
				last_word = token_text;
				break;
			}

			if (token_text === 'case' || (token_text === 'default' && flags.in_case_statement)) {
				if (last_text === ':' || flags.case_body) {
					// switch cases following one another
					remove_indent();
				} else {
					// case statement starts in the same line where switch
					if (!opt_indent_case) {
						flags.indentation_level--;
					}
					print_newline();
					if (!opt_indent_case) {
						flags.indentation_level++;
					}
				}
				print_token();
				flags.in_case = true;
				flags.in_case_statement = true;
				flags.case_body = false;
				break;
			}

			if (last_type === 'TK_END_BLOCK') {

				if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
					prefix = 'NEWLINE';
				} else {
					if (opt_brace_style === "expand" || opt_brace_style === "end-expand" || opt_brace_style === "expand-strict") {
						prefix = 'NEWLINE';
					} else {
						prefix = 'SPACE';
						print_single_space();
					}
				}
			} else if (last_type === 'TK_SEMICOLON' && (flags.mode === 'BLOCK' || flags.mode === 'DO_BLOCK')) {
				prefix = 'NEWLINE';
			} else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
				prefix = 'SPACE';
			} else if (last_type === 'TK_STRING') {
				prefix = 'NEWLINE';
			} else if (last_type === 'TK_WORD') {
				if (last_text === 'else') {
					// eat newlines between ...else *** some_op...
					// won't preserve extra newlines in this place (if any), but don't care that much
					trim_output(true);
				}
				prefix = 'SPACE';
			} else if (last_type === 'TK_START_BLOCK') {
				prefix = 'NEWLINE';
			} else if (last_type === 'TK_END_EXPR') {
				print_single_space();
				prefix = 'NEWLINE';
			}

			if (in_array(token_text, line_starters) && last_text !== ')') {
				if (last_text === 'else') {
					prefix = 'SPACE';
				} else {
					prefix = 'NEWLINE';
				}

			}

			if (flags.if_line && last_type === 'TK_END_EXPR') {
				flags.if_line = false;
			}
			if (in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
				if (last_type !== 'TK_END_BLOCK' || opt_brace_style === "expand" || opt_brace_style === "end-expand" || opt_brace_style === "expand-strict") {
					print_newline();
				} else {
					trim_output(true);
					print_single_space();
				}
			} else if (prefix === 'NEWLINE') {
				if (is_special_word(last_text)) {
					// no newline between 'return nnn'
					print_single_space();
				} else if (last_type !== 'TK_END_EXPR') {
					if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
						// no need to force newline on 'var': for (var x = 0...)
						if (token_text === 'if' && last_word === 'else' && last_text !== '{') {
							// no newline for } else if {
							print_single_space();
						} else {
							flags.var_line = false;
							flags.var_line_reindented = false;
							print_newline();
						}
					}
				} else if (in_array(token_text, line_starters) && last_text !== ')') {
					flags.var_line = false;
					flags.var_line_reindented = false;
					print_newline();
				}
			} else if (is_array(flags.mode) && last_text === ',' && last_last_text === '}') {
				print_newline(); // }, in lists get a newline treatment
			} else if (prefix === 'SPACE') {
				print_single_space();
			}
			print_token();
			last_word = token_text;

			if (token_text === 'var') {
				flags.var_line = true;
				flags.var_line_reindented = false;
				flags.var_line_tainted = false;
			}

			if (token_text === 'if') {
				flags.if_line = true;
			}
			if (token_text === 'else') {
				flags.if_line = false;
			}

			break;

		case 'TK_SEMICOLON':

			print_token();
			flags.var_line = false;
			flags.var_line_reindented = false;
			if (flags.mode === 'OBJECT') {
				// OBJECT mode is weird and doesn't get reset too well.
				flags.mode = 'BLOCK';
			}
			break;

		case 'TK_STRING':

			if (last_type === 'TK_END_EXPR' && in_array(flags.previous_mode, ['(COND-EXPRESSION)', '(FOR-EXPRESSION)'])) {
				print_single_space();
			} else if (last_type === 'TK_COMMENT' || last_type === 'TK_STRING' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_SEMICOLON') {
				print_newline();
			} else if (last_type === 'TK_WORD') {
				print_single_space();
			}
			print_token();
			break;

		case 'TK_EQUALS':
			if (flags.var_line) {
				// just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
				flags.var_line_tainted = true;
			}
			print_single_space();
			print_token();
			print_single_space();
			break;

		case 'TK_COMMA':
			if (flags.var_line) {
				if (is_expression(flags.mode) || last_type === 'TK_END_BLOCK' ) {
					// do not break on comma, for(var a = 1, b = 2)
					flags.var_line_tainted = false;
				}
				if (flags.var_line_tainted) {
					print_token();
					flags.var_line_reindented = true;
					flags.var_line_tainted = false;
					print_newline();
					break;
				} else {
					flags.var_line_tainted = false;
				}

				print_token();
				print_single_space();
				break;
			}

			if (last_type === 'TK_COMMENT') {
				print_newline();
			}

			if (last_type === 'TK_END_BLOCK' && flags.mode !== "(EXPRESSION)") {
				print_token();
				if (flags.mode === 'OBJECT' && last_text === '}') {
					print_newline();
				} else {
					print_single_space();
				}
			} else {
				if (flags.mode === 'OBJECT') {
					print_token();
					print_newline();
				} else {
					// EXPR or DO_BLOCK
					print_token();
					print_single_space();
				}
			}
			break;


		case 'TK_OPERATOR':

			var space_before = true;
			var space_after = true;

			if (is_special_word(last_text)) {
				// "return" had a special handling in TK_WORD. Now we need to return the favor
				print_single_space();
				print_token();
				break;
			}

			// hack for actionscript's import .*;
			if (token_text === '*' && last_type === 'TK_UNKNOWN' && !last_last_text.match(/^\d+$/)) {
				print_token();
				break;
			}

			if (token_text === ':' && flags.in_case) {
				if (opt_indent_case) {
					flags.case_body = true;
				}
				print_token(); // colon really asks for separate treatment
				print_newline();
				flags.in_case = false;
				break;
			}

			if (token_text === '::') {
				// no spaces around exotic namespacing syntax operator
				print_token();
				break;
			}

			if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(last_text, line_starters)))) {
				// unary operators (and binary +/- pretending to be unary) special cases

				space_before = false;
				space_after = false;

				if (last_text === ';' && is_expression(flags.mode)) {
					// for (;; ++i)
					//        ^^^
					space_before = true;
				}
				if (last_type === 'TK_WORD' && in_array(last_text, line_starters)) {
					space_before = true;
				}

				if (flags.mode === 'BLOCK' && (last_text === '{' || last_text === ';')) {
					// { foo; --i }
					// foo(); --bar;
					print_newline();
				}
			} else if (token_text === '.') {
				// decimal digits or object.property
				space_before = false;

			} else if (token_text === ':') {
				if (flags.ternary_depth === 0) {
					if (flags.mode === 'BLOCK') {
						flags.mode = 'OBJECT';
					}
					space_before = false;
				} else {
					flags.ternary_depth -= 1;
				}
			} else if (token_text === '?') {
				flags.ternary_depth += 1;
			}
			if (space_before) {
				print_single_space();
			}

			print_token();

			if (space_after) {
				print_single_space();
			}

			break;

		case 'TK_BLOCK_COMMENT':

			var lines = split_newlines(token_text);
			var j; // iterator for this case

			if (all_lines_start_with(lines.slice(1), '*')) {
				// javadoc: reformat and reindent
				print_newline();
				output.push(lines[0]);
				for (j = 1; j < lines.length; j++) {
					print_newline();
					output.push(' ');
					output.push(trim(lines[j]));
				}

			} else {

				// simple block comment: leave intact
				if (lines.length > 1) {
					// multiline comment block starts with a new line
					print_newline();
				} else {
					// single-line /* comment */ stays where it is
					if (last_type === 'TK_END_BLOCK') {
						print_newline();
					} else {
						print_single_space();
					}

				}

				for (j = 0; j < lines.length; j++) {
					output.push(lines[j]);
					output.push("\n");
				}

			}
			if (look_up('\n') !== '\n') {
				print_newline();
			}
			break;

		case 'TK_INLINE_COMMENT':
			print_single_space();
			print_token();
			if (is_expression(flags.mode)) {
				print_single_space();
			} else {
				force_newline();
			}
			break;

		case 'TK_COMMENT':

			if (last_text === ',' && !wanted_newline) {
				trim_output(true);
			}
			if (last_type !== 'TK_COMMENT') {
				if (wanted_newline) {
					print_newline();
				} else {
					print_single_space();
				}
			}
			print_token();
			print_newline();
			break;

		case 'TK_UNKNOWN':
			if (is_special_word(last_text)) {
				print_single_space();
			}
			print_token();
			break;
		}

		last_last_text = last_text;
		last_type = token_type;
		last_text = token_text;
	}

	var sweet_code = preindent_string + output.join('').replace(/[\r\n ]+$/, '');
	return sweet_code;

}

// Add support for CommonJS. Just put this file somewhere on your require.paths
// and you will be able to `var js_beautify = require("beautify").js_beautify`.
if (typeof exports !== "undefined") {
	exports.js_beautify = js_beautify;
}


/*

 Style HTML
---------------

  Written by Nochum Sossonko, (nsossonko@hotmail.com)

  Based on code initially developed by: Einar Lielmanis, <elfz@laacz.lv>
	http://jsbeautifier.org/


  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
	style_html(html_source);

	style_html(html_source, options);

  The options are:
	indent_size (default 4)          — indentation size,
	indent_char (default space)      — character to indent with,
	max_char (default 70)            -  maximum amount of characters per line,
	brace_style (default "collapse") - "collapse" | "expand" | "end-expand"
			put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.
	unformatted (default ['a'])      - list of tags, that shouldn't be reformatted
	indent_scripts (default normal)  - "keep"|"separate"|"normal"

	e.g.

	style_html(html_source, {
	  'indent_size': 2,
	  'indent_char': ' ',
	  'max_char': 78,
	  'brace_style': 'expand',
	  'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u']
	});
*/

function style_html(html_source, options) {
//Wrapper function to invoke all the necessary constructors and deal with the output.

  var multi_parser,
	  indent_size,
	  indent_character,
	  max_char,
	  brace_style;

  options = options || {};
  indent_size = options.indent_size || 4;
  indent_character = options.indent_char || ' ';
  brace_style = options.brace_style || 'collapse';
  max_char = options.max_char == 0 ? Infinity : options.max_char || 70;
  unformatted = options.unformatted || ['a'];

  function Parser() {

	this.pos = 0; //Parser position
	this.token = '';
	this.current_mode = 'CONTENT'; //reflects the current Parser mode: TAG/CONTENT
	this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
	  parent: 'parent1',
	  parentcount: 1,
	  parent1: ''
	};
	this.tag_type = '';
	this.token_text = this.last_token = this.last_text = this.token_type = '';

	this.Utils = { //Uilities made available to the various functions
	  whitespace: "\n\r\t ".split(''),
	  single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed'.split(','), //all the single tags for HTML
	  extra_liners: 'head,body,/html'.split(','), //for tags that need a line of whitespace before them
	  in_array: function (what, arr) {
		for (var i=0; i<arr.length; i++) {
		  if (what === arr[i]) {
			return true;
		  }
		}
		return false;
	  }
	}

	this.get_content = function () { //function to capture regular content between tags

	  var input_char = '';
	  var content = [];
	  var space = false; //if a space is needed
	  while (this.input.charAt(this.pos) !== '<') {
		if (this.pos >= this.input.length) {
		  return content.length?content.join(''):['', 'TK_EOF'];
		}

		input_char = this.input.charAt(this.pos);
		this.pos++;
		this.line_char_count++;

		if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
		  if (content.length) {
			space = true;
		  }
		  this.line_char_count--;
		  continue; //don't want to insert unnecessary space
		}
		else if (space) {
		  if (this.line_char_count >= this.max_char) { //insert a line when the max_char is reached
			content.push('\n');
			for (var i=0; i<this.indent_level; i++) {
			  content.push(this.indent_string);
			}
			this.line_char_count = 0;
		  }
		  else{
			content.push(' ');
			this.line_char_count++;
		  }
		  space = false;
		}
		content.push(input_char); //letter at-a-time (or string) inserted to an array
	  }
	  return content.length?content.join(''):'';
	}

	this.get_contents_to = function (name) { //get the full content of a script or style to pass to js_beautify
	  if (this.pos == this.input.length) {
		return ['', 'TK_EOF'];
	  }
	  var input_char = '';
	  var content = '';
	  var reg_match = new RegExp('\<\/' + name + '\\s*\>', 'igm');
	  reg_match.lastIndex = this.pos;
	  var reg_array = reg_match.exec(this.input);
	  var end_script = reg_array?reg_array.index:this.input.length; //absolute end of script
	  if(this.pos < end_script) { //get everything in between the script tags
		content = this.input.substring(this.pos, end_script);
		this.pos = end_script;
	  }
	  return content;
	}

	this.record_tag = function (tag){ //function to record a tag and its parent in this.tags Object
	  if (this.tags[tag + 'count']) { //check for the existence of this tag type
		this.tags[tag + 'count']++;
		this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
	  }
	  else { //otherwise initialize this tag type
		this.tags[tag + 'count'] = 1;
		this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
	  }
	  this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
	  this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
	}

	this.retrieve_tag = function (tag) { //function to retrieve the opening tag to the corresponding closer
	  if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
		var temp_parent = this.tags.parent; //check to see if it's a closable tag.
		while (temp_parent) { //till we reach '' (the initial value);
		  if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
			break;
		  }
		  temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
		}
		if (temp_parent) { //if we caught something
		  this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
		  this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
		}
		delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
		delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
		if (this.tags[tag + 'count'] == 1) {
		  delete this.tags[tag + 'count'];
		}
		else {
		  this.tags[tag + 'count']--;
		}
	  }
	}

	this.get_tag = function () { //function to get a full tag and parse its type
	  var input_char = '';
	  var content = [];
	  var space = false;

	  do {
		if (this.pos >= this.input.length) {
		  return content.length?content.join(''):['', 'TK_EOF'];
		}

		input_char = this.input.charAt(this.pos);
		this.pos++;
		this.line_char_count++;

		if (this.Utils.in_array(input_char, this.Utils.whitespace)) { //don't want to insert unnecessary space
		  space = true;
		  this.line_char_count--;
		  continue;
		}

		if (input_char === "'" || input_char === '"') {
		  if (!content[1] || content[1] !== '!') { //if we're in a comment strings don't get treated specially
			input_char += this.get_unformatted(input_char);
			space = true;
		  }
		}

		if (input_char === '=') { //no space before =
		  space = false;
		}

		if (content.length && content[content.length-1] !== '=' && input_char !== '>'
			&& space) { //no space after = or before >
		  if (this.line_char_count >= this.max_char) {
			this.print_newline(false, content);
			this.line_char_count = 0;
		  }
		  else {
			content.push(' ');
			this.line_char_count++;
		  }
		  space = false;
		}
		content.push(input_char); //inserts character at-a-time (or string)
	  } while (input_char !== '>');

	  var tag_complete = content.join('');
	  var tag_index;
	  if (tag_complete.indexOf(' ') != -1) { //if there's whitespace, thats where the tag name ends
		tag_index = tag_complete.indexOf(' ');
	  }
	  else { //otherwise go with the tag ending
		tag_index = tag_complete.indexOf('>');
	  }
	  var tag_check = tag_complete.substring(1, tag_index).toLowerCase();
	  if (tag_complete.charAt(tag_complete.length-2) === '/' ||
		  this.Utils.in_array(tag_check, this.Utils.single_token)) { //if this tag name is a single tag type (either in the list or has a closing /)
		this.tag_type = 'SINGLE';
	  }
	  else if (tag_check === 'script') { //for later script handling
		this.record_tag(tag_check);
		this.tag_type = 'SCRIPT';
	  }
	  else if (tag_check === 'style') { //for future style handling (for now it justs uses get_content)
		this.record_tag(tag_check);
		this.tag_type = 'STYLE';
	  }
	  else if (this.Utils.in_array(tag_check, unformatted)) { // do not reformat the "unformatted" tags
		var comment = this.get_unformatted('</'+tag_check+'>', tag_complete); //...delegate to get_unformatted function
		content.push(comment);
		this.tag_type = 'SINGLE';
	  }
	  else if (tag_check.charAt(0) === '!') { //peek for <!-- comment
		if (tag_check.indexOf('[if') != -1) { //peek for <!--[if conditional comment
		  if (tag_complete.indexOf('!IE') != -1) { //this type needs a closing --> so...
			var comment = this.get_unformatted('-->', tag_complete); //...delegate to get_unformatted
			content.push(comment);
		  }
		  this.tag_type = 'START';
		}
		else if (tag_check.indexOf('[endif') != -1) {//peek for <!--[endif end conditional comment
		  this.tag_type = 'END';
		  this.unindent();
		}
		else if (tag_check.indexOf('[cdata[') != -1) { //if it's a <[cdata[ comment...
		  var comment = this.get_unformatted(']]>', tag_complete); //...delegate to get_unformatted function
		  content.push(comment);
		  this.tag_type = 'SINGLE'; //<![CDATA[ comments are treated like single tags
		}
		else {
		  var comment = this.get_unformatted('-->', tag_complete);
		  content.push(comment);
		  this.tag_type = 'SINGLE';
		}
	  }
	  else {
		if (tag_check.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
		  this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
		  this.tag_type = 'END';
		}
		else { //otherwise it's a start-tag
		  this.record_tag(tag_check); //push it on the tag stack
		  this.tag_type = 'START';
		}
		if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) { //check if this double needs an extra line
		  this.print_newline(true, this.output);
		}
	  }
	  return content.join(''); //returns fully formatted tag
	}

	this.get_unformatted = function (delimiter, orig_tag) { //function to return unformatted content in its entirety

	  if (orig_tag && orig_tag.indexOf(delimiter) != -1) {
		return '';
	  }
	  var input_char = '';
	  var content = '';
	  var space = true;
	  do {

		if (this.pos >= this.input.length) {
		  return content;
		}

		input_char = this.input.charAt(this.pos);
		this.pos++

		if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
		  if (!space) {
			this.line_char_count--;
			continue;
		  }
		  if (input_char === '\n' || input_char === '\r') {
			content += '\n';
			/*  Don't change tab indention for unformatted blocks.  If using code for html editing, this will greatly affect <pre> tags if they are specified in the 'unformatted array'
			for (var i=0; i<this.indent_level; i++) {
			  content += this.indent_string;
			}
			space = false; //...and make sure other indentation is erased
			*/
			this.line_char_count = 0;
			continue;
		  }
		}
		content += input_char;
		this.line_char_count++;
		space = true;


	  } while (content.indexOf(delimiter) == -1);
	  return content;
	}

	this.get_token = function () { //initial handler for token-retrieval
	  var token;

	  if (this.last_token === 'TK_TAG_SCRIPT' || this.last_token === 'TK_TAG_STYLE') { //check if we need to format javascript
	   var type = this.last_token.substr(7)
	   token = this.get_contents_to(type);
		if (typeof token !== 'string') {
		  return token;
		}
		return [token, 'TK_' + type];
	  }
	  if (this.current_mode === 'CONTENT') {
		token = this.get_content();
		if (typeof token !== 'string') {
		  return token;
		}
		else {
		  return [token, 'TK_CONTENT'];
		}
	  }

	  if (this.current_mode === 'TAG') {
		token = this.get_tag();
		if (typeof token !== 'string') {
		  return token;
		}
		else {
		  var tag_name_type = 'TK_TAG_' + this.tag_type;
		  return [token, tag_name_type];
		}
	  }
	}

	this.get_full_indent = function (level) {
	  level = this.indent_level + level || 0;
	  if (level < 1)
		return '';

	  return Array(level + 1).join(this.indent_string);
	}


	this.printer = function (js_source, indent_character, indent_size, max_char, brace_style) { //handles input/output and some other printing functions

	  this.input = js_source || ''; //gets the input for the Parser
	  this.output = [];
	  this.indent_character = indent_character;
	  this.indent_string = '';
	  this.indent_size = indent_size;
	  this.brace_style = brace_style;
	  this.indent_level = 0;
	  this.max_char = max_char;
	  this.line_char_count = 0; //count to see if max_char was exceeded

	  for (var i=0; i<this.indent_size; i++) {
		this.indent_string += this.indent_character;
	  }

	  this.print_newline = function (ignore, arr) {
		this.line_char_count = 0;
		if (!arr || !arr.length) {
		  return;
		}
		if (!ignore) { //we might want the extra line
		  while (this.Utils.in_array(arr[arr.length-1], this.Utils.whitespace)) {
			arr.pop();
		  }
		}
		arr.push('\n');
		for (var i=0; i<this.indent_level; i++) {
		  arr.push(this.indent_string);
		}
	  }

	  this.print_token = function (text) {
		this.output.push(text);
	  }

	  this.indent = function () {
		this.indent_level++;
	  }

	  this.unindent = function () {
		if (this.indent_level > 0) {
		  this.indent_level--;
		}
	  }
	}
	return this;
  }

  /*_____________________--------------------_____________________*/

  multi_parser = new Parser(); //wrapping functions Parser
  multi_parser.printer(html_source, indent_character, indent_size, max_char, brace_style); //initialize starting values

  while (true) {
	  var t = multi_parser.get_token();
	  multi_parser.token_text = t[0];
	  multi_parser.token_type = t[1];

	if (multi_parser.token_type === 'TK_EOF') {
	  break;
	}

	switch (multi_parser.token_type) {
	  case 'TK_TAG_START':
		multi_parser.print_newline(false, multi_parser.output);
		multi_parser.print_token(multi_parser.token_text);
		multi_parser.indent();
		multi_parser.current_mode = 'CONTENT';
		break;
	  case 'TK_TAG_STYLE':
	  case 'TK_TAG_SCRIPT':
		multi_parser.print_newline(false, multi_parser.output);
		multi_parser.print_token(multi_parser.token_text);
		multi_parser.current_mode = 'CONTENT';
		break;
	  case 'TK_TAG_END':
		//Print new line only if the tag has no content and has child
		if (multi_parser.last_token === 'TK_CONTENT' && multi_parser.last_text === '') {
			var tag_name = multi_parser.token_text.match(/\w+/)[0];
			var tag_extracted_from_last_output = multi_parser.output[multi_parser.output.length -1].match(/<\s*(\w+)/);
			if (tag_extracted_from_last_output === null || tag_extracted_from_last_output[1] !== tag_name)
				multi_parser.print_newline(true, multi_parser.output);
		}
		multi_parser.print_token(multi_parser.token_text);
		multi_parser.current_mode = 'CONTENT';
		break;
	  case 'TK_TAG_SINGLE':
		multi_parser.print_newline(false, multi_parser.output);
		multi_parser.print_token(multi_parser.token_text);
		multi_parser.current_mode = 'CONTENT';
		break;
	  case 'TK_CONTENT':
		if (multi_parser.token_text !== '') {
		  multi_parser.print_token(multi_parser.token_text);
		}
		multi_parser.current_mode = 'TAG';
		break;
	  case 'TK_STYLE':
	  case 'TK_SCRIPT':
		if (multi_parser.token_text !== '') {
		  multi_parser.output.push('\n');
		  var text = multi_parser.token_text;
		  if (multi_parser.token_type == 'TK_SCRIPT') {
			var _beautifier = typeof js_beautify == 'function' && js_beautify;
		  } else if (multi_parser.token_type == 'TK_STYLE') {
			var _beautifier = typeof css_beautify == 'function' && css_beautify;
		  }

		  if (options.indent_scripts == "keep") {
			var script_indent_level = 0;
		  } else if (options.indent_scripts == "separate") {
			var script_indent_level = -multi_parser.indent_level;
		  } else {
			var script_indent_level = 1;
		  }

		  var indentation = multi_parser.get_full_indent(script_indent_level);
		  if (_beautifier) {
			// call the Beautifier if avaliable
			text = _beautifier(text.replace(/^\s*/, indentation), options);
		  } else {
			// simply indent the string otherwise
			var white = text.match(/^\s*/)[0];
			var _level = white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length - 1;
			var reindent = multi_parser.get_full_indent(script_indent_level -_level);
			text = text.replace(/^\s*/, indentation)
				   .replace(/\r\n|\r|\n/g, '\n' + reindent)
				   .replace(/\s*$/, '');
		  }
		  if (text) {
			multi_parser.print_token(text);
			multi_parser.print_newline(true, multi_parser.output);
		  }
		}
		multi_parser.current_mode = 'TAG';
		break;
	}
	multi_parser.last_token = multi_parser.token_type;
	multi_parser.last_text = multi_parser.token_text;
  }
  return multi_parser.output.join('');
}


/*

 CSS Beautifier
---------------

	Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)

	Based on code initially developed by: Einar Lielmanis, <elfz@laacz.lv>
		http://jsbeautifier.org/


	You are free to use this in any way you want, in case you find this useful or working for you.

	Usage:
		css_beautify(source_text);
		css_beautify(source_text, options);

	The options are:
		indent_size (default 4)          — indentation size,
		indent_char (default space)      — character to indent with,

	e.g

	css_beautify(css_source_text, {
	  'indent_size': 1,
	  'indent_char': '\t'
	});
*/

// http://www.w3.org/TR/CSS21/syndata.html#tokenization
// http://www.w3.org/TR/css3-syntax/
function css_beautify(source_text, options) {
	options = options || {};
	var indentSize = options.indent_size || 4;
	var indentCharacter = options.indent_char || ' ';

	// compatibility
	if (typeof indentSize == "string")
		indentSize = parseInt(indentSize);


	// tokenizer
	var whiteRe = /^\s+$/;
	var wordRe = /[\w$\-_]/;

	var pos = -1, ch;
	function next() {
		return ch = source_text.charAt(++pos)
	}
	function peek() {
		return source_text.charAt(pos+1)
	}
	function eatString(comma) {
		var start = pos;
		while(next()){
			if (ch=="\\"){
				next();
				next();
			} else if (ch == comma) {
				break;
			} else if (ch == "\n") {
				break;
			}
		}
		return source_text.substring(start, pos + 1);
	}

	function eatWhitespace() {
		var start = pos;
		while (whiteRe.test(peek()))
			pos++;
		return pos != start;
	}

	function skipWhitespace() {
		var start = pos;
		do{
		}while (whiteRe.test(next()))
		return pos != start + 1;
	}

	function eatComment() {
		var start = pos;
		next();
		while (next()) {
			if (ch == "*" && peek() == "/") {
				pos ++;
				break;
			}
		}

		return source_text.substring(start, pos + 1);
	}


	function lookBack(str, index) {
		return output.slice(-str.length + (index||0), index).join("").toLowerCase() == str;
	}

	// printer
	var indentString = source_text.match(/^[\r\n]*[\t ]*/)[0];
	var singleIndent = Array(indentSize + 1).join(indentCharacter);
	var indentLevel = 0;
	function indent() {
		indentLevel++;
		indentString += singleIndent;
	}
	function outdent() {
		indentLevel--;
		indentString = indentString.slice(0, -indentSize);
	}

	print = {}
	print["{"] = function(ch) {
		print.singleSpace();
		output.push(ch);
		print.newLine();
	}
	print["}"] = function(ch) {
		print.newLine();
		output.push(ch);
		print.newLine();
	}

	print.newLine = function(keepWhitespace) {
		if (!keepWhitespace)
			while (whiteRe.test(output[output.length - 1]))
				output.pop();

		if (output.length)
			output.push('\n');
		if (indentString)
			output.push(indentString);
	}
	print.singleSpace = function() {
		if (output.length && !whiteRe.test(output[output.length - 1]))
			output.push(' ');
	}
	var output = [];
	if (indentString)
		output.push(indentString);
	/*_____________________--------------------_____________________*/

	while(true) {
		var isAfterSpace = skipWhitespace();

		if (!ch)
			break;

		if (ch == '{') {
			indent();
			print["{"](ch);
		} else if (ch == '}') {
			outdent();
			print["}"](ch);
		} else if (ch == '"' || ch == '\'') {
			output.push(eatString(ch))
		} else if (ch == ';') {
			output.push(ch, '\n', indentString);
		} else if (ch == '/' && peek() == '*') { // comment
			print.newLine();
			output.push(eatComment(), "\n", indentString);
		} else if (ch == '(') { // may be a url
			output.push(ch);
			eatWhitespace();
			if (lookBack("url", -1) && next()) {
				if (ch != ')' && ch != '"' && ch != '\'')
					output.push(eatString(')'));
				else
					pos--;
			}
		} else if (ch == ')') {
			output.push(ch);
		} else if (ch == ',') {
			eatWhitespace();
			output.push(ch);
			print.singleSpace();
		} else if (ch == ']') {
			output.push(ch);
		}  else if (ch == '[' || ch == '=') { // no whitespace before or after
			eatWhitespace();
			output.push(ch);
		} else {
			if (isAfterSpace)
				print.singleSpace();

			output.push(ch);
		}
	}


	var sweetCode = output.join('').replace(/[\n ]+$/, '');
	return sweetCode;
}


if (typeof exports !== "undefined") {
	exports.css_beautify = css_beautify;
}

;
(function () {
"use strict";

var randomWord = function ( cb ) {
	IO.jsonp({
		url : 'http://sleepy-bastion-8674.herokuapp.com/',
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		cb( resp.word.toLowerCase().trim() );
	}
};

var game = {

	//the dude is just a template to be filled with parts
	//like a futuristic man. he has no shape. he has no identity. he's just a
	// collection of mindless parts, to be assembled, for the greater good.
	//pah! I mock your pathetic attempts at disowning man of his prowess! YOU
	// SHALL NOT WIN! VIVE LA PENSÉE!!
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
		else if ( msg.content ) {
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
		if ( guess.length > this.word.length ) {
			return msg.codify(guess) + ' is longer than the phrase';
		}

		//replace all occurences of the guess within the hidden word with their
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

		var hangy = this.msg.codify( dude + '\n' + belowDude );
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
(function () {
var parse;

function learn ( args ) {
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
	command.input = new RegExp( command.input );

	parse = bot.getCommand( 'parse' );
	if ( parse.error ) {
		console.error( '/parse not loaded, cannot /learn' );
		return 'Failed; /parse not loaded';
	}
	console.log( parse );

	bot.log( command, '/learn parsed' );

	addCustomCommand( command );
	return 'Command ' + command.name + ' learned';
};

function addCustomCommand ( command ) {
	bot.addCommand({
		name : command.name,
		description : 'User-taught command: ' + command.output,

		fun : makeCustomCommand( command ),
		permissions : {
			use : 'ALL',
			del : 'ALL'
		}
	});
}
function makeCustomCommand ( command ) {

	return function ( args ) {
		bot.log( args, command.name + ' input' );

		var cmdArgs = bot.Message( command.output, args.get() );
		return parse.exec( cmdArgs, command.input.exec(args) );
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


bot.addCommand({
	name : 'learn',
	fun  : learn,
	privileges : {
		del : 'NONE',
	},

	description : 'Teaches the bot a command. ' +
		'`/learn cmdName cmdOutputMacro [cmdInputRegex]`'
});
}());
