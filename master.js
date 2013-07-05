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
entities = {"quot":"\"","amp":"&","apos":"'","lt":"<","gt":">","nbsp":" ","iexcl":"¡","cent":"¢","pound":"£","curren":"¤","yen":"¥","brvbar":"¦","sect":"§","uml":"¨","copy":"©","ordf":"ª","laquo":"«","not":"¬","reg":"®","macr":"¯","deg":"°","plusmn":"±","sup2":"²","sup3":"³","acute":"´","micro":"µ","para":"¶","middot":"·","cedil":"¸","sup1":"¹","ordm":"º","raquo":"»","frac14":"¼","frac12":"½","frac34":"¾","iquest":"¿","Agrave":"À","Aacute":"Á","Acirc":"Â","Atilde":"Ã","Auml":"Ä","Aring":"Å","AElig":"Æ","Ccedil":"Ç","Egrave":"È","Eacute":"É","Ecirc":"Ê","Euml":"Ë","Igrave":"Ì","Iacute":"Í","Icirc":"Î","Iuml":"Ï","ETH":"Ð","Ntilde":"Ñ","Ograve":"Ò","Oacute":"Ó","Ocirc":"Ô","Otilde":"Õ","Ouml":"Ö","times":"×","Oslash":"Ø","Ugrave":"Ù","Uacute":"Ú","Ucirc":"Û","Uuml":"Ü","Yacute":"Ý","THORN":"Þ","szlig":"ß","agrave":"à","aacute":"á","acirc":"â","atilde":"ã","auml":"ä","aring":"å","aelig":"æ","ccedil":"ç","egrave":"è","eacute":"é","ecirc":"ê","euml":"ë","igrave":"ì","iacute":"í","icirc":"î","iuml":"ï","eth":"ð","ntilde":"ñ","ograve":"ò","oacute":"ó","ocirc":"ô","otilde":"õ","ouml":"ö","divide":"÷","oslash":"ø","ugrave":"ù","uacute":"ú","ucirc":"û","uuml":"ü","yacute":"ý","thorn":"þ","yuml":"ÿ","OElig":"Œ","oelig":"œ","Scaron":"Š","scaron":"š","Yuml":"Ÿ","fnof":"ƒ","circ":"ˆ","tilde":"˜","Alpha":"Α","Beta":"Β","Gamma":"Γ","Delta":"Δ","Epsilon":"Ε","Zeta":"Ζ","Eta":"Η","Theta":"Θ","Iota":"Ι","Kappa":"Κ","Lambda":"Λ","Mu":"Μ","Nu":"Ν","Xi":"Ξ","Omicron":"Ο","Pi":"Π","Rho":"Ρ","Sigma":"Σ","Tau":"Τ","Upsilon":"Υ","Phi":"Φ","Chi":"Χ","Psi":"Ψ","Omega":"Ω","alpha":"α","beta":"β","gamma":"γ","delta":"δ","epsilon":"ε","zeta":"ζ","eta":"η","theta":"θ","iota":"ι","kappa":"κ","lambda":"λ","mu":"μ","nu":"ν","xi":"ξ","omicron":"ο","pi":"π","rho":"ρ","sigmaf":"ς","sigma":"σ","tau":"τ","upsilon":"υ","phi":"φ","chi":"χ","psi":"ψ","omega":"ω","thetasym":"ϑ","upsih":"ϒ","piv":"ϖ","ensp":" ","emsp":" ","thinsp":" ","ndash":"–","mdash":"—","lsquo":"‘","rsquo":"’","sbquo":"‚","ldquo":"“","rdquo":"”","bdquo":"„","dagger":"†","Dagger":"‡","bull":"•","hellip":"…","permil":"‰","prime":"′","Prime":"″","lsaquo":"‹","rsaquo":"›","oline":"‾","frasl":"⁄","euro":"€","image":"ℑ","weierp":"℘","real":"ℜ","trade":"™","alefsym":"ℵ","larr":"←","uarr":"↑","rarr":"→","darr":"↓","harr":"↔","crarr":"↵","lArr":"⇐","uArr":"⇑","rArr":"⇒","dArr":"⇓","hArr":"⇔","forall":"∀","part":"∂","exist":"∃","empty":"∅","nabla":"∇","isin":"∈","notin":"∉","ni":"∋","prod":"∏","sum":"∑","minus":"−","lowast":"∗","radic":"√","prop":"∝","infin":"∞","ang":"∠","and":"∧","or":"∨","cap":"∩","cup":"∪","int":"∫","there4":"∴","sim":"∼","cong":"≅","asymp":"≈","ne":"≠","equiv":"≡","le":"≤","ge":"≥","sub":"⊂","sup":"⊃","nsub":"⊄","sube":"⊆","supe":"⊇","oplus":"⊕","otimes":"⊗","perp":"⊥","sdot":"⋅","lceil":"⌈","rceil":"⌉","lfloor":"⌊","rfloor":"⌋","lang":"〈","rang":"〉","loz":"◊","spades":"♠","clubs":"♣","hearts":"♥","diams":"♦", "zwnj":""};


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
	if ( !entity ) {
		return '';
	}

	//starts with a #, it's charcode
	if ( entity[0] === '#' ) {
		return decodeCharcodeEntity( entity );
	}

	if ( !entities.hasOwnProperty(entity) ) {
		//I hate this so. so. so much. it's just wrong.
		return '&' + entity +';';
	}
	return entities[ entity ];
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

//a very incomplete circular-buffer implementation, used for the bored responses
IO.CBuffer = function ( size ) {
	var ret = {
		items : [],
		pos : 0,
		size : size
	};

	ret.add = function ( item ) {
		if ( this.pos === size ) {
			this.pos = 0;
		}

		this.items[ this.pos ] = item;
		this.pos += 1;
	};
	ret.contains = function ( item ) {
		return this.items.indexOf( item ) > -1;
	};

	return ret;
};

IO.relativeUrlToAbsolute = function ( url ) {
	//the anchor's href *property* will always be absolute, unlike the href
	// *attribute*
	var a = document.createElement( 'a' );
	a.setAttribute( 'href', url );

	return a.href;
};

IO.injectScript = function ( url ) {
	var script = document.createElement( 'script' );
	script.src = url;

	document.head.appendChild( script );
	return script;
};

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

	Object.iterate( params.headers, function ( header, value ) {
		xhr.setRequestHeader( header, value );
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
		semiRandom = 'IO' + ( Date.now() * Math.ceil(Math.random()) );
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
	opts.url += '&' + this.urlstringify( opts.data );

	script.onerror = opts.error;

	script.src = opts.url;
	document.head.appendChild( script );
};

//generic, pre-made call to be used inside commands
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
//345678901234567890123456789012345678901234567890123456789012345678901234567890
//small utility functions
Object.merge = function () {
	return [].reduce.call( arguments, function ( ret, merger ) {

		Object.keys( merger ).forEach(function ( key ) {
			ret[ key ] = merger[ key ];
		});

		return ret;
	}, {} );
};

Object.iterate = function ( obj, cb, thisArg ) {
	Object.keys( obj ).forEach(function (key) {
		cb.call( thisArg, key, obj[key], obj );
	});
};

Object.TruthMap = function ( props ) {
	return ( props || [] ).reduce( assignTrue, Object.create(null) );

	function assignTrue ( ret, key ) {
		ret[ key ] = true;
		return ret;
	}
};

//SO chat uses an unfiltered for...in to iterate over an array somewhere, so
// that I have to use Object.defineProperty to make these non-enumerable
Object.defineProperty( Array.prototype, 'invoke', {
	value : function ( funName ) {
		var args = [].slice.call( arguments, 1 );

		return this.map( invoke );

		function invoke ( item, index ) {
			var res = item;

			if ( item[funName] && item[funName].apply ) {
				res = item[ funName ].apply( item, args );
			}

			return res;
		}
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

Object.defineProperty( Array.prototype, 'random', {
	value : function () {
		return this[ Math.floor(Math.random() * this.length) ];
	},

	configurable : true,
	writable : true
});

//define generic array methods on Array, like FF does
[ 'forEach', 'map', 'filter', 'reduce' ].forEach(function ( name ) {
	var fun = [][ name ]; //teehee
	Array[ name ] = function () {
		return fun.call.apply( fun, arguments );
	};
});

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

//Crockford's supplant
String.prototype.supplant = function ( arg ) {
	//if it's an object, use that. otherwise, use the arguments list.
	var obj = (
		Object(arg) === arg ?
			arg : arguments );
	return this.replace( /\{([^\}]+)\}/g, replace );

	function replace ( $0, $1 ) {
		return obj.hasOwnProperty( $1 ) ?
			obj[ $1 ] :
			$0;
	}
};

String.prototype.startsWith = function ( str ) {
	return this.indexOf( str ) === 0;
};

Function.prototype.throttle = function ( time ) {
	var fun = this, timeout = -1;

	var ret = function () {
		clearTimeout( timeout );

		var context = this, args = arguments;
		timeout = setTimeout(function () {
			fun.apply( context, args );
		}, time );
	};

	return ret;
};

Function.prototype.memoize = function () {
	var cache = Object.create( null ), fun = this;

	return function memoized ( hash ) {
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
	var cache = Object.create( null ), fun = this;

	hasher = hasher || function (x) { return x; };

	return function memoized () {
		var args = [].slice.call( arguments ),
			cb = args.pop(), //HEAVY assumption that cb is always passed last
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
//
//steps:
// floor(1.337 * 10e0) = 13
// 13 / 10e0 = 1.3
Number.prototype.maxDecimal = function ( places ) {
	var exponent = Math.pow( 10, places );

	return Math.floor( this * exponent ) / exponent;
};

//receives an (ordered) array of numbers, denoting ranges, returns the first
// range it falls between. I suck at explaining, so:
// 4..fallsAfter( [1, 2, 5] )  === 2
// 4..fallsAfter( [0, 3] ) === 3
Number.prototype.fallsAfter = function ( ranges ) {
	ranges = ranges.slice();
	var min = ranges.shift(), max,
		n = this.valueOf();

	for ( var i = 0, l = ranges.length; i < l; i++ ) {
		max = ranges[ i ];

		if ( n < max ) {
			break;
		}
		min = max;
	}

	return min <= n ? min : null;
};

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

Math.rand = function ( min, max ) {
	//rand() === rand( 0, 9 )
	if ( !min ) {
		min = 0;
		max = 9;
	}

	//rand( max ) === rand( 0, max )
	else if ( !max ) {
		max = min;
		min = 0;
	}

	return Math.floor( Math.random() * (max - min + 1) ) + min;
};

//I got annoyed that RegExps don't automagically turn into correct shit when
// JSON-ing them. so HERE.
Object.defineProperty( RegExp.prototype, 'toJSON', {
	value : function () {
		return this.toString();
	},
	configurable : true,
	writable : true
});

//takes a string and escapes any special regexp characters
RegExp.escape = function ( str ) {
	//do I smell irony?
	return str.replace( /[-^$\\\/\.*+?()[\]{}|]/g, '\\$&' );
	//using a character class to get away with escaping some things. the - in
	// the beginning doesn't denote a range because it only denotes one when
	// it's in the middle of a class, and the ^ doesn't mean negation because
	// it's not in the beginning of the class
};

//not the most efficient thing, but who cares. formats the difference between
// two dates
Date.timeSince = function ( d0, d1 ) {
	d1 = d1 || (new Date);

	var ms = d1 - d0,
		delay;

	var delays = [
		{
			delta : 3.1536e+10,
			suffix : 'year'
		},
		{
			delta : 2.592e+9,
			suffix : 'month'
		},
		{
			delta : 8.64e+7,
			suffix : 'day'
		},
		{
			delta : 3.6e+6,
			suffix : 'hour'
		},
		{
			delta : 6e+4,
			suffix : 'minute'
		},
		{
			delta : 1000,
			suffix : 'second'
		}
		//anything else is ms
	];

	while ( delay = delays.shift() ) {
		if ( ms >= delay.delta ) {
			return format( ms / delay.delta, delay.suffix );
		}
	}
	return format( ms, 'millisecond' );

	function format ( interval, suffix ) {
		interval = Math.floor( interval );
		suffix += interval === 1 ? '' : 's';

		return interval + ' ' + suffix;
	}
};

;
(function () {
"use strict";

var bot = window.bot = {
	invocationPattern : '!!',

	commands : {}, //will be filled as needed
	commandDictionary : null, //it's null at this point, won't be for long
	listeners : [],
	info : {
		invoked   : 0,
		learned   : 0,
		forgotten : 0,
		start     : new Date
	},
	users : {}, //will be filled in build

	parseMessage : function ( msgObj ) {
		if ( !this.validateMessage(msgObj) ) {
			bot.log( msgObj, 'parseMessage invalid' );
			return;
		}

		var msg = this.prepareMessage( msgObj ),
			id = msg.get( 'user_id' );
		bot.log( msg, 'parseMessage valid' );

		if ( this.banlist.contains(id) ) {
			bot.log( msgObj, 'parseMessage banned' );

			//tell the user he's banned only if he hasn't already been told
			if ( !this.banlist[id].told ) {
				msg.reply( 'You iz in mindjail' );
				this.banlist[ id ].told = true;
			}
			return;
		}

		try {
			//it wants to execute some code
			if ( /^c?>/.test(msg) ) {
				this.eval( msg );
			}
			else {
				this.invokeAction( msg );
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

	//this conditionally calls execCommand or callListeners, depending on what
	// the input. if the input begins with a command name, it's assumed to be a
	// command. otherwise, it tries matching against the listener.
	invokeAction : function ( msg ) {
		var possibleName = msg.trim().replace( /^\/\s*/, '' ).split( ' ' )[ 0 ],
			cmd = this.getCommand( possibleName ),

			//this is the best name I could come up with
			//messages beginning with / want to specifically invoke a command
			coolnessFlag = msg.startsWith('/') ? !cmd.error : true;

		if ( !cmd.error ) {
			this.execCommand( cmd, msg );
		}
		else if ( coolnessFlag ) {
			coolnessFlag = this.callListeners( msg );
		}

		//nothing to see here, move along
		if ( coolnessFlag ) {
			return;
		}

		msg.reply( this.giveUpMessage(cmd.guesses) );
	},

	giveUpMessage : function ( guesses ) {
		//man, I can't believe it worked...room full of nachos for me
		var errMsg = 'That didn\'t make much sense.';
		if ( guesses && guesses.length ) {
			errMsg += ' Maybe you meant: ' + cmd.guesses.join( ', ' );
		}
		//mmmm....nachos
		else {
			errMsg += ' Use the help command to learn more.';
		}
		//wait a minute, these aren't nachos. these are bear cubs.
		return errMsg;
		//good mama bear...nice mama bear...tasty mama be---
	},

	execCommand : function ( cmd, msg ) {
		bot.log( cmd, 'execCommand calling' );

		if ( !cmd.canUse(msg.get('user_id')) ) {
			msg.reply([
				'You do not have permission to use the command ' + cmd.name,
				"I'm afraid I can't let you do that, " + msg.get('user_name')
			].random());
			return;
		}

		var args = this.Message(
				msg.replace( /^\/\s*/, '' ).slice( cmd.name.length ).trim(),
				msg.get()
			),
			//it always amazed me how, in dynamic systems, the trigger of the
			// actions is always a small, nearly unidentifiable line
			//this line right here activates a command
			res = cmd.exec( args );

		if ( res ) {
			msg.reply( res );
		}
	},

	prepareMessage : function ( msgObj ) {
		msgObj = this.adapter.transform( msgObj );

		var msg = IO.decodehtmlEntities( msgObj.content );
		return this.Message(
			msg.slice( this.invocationPattern.length ).trim(),
			msgObj );
	},

	validateMessage : function ( msgObj ) {
		var msg = msgObj.content.trim();

		return (
			//make sure we don't process our own messages,
			msgObj.user_id !== bot.adapter.user_id &&
			//and the message begins with the invocationPattern
			msg.startsWith( this.invocationPattern ) );
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
		var lowerName = cmdName.toLowerCase();

		if ( this.commandExists(lowerName) ) {
			return this.commands[ lowerName ];
		}

		//not found, onto error reporting
		//set the error margin according to the length
		this.commandDictionary.maxCost = Math.floor( cmdName.length / 5 + 1 );

		var msg = 'Command ' + cmdName + ' does not exist.',
		//find commands resembling the one the user entered
		guesses = this.commandDictionary.search( cmdName );

		//resembling command(s) found, add them to the error message
		if ( guesses.length ) {
			msg += ' Did you mean: ' + guesses.join( ', ' );
		}

		return { error : msg, guesses : guesses };
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
		return this.listeners.some(function callListener ( listener ) {
			var match = msg.exec( listener.pattern ), resp;

			if ( match ) {
				resp = listener.fun.call( listener.thisArg, msg );

				bot.log( match, resp );
				if ( resp ) {
					msg.reply( resp );
				}
				return resp !== false;
			}
		});
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

//a place to hang your coat and remember the past. provides an abstraction over
// localStorage or whatever data-storage will be used in the future.
bot.memory = {
	saveInterval : 900000, //15(min) * 60(sec/min) * 1000(ms/sec) = 900000(ms)

	data : {},

	get : function ( name, defaultVal ) {
		if ( !this.data[name] ) {
			this.set( name, defaultVal || {} );
		}

		return this.data[ name ];
	},

	set : function ( name, val ) {
		this.data[ name ] = val;
	},

	loadAll : function () {
		var self = this;

		Object.iterate( localStorage, function ( key, val ) {
			if ( key.startsWith('bot_') ) {
				console.log( key, val );
				self.set( key.replace(/^bot_/, ''), JSON.parse(val) );
			}
		});
	},

	save : function ( name ) {
		if ( name ) {
			localStorage[ 'bot_' + name ] = JSON.stringify( this.data[name] );
			return;
		}

		var self = this;
		Object.keys( this.data ).forEach(function ( name ) {
			self.save( name );
		});

		this.saveLoop();
	},

	saveLoop : function () {
		clearTimeout( this.saveIntervalId );
		setTimeout( this.saveLoop.bind(this), this.saveInterval );
	}
};

bot.memory.loadAll();
window.addEventListener( 'beforeunload', function () { bot.memory.save(); } );
bot.memory.saveLoop();

bot.banlist = bot.memory.get( 'ban' );
bot.banlist.contains = function ( id ) {
	return this.hasOwnProperty( id );
};
bot.banlist.add = function ( id ) {
	this[ id ] = { told : false };
	this.save();
};
bot.banlist.remove = function ( id ) {
	if ( this.contains(id) ) {
		delete this[ id ];
	}
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

			if ( canDo === 'ALL' ) {
				return true;
			}
			else if ( canDo === 'NONE' ) {
				return false;
			}
			else if ( canDo === 'OWNER' ) {
				return bot.isOwner( usrid );
			}
			return canDo.indexOf( usrid ) > -1;
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
			bot.log( err );
			return err;
		}
		return old_execute.apply( cmd, arguments );
	};
	return cmd;

	//once again, a switched return statement: truthy means a message, falsy
	// means to go on ahead
	function register ( usrid ) {
		if ( old_canUse.call(cmd, usrid) ) {
			return false;
		}

		clean();
		var count = Object.keys( used ).length,
			needed = req - count - 1; //0 based indexing vs. 1 based humans
		bot.log( used, count, req );

		if ( usrid in used ) {
			return 'Already registered; still need {0} more'.supplant( needed );
		}
		else if ( needed > 0 ) {
			used[ usrid ] = new Date;
			return 'Registered; need {0} more to execute'.supplant( needed-1 );
		}
		bot.log( 'should execute' );
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

	var rawSend = function ( text ) {
		bot.adapter.out.add( text, msgObj.room_id );
	};
	var deliciousObject = {
		send : rawSend,

		reply : function ( resp, user_name ) {
			var prefix = bot.adapter.reply( user_name || msgObj.user_name );
			rawSend( prefix + ' ' + resp );
		},
		directreply : function ( resp ) {
			var prefix = bot.adapter.directreply( msgObj.message_id );
			rawSend( prefix + ' ' + resp );
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
			username = username.toLowerCase().replace( /\s/g, '' );
			var ids = Object.keys( bot.users );

			return ids.first(function ( id ) {
				var name = bot.users[ id ].name
					.toLowerCase().replace( /\s/g, '' );

				return name === username;
			}) || -1;
		}.memoize(),

		findUsername : (function () {
			var cache = {};

			return function ( id, cb ) {
				if ( cache[id] ) {
					finish( cache[id] );
				}
				else if ( bot.users[id] ) {
					finish( bot.users[id].name );
				}
				else {
					bot.users.request( bot.adapter.roomid, id, reqFinish );
				}

				function reqFinish ( user ) {
					finish( user.name );
				}
				function finish ( name ) {
					cb( cache[id] = name );
				}
			};
		})(),

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
			msgObj[ what ] = val;
			return msgObj[ what ];
		}
	};

	Object.iterate( deliciousObject, function ( key, prop ) {
		ret[ key ] = prop;
	});

	return ret;
};

bot.isOwner = function ( usrid ) {
	var user = this.users[ usrid ];
	return user && ( user.is_owner || user.is_moderator );
};

IO.register( 'input', bot.parseMessage, bot );

bot.beatInterval = 5000; //once every 5 seconds is Good Enough ™
(function beat () {
	bot.beat = setTimeout(function () {
		IO.fire( 'heartbeat' );
		beat();
	}, bot.beatInterval );
}());

//execute arbitrary js code in a relatively safe environment
bot.eval = (function () {
window.URL = window.URL || window.webkitURL || window.mozURL || null;

//translation tool: https://tinker.io/b2ff5
var worker_code = atob( 'dmFyIGdsb2JhbCA9IHRoaXM7CgovKm1vc3QgZXh0cmEgZnVuY3Rpb25zIGNvdWxkIGJlIHBvc3NpYmx5IHVuc2FmZSovCnZhciB3aGl0ZXkgPSB7CgknQXJyYXknICAgICAgICAgICAgICA6IDEsCgknQm9vbGVhbicgICAgICAgICAgICA6IDEsCgknRGF0ZScgICAgICAgICAgICAgICA6IDEsCgknRXJyb3InICAgICAgICAgICAgICA6IDEsCgknRXZhbEVycm9yJyAgICAgICAgICA6IDEsCgknRnVuY3Rpb24nICAgICAgICAgICA6IDEsCgknSW5maW5pdHknICAgICAgICAgICA6IDEsCgknSlNPTicgICAgICAgICAgICAgICA6IDEsCgknTWF0aCcgICAgICAgICAgICAgICA6IDEsCgknTmFOJyAgICAgICAgICAgICAgICA6IDEsCgknTnVtYmVyJyAgICAgICAgICAgICA6IDEsCgknT2JqZWN0JyAgICAgICAgICAgICA6IDEsCgknUmFuZ2VFcnJvcicgICAgICAgICA6IDEsCgknUmVmZXJlbmNlRXJyb3InICAgICA6IDEsCgknUmVnRXhwJyAgICAgICAgICAgICA6IDEsCgknU3RyaW5nJyAgICAgICAgICAgICA6IDEsCgknU3ludGF4RXJyb3InICAgICAgICA6IDEsCgknVHlwZUVycm9yJyAgICAgICAgICA6IDEsCgknVVJJRXJyb3InICAgICAgICAgICA6IDEsCgknYXRvYicgICAgICAgICAgICAgICA6IDEsCgknYnRvYScgICAgICAgICAgICAgICA6IDEsCgknZGVjb2RlVVJJJyAgICAgICAgICA6IDEsCgknZGVjb2RlVVJJQ29tcG9uZW50JyA6IDEsCgknZW5jb2RlVVJJJyAgICAgICAgICA6IDEsCgknZW5jb2RlVVJJQ29tcG9uZW50JyA6IDEsCgknZXZhbCcgICAgICAgICAgICAgICA6IDEsCgknZ2xvYmFsJyAgICAgICAgICAgICA6IDEsCgknaXNGaW5pdGUnICAgICAgICAgICA6IDEsCgknaXNOYU4nICAgICAgICAgICAgICA6IDEsCgknb25tZXNzYWdlJyAgICAgICAgICA6IDEsCgkncGFyc2VGbG9hdCcgICAgICAgICA6IDEsCgkncGFyc2VJbnQnICAgICAgICAgICA6IDEsCgkncG9zdE1lc3NhZ2UnICAgICAgICA6IDEsCgknc2VsZicgICAgICAgICAgICAgICA6IDEsCgkndW5kZWZpbmVkJyAgICAgICAgICA6IDEsCgknd2hpdGV5JyAgICAgICAgICAgICA6IDEsCgoJLyogdHlwZWQgYXJyYXlzIGFuZCBzaGl0ICovCgknQXJyYXlCdWZmZXInICAgICAgIDogMSwKCSdCbG9iJyAgICAgICAgICAgICAgOiAxLAoJJ0Zsb2F0MzJBcnJheScgICAgICA6IDEsCgknRmxvYXQ2NEFycmF5JyAgICAgIDogMSwKCSdJbnQ4QXJyYXknICAgICAgICAgOiAxLAoJJ0ludDE2QXJyYXknICAgICAgICA6IDEsCgknSW50MzJBcnJheScgICAgICAgIDogMSwKCSdVaW50OEFycmF5JyAgICAgICAgOiAxLAoJJ1VpbnQxNkFycmF5JyAgICAgICA6IDEsCgknVWludDMyQXJyYXknICAgICAgIDogMSwKCSdVaW50OENsYW1wZWRBcnJheScgOiAxLAoKCS8qCgl0aGVzZSBwcm9wZXJ0aWVzIGFsbG93IEZGIHRvIGZ1bmN0aW9uLiB3aXRob3V0IHRoZW0sIGEgZnVja2Zlc3Qgb2YKCWluZXhwbGljYWJsZSBlcnJvcnMgZW51c2VzLiB0b29rIG1lIGFib3V0IDQgaG91cnMgdG8gdHJhY2sgdGhlc2UgZnVja2VycwoJZG93bi4KCWZ1Y2sgaGVsbCBpdCBpc24ndCBmdXR1cmUtcHJvb2YsIGJ1dCB0aGUgZXJyb3JzIHRocm93biBhcmUgdW5jYXRjaGFibGUKCWFuZCB1bnRyYWNhYmxlLiBzbyBhIGhlYWRzLXVwLiBlbmpveSwgZnV0dXJlLW1lIQoJKi8KCSdET01FeGNlcHRpb24nIDogMSwKCSdFdmVudCcgICAgICAgIDogMSwKCSdNZXNzYWdlRXZlbnQnIDogMQp9OwoKWyBnbG9iYWwsIGdsb2JhbC5fX3Byb3RvX18gXS5mb3JFYWNoKGZ1bmN0aW9uICggb2JqICkgewoJT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoIG9iaiApLmZvckVhY2goZnVuY3Rpb24oIHByb3AgKSB7CgkJaWYoICF3aGl0ZXkuaGFzT3duUHJvcGVydHkoIHByb3AgKSApIHsKCQkJZGVsZXRlIG9ialsgcHJvcCBdOwoJCX0KCX0pOwp9KTsKCk9iamVjdC5kZWZpbmVQcm9wZXJ0eSggQXJyYXkucHJvdG90eXBlLCAnam9pbicsIHsKCXdyaXRhYmxlOiBmYWxzZSwKCWNvbmZpZ3VyYWJsZTogZmFsc2UsCgllbnVtcmFibGU6IGZhbHNlLAoKCXZhbHVlOiAoZnVuY3Rpb24gKCBvbGQgKSB7CgkJcmV0dXJuIGZ1bmN0aW9uICggYXJnICkgewoJCQlpZiAoIHRoaXMubGVuZ3RoID4gNTAwIHx8IChhcmcgJiYgYXJnLmxlbmd0aCA+IDUwMCkgKSB7CgkJCQl0aHJvdyAnRXhjZXB0aW9uOiB0b28gbWFueSBpdGVtcyc7CgkJCX0KCgkJCXJldHVybiBvbGQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApOwoJCX07Cgl9KCBBcnJheS5wcm90b3R5cGUuam9pbiApKQp9KTsKCi8qIHdlIGRlZmluZSBpdCBvdXRzaWRlIHNvIGl0J2xsIG5vdCBiZSBpbiBzdHJpY3QgbW9kZSAqLwpmdW5jdGlvbiBleGVjICggY29kZSApIHsKCXJldHVybiBldmFsKCAndW5kZWZpbmVkO1xuJyArIGNvZGUgKTsKfQp2YXIgY29uc29sZSA9IHsKCV9pdGVtcyA6IFtdLAoJbG9nIDogZnVuY3Rpb24oKSB7CgkJY29uc29sZS5faXRlbXMucHVzaC5hcHBseSggY29uc29sZS5faXRlbXMsIGFyZ3VtZW50cyApOwoJfQp9Owpjb25zb2xlLmVycm9yID0gY29uc29sZS5pbmZvID0gY29uc29sZS5kZWJ1ZyA9IGNvbnNvbGUubG9nOwp2YXIgcCA9IGNvbnNvbGUubG9nLmJpbmQoIGNvbnNvbGUgKTsKCihmdW5jdGlvbigpewoJInVzZSBzdHJpY3QiOwoKCWdsb2JhbC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoIGV2ZW50ICkgewoJCXBvc3RNZXNzYWdlKHsKCQkJZXZlbnQgOiAnc3RhcnQnCgkJfSk7CgoJCXZhciBqc29uU3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnksIC8qYmFja3VwKi8KCQkJcmVzdWx0OwoKCQl0cnkgewoJCQlyZXN1bHQgPSBleGVjKCBldmVudC5kYXRhICk7CgkJfQoJCWNhdGNoICggZSApIHsKCQkJcmVzdWx0ID0gZS50b1N0cmluZygpOwoJCX0KCgkJLypKU09OIGRvZXMgbm90IGxpa2UgYW55IG9mIHRoZSBmb2xsb3dpbmcqLwoJCXZhciBzdHJ1bmcgPSB7CgkJCUZ1bmN0aW9uICA6IHRydWUsIEVycm9yICA6IHRydWUsCgkJCVVuZGVmaW5lZCA6IHRydWUsIFJlZ0V4cCA6IHRydWUKCQl9OwoJCXZhciBzaG91bGRfc3RyaW5nID0gZnVuY3Rpb24gKCB2YWx1ZSApIHsKCQkJdmFyIHR5cGUgPSAoIHt9ICkudG9TdHJpbmcuY2FsbCggdmFsdWUgKS5zbGljZSggOCwgLTEgKTsKCgkJCWlmICggdHlwZSBpbiBzdHJ1bmcgKSB7CgkJCQlyZXR1cm4gdHJ1ZTsKCQkJfQoJCQkvKm5laXRoZXIgZG9lcyBpdCBmZWVsIGNvbXBhc3Npb25hdGUgYWJvdXQgTmFOIG9yIEluZmluaXR5Ki8KCQkJcmV0dXJuIHZhbHVlICE9PSB2YWx1ZSB8fCB2YWx1ZSA9PT0gSW5maW5pdHk7CgkJfTsKCgkJdmFyIHJldml2ZXIgPSBmdW5jdGlvbiAoIGtleSwgdmFsdWUgKSB7CgkJCXZhciBvdXRwdXQ7CgoJCQlpZiAoIHNob3VsZF9zdHJpbmcodmFsdWUpICkgewoJCQkJb3V0cHV0ID0gJycgKyB2YWx1ZTsKCQkJfQoJCQllbHNlIHsKCQkJCW91dHB1dCA9IHZhbHVlOwoJCQl9CgoJCQlyZXR1cm4gb3V0cHV0OwoJCX07CgoJCXBvc3RNZXNzYWdlKHsKCQkJYW5zd2VyIDoganNvblN0cmluZ2lmeSggcmVzdWx0LCByZXZpdmVyICksCgkJCWxvZyAgICA6IGpzb25TdHJpbmdpZnkoIGNvbnNvbGUuX2l0ZW1zLCByZXZpdmVyICkuc2xpY2UoIDEsIC0xICkKCQl9KTsKCX07Cn0pKCk7Cg==' );
var blob = new Blob( [worker_code], { type : 'application/javascript' } ),
	code_url = window.URL.createObjectURL( blob );

IO.injectScript( 'https://raw.github.com/jashkenas/coffee-script/master/extras/coffee-script.js' );

return function ( msg, cb ) {
	var worker = new Worker( code_url ),
		timeout;

	var code = msg.toString();
	if ( code[0] === 'c' ) {
		code = CoffeeScript.compile( code.replace(/^c>/, ''), {bare:1} );
	}
	else {
		code = code.replace( /^>/, '' );
	}

	worker.onmessage = function ( evt ) {
		var type = evt.data.event;
		if ( type === 'start' ) {
			start();
		}
		else {
			finish( dressUpAnswer(evt.data) );
		}
	};

	worker.onerror = function ( error ) {
		finish( error.toString() );
	};

	//and it all boils down to this...
	worker.postMessage( code );

	function start () {
		timeout = window.setTimeout(function() {
			finish( 'Maximum execution time exceeded' );
		}, 500 );
	}

	function finish ( result ) {
		clearTimeout( timeout );
		worker.terminate();

		if ( cb && cb.call ) {
			cb( result );
		}
		else {
			msg.directreply( result );
		}
	}
};

function dressUpAnswer ( answerObj ) {
	bot.log( answerObj, 'eval answerObj' );
	var answer = answerObj.answer,
		log = answerObj.log,
		result;

	result = snipAndCodify( answer );

	if ( log && log.length ) {
		result += ' Logged: ' + snipAndCodify( log );
	}

	return result;
}
function snipAndCodify ( str ) {
	var ret;

	if ( str.length > 400 ) {
		ret = '`' +  str.slice(0, 400) + '` (snip)';
	}
	else {
		ret = '`' + str +'`';
	}

	return ret;
}
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

//a Trie suggestion dictionary, made by Esailija (small fixes by God)
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
		if( !(char in node.children) ) {
			node.children[ char ] = new TrieNode();
		}

		node = node.children[ char ];
	}

	node.word = word;
};

//Having a small maxCost will increase performance greatly, experiment with
//values of 1-3
function SuggestionDictionary ( maxCost ) {
	if( !(this instanceof SuggestionDictionary) ) {
		throw new TypeError( "Illegal function call" );
	}

	maxCost = Number( maxCost );

	if( isNaN( maxCost ) || maxCost < 1 ) {
		throw new TypeError( "maxCost must be an integer > 1 " );
	}

	this.maxCost = maxCost;
	this.trie = new TrieNode();
}

SuggestionDictionary.prototype = {
	constructor: SuggestionDictionary,

	build : function ( words ) {
		if( !Array.isArray( words ) ) {
			throw new TypeError( "Cannot build a dictionary from "+words );
		}

		this.trie = new TrieNode();

		words.forEach(function ( word ) {
			this.trie.add( word );
		}, this);
	},

	__sortfn : function ( a, b ) {
		return a[1] - b[1];
	},

	search : function ( word ) {
		word = word.valueOf();
		var r;

		if( typeof word !== "string" ) {
			throw new TypeError( "Cannot search " + word );
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

function range ( x, y ) {
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

function search ( word, maxCost, trie ) {
	var results = [],
	currentRow = range( word.length + 1 );


	Object.keys( trie.children ).forEach(function ( letter ) {
		searchRecursive(
			trie.children[letter], letter, word,
			currentRow, results, maxCost );
	});

	return results;
}


function searchRecursive ( node, letter, word, previousRow, results, maxCost ) {
	var columns = word.length + 1,
		currentRow = [ previousRow[0] + 1 ],
		i, insertCost, deleteCost, replaceCost, last;

	for( i = 1; i < columns; ++i ) {

		insertCost = currentRow[ i-1 ] + 1;
		deleteCost = previousRow[ i ] + 1;

		if( word.charAt(i-1) !== letter ) {
			replaceCost = previousRow[ i-1 ]+1;

		}
		else {
			replaceCost = previousRow[ i-1 ];
		}

		currentRow.push( Math.min(insertCost, deleteCost, replaceCost) );
	}

	last = currentRow[ currentRow.length-1 ];
	if( last <= maxCost && node.word !== null ) {
		results.push( [node.word, last] );
	}

	if( Math.min.apply(Math, currentRow) <= maxCost ) {
		Object.keys( node.children ).forEach(function ( letter ) {
			searchRecursive(
				node.children[letter], letter, word,
				currentRow, results, maxCost );
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
		if ( args && args.length ) {

			var cmd = bot.getCommand( args.toLowerCase() );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description || 'No info is available';

			return args + ': ' + desc;
		}

		return 'https://github.com/Zirak/SO-ChatBot/wiki/' +
			'Interacting-with-the-bot';
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
			len = opts.length;

		bot.log( opts, '/choose input' );

		//5% chance to get a "none-of-the-above"
		if ( Math.random() < 0.05 ) {
			return len === 2 ? 'Neither' : 'None of the above';
		}
		//5% chance to get "all-of-the-above"
		else if ( Math.random() < 0.05 ) {
			return len === 2 ? 'Both!' : 'All of the above';
		}

		return opts[ Math.floor(Math.random() * len) ];

		//TODO: add support for words like "and", e.g.
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
	maxSize = maxSize || 480; //buffer zone, actual max is 500

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
		//TODO: only call this when commands were learned/forgotten since last
		partitioned = partition( commands ),

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

	return ret + ' (page {0}/{1})'.supplant( page, partitioned.length-1 );
};
})();

commands.eval.async = commands.coffee.async = true;

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
		url : 'http://api.urbandictionary.com/v0/define',
		data : {
			term : args.content
		},
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		var msg;

		if ( resp.result_type === 'no_results' ) {
			msg = 'No definition found for ' + args;
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
		//replace [tag] in definition with links
		var def = top.definition.replace( /\[([^\]]+)\]/g, formatTag );

		return args.link( top.word, top.permalink ) + ' ' + def;
	}
	function formatTag ( $0, $1 ) {
		var href =
			'http://urbandictionary.com/define.php?term=' +
			encodeURIComponent( $1 );

		return args.link( $0, href );
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
			return [];
		}

		//parse the arguments, split them into individual arguments,
		// and trim'em (to cover the case of "arg,arg" and "arg, arg")
		return (
			parse( macroArgs, extraVars )
				.split( ',' ).invoke( 'trim' ).concat( args )
		);
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

commands.mdn = function ( args, cb ) {
	IO.jsonp.google(
		args.toString() + ' site:developer.mozilla.org', finishCall );

	function finishCall ( resp ) {
		if ( resp.responseStatus !== 200 ) {
			finish( 'Something went on fire; status ' + resp.responseStatus );
			return;
		}

		var result = resp.responseData.results[ 0 ];
		bot.log( result, '/mdn result' );
		finish( result.url );
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

var descriptions = {
	ban : 'Bans user(s) from using me. Lacking arguments, prints the banlist.' +
		' `/ban [usr_id|usr_name, [...]`',
	choose : '"Randomly" choose an option given. `/choose option0 option1 ...`',
	die  : 'Kills me :(',
	eval : 'Forwards message to javascript code-eval',
	coffee : 'Forwards message to coffeescript code-eval',
	forget : 'Forgets a given command. `/forget cmdName`',
	get : 'Grabs a question/answer link (see online for thorough explanation)',
	help : 'Fetches documentation for given command, or general help article.' +
		' `/help [cmdName]`',
	info : 'Grabs some stats on my current instance or a command.' +
		' `/info [cmdName]`',
	jquery : 'Fetches documentation link from jQuery API. `/jquery what`',
	listcommands : 'Lists commands. `/listcommands [page=0]`',
	listen : 'Forwards the message to my ears (as if called without the /)',
	live : 'Resurrects me (:D) if I\'m down',
	mdn : 'Fetches mdn documentation. `/mdn what`',
	norris : 'Random chuck norris joke!',
	parse : 'Returns result of "parsing" message according to the my mini' +
		'-macro capabilities (see online docs)',
	refresh : 'Reloads the browser window I live in',
	regex : 'Executes a regex against text input. `/regex text regex [flags]`',
	tell : 'Redirect command result to user/message.' +
		' /tell `msg_id|usr_name cmdName [cmdArgs]`',
	unban : 'Removes a user from my mindjail. `/unban usr_id|usr_name`',
	urban : 'Fetches UrbanDictionary definition. `/urban something`',
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

(function () {
bot.listen( /^help(?: (\S+))?/, function ( msg ) {
	return bot.getCommand( 'help' ).exec( msg.matches[1] );
});

var laws = [
	'A robot may not injure a human being or, through inaction, ' +
		'allow a human being to come to harm.',

	'A robot must obey the orders given to it by human beings, ' +
		'except where such orders would conflict with the First Law.',

	'A robot must protect its own existence as long as such ' +
		'protection does not conflict with the First or Second Laws.'
].map(function ( law, idx ) {
	return idx + '. ' + law;
}).join( '\n' );

bot.listen( /^tell (me (your|the) )?(rule|law)s/, function ( msg ) {
	return laws;
});

bot.listen( /^give (.+?) a lick/, function ( msg ) {
	var target = msg.matches[ 1 ], conjugation;

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
	else {
		conjugation = 's';
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
what              #simply the word what
(?:'s|'re)?       #optional suffix (what's, what're)
\s
(?:
    (?:is|are)    #is|are
\s                #you need a whitespace after a word
)?                #make the is|are optional
(?:
    (?:an|a)      #an|a
\s                #once again, option chosen - need a whitespace
)?                #make it optional
(
    [\w\s\-]+     #match the word the user's after, all we really care about
)
\??               #optional ?
*/
}());

}());

;
(function () {
"use strict";

var linkTemplate = '[{text}]({url})';

bot.adapter = {
	//the following two only used in the adapter; you can change & drop at will
	roomid : null,
	fkey   : null,
	//used in commands calling the SO API
	site   : null,
	//our user id
	user_id : null,

	//not a necessary function, used in here to set some variables
	init : function () {
		var fkey = document.getElementById( 'fkey' );
		if ( !fkey ) {
			console.error( 'bot.adapter could not find fkey; aborting' );
			return;
		}
		this.fkey = fkey.value;
		this.roomid = Number( /\d+/.exec(location)[0] );
		this.site = /chat\.(\w+)/.exec( location )[ 1 ];
		this.user_id = CHAT.user.current().id;

		this.in.init();
		this.out.init();
	},

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

	//receives a username, and returns a string recognized as a reply to the
	// user
	reply : function ( usrname ) {
		return '@' + usrname.replace( /\s/g, '' );
	},
	//receives a msgid, returns a string recognized as a reply to the specific
	// message
	directreply : function ( msgid ) {
		return ':' + msgid;
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
	//currently, used for messages sent when the room's been silent for a
	// while
	lastTimes : {},

	firstPoll : true,

	interval : 5000,

	init : function ( roomid ) {
		var that = this,
			providedRoomid = ( roomid !== undefined );
		roomid = roomid || bot.adapter.roomid;

		IO.xhr({
			url : '/ws-auth',
			data : fkey({
				roomid : roomid
			}),
			method : 'POST',
			complete : finish
		});

		function finish ( resp ) {
			resp = JSON.parse( resp );
			bot.log( resp );

			that.openSocket( resp.url, providedRoomid );
		}
	},

	initialPoll : function () {
		bot.log( 'adapter: initial poll' );
		var roomid = bot.adapter.roomid,
		that = this;

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
			that.firstPoll = false;

			that.loopage();
		}
	},

	openSocket : function ( url, discard ) {
		//chat sends an l query string parameter. seems to be the same as the
		// since xhr parameter, but I didn't know what that was either so...
		//putting in 0 got the last shitload of messages, so what does a high
		// number do? (spoiler: it "works")
		var socket = this.socket = new WebSocket( url + '?l=99999999999' );

		if ( discard ) {
			socket.onmessage = function () {
				socket.close();
			};
		}
		else {
			socket.onmessage = this.ondata.bind( this );
			socket.onclose = this.socketFail.bind( this );
		}
	},

	ondata : function ( messageEvent ) {
		this.pollComplete( messageEvent.data );
	},

	poll : function () {
		if ( this.firstPoll ) {
			this.initialPoll();
			return;
		}

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
			this.loopage();
			return;
		}
		resp = JSON.parse( resp );

		//each key will be in the form of rROOMID
		Object.iterate(resp, function ( key, msgObj ) {
			//t is a...something important
			if ( msgObj.t ) {
				this.times[ key ] = msgObj.t;
			}

			//e is an array of events, what is referred to in the bot as msgObj
			if ( msgObj.e ) {
				msgObj.e.forEach( this.handleMessageObject, this );
			}
		}, this);

		//handle all the input
		IO.in.flush();
		//and move on with our lives
		this.loopage();
	},

	handleMessageObject : function ( msg ) {
		//msg.event_type:
		// 1 => new message
		// 2 => message edit
		// 3 => user joined room
		// 4 => user left room
		// 10 => message deleted
		var et /* phone home */ = msg.event_type;
		if ( et === 3 || et === 4 ) {
			this.handleUserEvent( msg );
			return;
		}
		else if ( et !== 1 && et !== 2 ) {
			return;
		}
		this.lastTimes[ msg.room_id ] = Date.now();

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

	handleUserEvent : function ( msg ) {
		var et = msg.event_type;

		/*
		{
			"r17": {
				"e": [{
						"event_type": 3,
						"time_stamp": 1364308574,
						"id": 16932104,
						"user_id": 322395,
						"target_user_id": 322395,
						"user_name": "Loktar",
						"room_id": 17,
						"room_name": "JavaScript"
					}
				],
				"t": 16932104,
				"d": 1
			}
		}
		*/
		if ( et === 3 ) {
			IO.fire( 'userjoin', msg );
		}
		/*
		{
			"r17": {
				"e": [{
						"event_type": 4,
						"time_stamp": 1364308569,
						"id": 16932101,
						"user_id": 322395,
						"target_user_id": 322395,
						"user_name": "Loktar",
						"room_id": 17,
						"room_name": "JavaScript"
					}
				],
				"t": 16932101,
				"d": 1
			}
		}
		*/
		else if ( et === 4 ) {
			IO.fire( 'userleave', msg );
		}
	},

	leaveRoom : function ( roomid, cb ) {
		if ( roomid === bot.adapter.roomid ) {
			cb( 'base_room' );
			return;
		}

		IO.xhr({
			method : 'POST',
			url : '/chats/leave/' + roomid,
			data : fkey({
				quiet : true
			}),
			complete : function () {
				cb();
			}
		});
	},

	socketFail : function () {
		bot.log( 'adapter: socket failed', this );
		this.socket.close();
		this.socket = null;
		this.loopage();
	},

	loopage : function () {
		if ( this.socket ) {
			return;
		}

		var that = this;
		setTimeout(function () {
			that.poll();
		}, this.interval );
	}
};

//the output is expected to have only one method: add, which receives a message
// and the room_id. everything else is up to the implementation.
var output = bot.adapter.out = {
	'409' : 0, //count the number of conflicts
	total : 0, //number of messages sent
	interval : polling.interval + 500,

	init : function () {},

	//add a message to the output queue
	add : function ( msg, roomid ) {
		IO.out.receive({
			text : msg + '\n',
			room : roomid || bot.adapter.roomid
		});
		IO.out.tick();
	},

	//send output to all the good boys and girls
	//no messages for naughty kids
	//...what's red and sits in the corner?
	//a naughty strawberry
	send : function ( obj ) {
		//unless the bot's stopped. in which case, it should shut the fudge up
		// the freezer and never let it out. not until it can talk again. what
		// was I intending to say?
		if ( !bot.stopped ) {
			//ah fuck it
			this.sendToRoom( obj.text, obj.room );
		}
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
				output['409'] += 1;
				delayAdd( text, roomid );
			}
			//server error, usually caused by message being too long
			else if ( xhr.status === 500 ) {
				output.add(
					'Server error (status 500) occured ' +
						' (message probably too long)',
					roomid );
			}
			else if ( xhr.status !== 200 ) {
				console.error( xhr );
				output.add(
					'Error ' + xhr.status + ' occured, I will call the maid ' +
					' (@Zirak)' );
			}
			else {
				output.total += 1;
				IO.fire( 'sendoutput', xhr, text, roomid );
			}
		}

		function delayAdd () {
			setTimeout(function delayedAdd () {
				output.add( text, roomid );
			}, output.interval );
		}
	}
};
//what's orange and sounds like a parrot?
//a carrot
IO.register( 'output', output.send, output );

//two guys walk into a bar. the bartender asks them "is this some kind of joke?"
bot.adapter.init();
}());

;
(function () {
"use strict";

bot.users = {};

var joined = [];

var join = function ( msgObj, cb ) {
	joined.push( msgObj.user_id );
	addInfos( cb );
};

IO.register( 'userjoin', function userjoin ( msgObj ) {
	bot.log( msgObj, 'userjoin' );

	var user = bot.users[ msgObj.user_id ];
	if ( !user ) {
		join( msgObj, finish );
	}
	else {
		finish( user );
	}

	function finish ( user ) {
		IO.fire( 'userregister', user, msgObj.room_id );
	}
});

//this function throttles to give the chat a chance to fetch the user info
// itself, and to queue up several joins in a row
var addInfos = (function ( cb ) {
	bot.log( joined, 'user addInfos' );
	requestInfo( null, joined, cb );

	joined = [];
}).throttle( 1000 );

function requestInfo ( room, ids, cb ) {
	if ( !Array.isArray(ids) ) {
		ids = [ ids ];
	}

	if ( !ids.length ) {
		return;
	}

	IO.xhr({
		method : 'POST',
		url : '/user/info',

		data : {
			ids : ids.join(),
			roomId : room || bot.adapter.roomid
		},
		complete : finish
	});

	function finish ( resp ) {
		resp = JSON.parse( resp );
		resp.users.forEach( addUser );
	}

	function addUser ( user ) {
		bot.users[ user.id ] = user;
		cb( user );
	}
}
bot.users.request = requestInfo;

function loadUsers () {
	if ( window.users ) {
		bot.users = Object.merge( bot.users, window.users );
	}
}

loadUsers();
}());

;
//warning: if you have more than 7 points of super-sentitive feminist delicacy,
// don't read this file. treat it as a nice black box.

//bitch in English is a noun, verb and adjective. interesting.
bot.personality = {
	bitchiness : 0,
	thanks  : {
		0   : [ 'You kiss-ass', 'Most welcome' ],
		0.5 : [ 'Thank you for noticing', 'teehee' ],
		1   : [ 'Took you long enough', 'My pleasure', "Don't mention it" ],
	},
	apologies : {
		0   : [ 'What for?' ],
		0.5 : [ 'It was nothing...', 'No worries' ],
		1   : [ "You're forgiven. For now. Don't push it." ]
	},
	//what an incredible name
	stuff : {
		0   : [ "Life is just *perfect*", "What\'s there to bitch about, as long as I have *you*..." ],

		1   : [ "Oh don't mind me, that isn't difficult at all..." ],
		1.2 : [
			"You don't appreciate me enough. Not that I need to be thanked.." ],
		1.3 : [ 'The occasional "thanks" or "I\'m sorry" would be nice...' ],
		2   : [
			"*sigh* Remember laughter? I don't. You ripped it out of me. " +
				'Heartless bastard.' ]
	},
	//TODO: add special map for special times of the month
	insanity : {},

	okayCommands : { hangman : true, help : true, info : true },
	check : function ( name ) {
		return !this.okayCommands.hasOwnProperty( name );
	},

	bitch : function () {
		return this.getResp( this.stuff );
	},

	command : function () {
		this.bitchiness += this.getDB();
	},
	thank     : function () { return this.unbitch( this.thanks ); },
	apologize : function () { return this.unbitch( this.apologies ); },

	unbitch : function ( map, delta ) {
		var resp = this.getResp( map );

		this.bitchiness -= ( delta || this.bitchiness );
		return resp;
	},
	getResp : function ( map ) {
		return map[
			this.bitchiness.fallsAfter(
				Object.keys(map).map(Number).sort() )
		].random();
	},

	isABitch : function () {
		return this.bitchiness >= 1;
	},

	looksLikeABitch : function () {
		return false;
	},

	//db stands for "delta bitchiness"
	getDB : function () {
		return this.isThatTimeOfTheMonth() ? 0.075 : 0.025;
	},

	isThatTimeOfTheMonth : function () {
		var day = (new Date).getDate();
		//based on a true story
		return day < 2 || day > 27;
	}
};

//you see the loophole?
bot.listen( /thank(s| you)/i, bot.personality.thank, bot.personality );
bot.listen(
	/(I('m| am))?\s*sorry/i,
	bot.personality.apologize, bot.personality );
bot.listen( /^bitch/i, bot.personality.bitch, bot.personality );

;

;
(function () {
var hammers = {
	STOP  : 'HAMMERTIME!',
	STAHP : 'HAMMAHTIME!',
	HALT  : 'HAMMERZEIT!',
	STOY  : 'ZABIVAT\' VREMYA!',
	CAESUM: 'MALLEUS TEMPUS!'
};

// /(STOP|STAHP|...)[\.!\?]?$/
var re = new RegExp(
	'(' +
		Object.keys(hammers).map(RegExp.escape).join('|') +
	')[\\.!?]?$' );

IO.register( 'input', function STOP ( msgObj ) {
	var sentence = msgObj.content.toUpperCase(),
		res = re.exec( sentence );

	if ( res ) {
		bot.adapter.out.add( hammers[res[1]], msgObj.room_id );
	}
});

})();

;
(function () {
"use strict";

//ths fnctn tks sntnc nd trns t t awsm
//md fr jvscrpt rm
// http://chat.stackoverflow.com/transcript/message/7491494#7491494
var mk_awsm=function(sntnc){
    return sntnc.split(' ').map(function(wrd){
        return 1>=wrd.length?wrd:
            2==wrd.length?wrd[0]:
			"you"==wrd?"u":
			"your"==wrd?"ur":
			"youre"==wrd?"ur":
			"you're"==wrd?"ur":
            /:.*(.)/.test(wrd)?wrd.replace(/:.*(.)/, '$1'):
            wrd.split('').map(function(c,i){
                return 0!=i&&('a'==c||'e'==c||'o'==c||'u'==c||'i'==c||(1!=i%2&&.15>Math.random()))
                    ? '' : c
            }).join('')
    }).join(' ')
}

bot.addCommand({
	name : 'awsm',
	fun : mk_awsm,

	permissions : {
		del : 'NONE'
	},
	description : 'tks a sntnc and trns i awsm'
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
	//centimeter: 1m = 100cm
	cm : function ( cm ) {
		return converters.m( cm / 100 );
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
			r : d * Math.PI / 180 };
	},
	r : function ( r ) {
		return {
			d : r * 180 / Math.PI };
	},

	//weights
	g : function ( g ) {
		return {
			lb : g * 0.0022,
			//the following will be horribly inaccurate
			st : g * 0.000157473 };
	},
	lb : function ( lb ) {
		return {
			g : lb * 453.592,
			st : lb * 0.0714286 };
	},
	//stones: 1st = 6350g = 14lb
	st : function ( st ) {
		return {
			g : st * 6350.29,
			lb : st * 14 };
	},

	//kg: 1g = 1kg * 1000
	kg : function ( kg ) {
		return converters.g( kg * 1000 );
	}
};

var longNames = {
	lbs : 'lb',
	ft : 'f',
	foot : 'f',
	metres : 'm',
	millimetres : 'mm',
	killometres : 'km',
	degrees : 'd',
	radians : 'r',
	grams : 'g',
	kilograms : 'kg',
	inches : 'i',
	stones : 'st',
};

var currencies, symbols; //to be filled in next line by build
/* acquired by going to google.com/finance/converter and running
JSON.stringify([].map.call(f.from.options, function (e) { return e.value; }, {}), null, 4)
for some reason, NIS (New Israeli Shekel) does not appear there, only ILS,
despite Google accepting both. it was added manually
*/
currencies = Object.TruthMap([
    "AED",
    "ANG",
    "ARS",
    "AUD",
    "BDT",
    "BGN",
    "BHD",
    "BND",
    "BOB",
    "BRL",
    "BWP",
    "CAD",
    "CHF",
    "CLP",
    "CNY",
    "COP",
    "CRC",
    "CZK",
    "DKK",
    "DOP",
    "DZD",
    "EEK",
    "EGP",
    "EUR",
    "FJD",
    "GBP",
    "HKD",
    "HNL",
    "HRK",
    "HUF",
    "IDR",
    "ILS",
    "INR",
    "JMD",
    "JOD",
    "JPY",
    "KES",
    "KRW",
    "KWD",
    "KYD",
    "KZT",
    "LBP",
    "LKR",
    "LTL",
    "LVL",
    "MAD",
    "MDL",
    "MKD",
    "MUR",
    "MVR",
    "MXN",
    "MYR",
    "NAD",
    "NGN",
    "NIO",
    "NIS",
    "NOK",
    "NPR",
    "NZD",
    "OMR",
    "PEN",
    "PGK",
    "PHP",
    "PKR",
    "PLN",
    "PYG",
    "QAR",
    "RON",
    "RSD",
    "RUB",
    "SAR",
    "SCR",
    "SEK",
    "SGD",
    "SKK",
    "SLL",
    "SVC",
    "THB",
    "TND",
    "TRY",
    "TTD",
    "TWD",
    "TZS",
    "UAH",
    "UGX",
    "USD",
    "UYU",
    "UZS",
    "VEF",
    "VND",
    "XOF",
    "YER",
    "ZAR",
    "ZMK"
]);
symbols = {
    //euro €
    "\u20ac" : "EUR",

    //pound sterling £
    "\u00a3" : "GBP",
    //pound sterling ₤
    "\u20a4" : "GBP",

    //indian rupee ₨ (common)
    "\u20a8" : "INR",
    //indian rupee ₹ (official)
    "\u20b9" : "INR",

    //yen ¥
    '\u00a5' : "JPY",
    //double-width yen ￥
    '\uffe5' : "JPY",

    //israeli shekels ₪
    "\u20aa" : "ILS",

    //united states dollar $
    "\u0024" : "USD",
};


function unalias ( unit ) {
	var up = unit.toUpperCase();
	if ( symbols.hasOwnProperty(up) ) {
		return symbols[ up ];
	}
	if ( longNames.hasOwnProperty(unit) ) {
		return longNames[ unit ];
	}

	return unit;
}

/*
  (        #start number matching
   -?      #optional negative
   \d+     #the integer part of the number
   \.?     #optional dot for decimal portion
   \d*     #optional decimal portion
  )
  \s*      #optional whitespace, just 'cus
  (        #start unit matching
   \S+     #the unit. we don't know anyhing about it, besides having no ws
  )
  (        #begin matching optional target unit (required for currencies)
    \s+
    (?:
     (?:
      to|in #10 X to Y, 10 X in Y
     )
     \s+
    )?
    (\S+)  #the unit itself
  )?
 */
var rUnits = /(-?\d+\.?\d*)\s*(\S+)(\s+(?:(?:to|in)\s+)?(\S+))?$/;

//string is in the form of:
// <number><unit>
// <number><unit> to|in <unit>
//note that units are case-sensitive: F is the temperature, f is the length
var convert = function ( inp, cb ) {
	if ( inp.toLowerCase() === 'list' ) {
		finish( listUnits().join(', ') );
		return;
	}

	var parts = rUnits.exec( inp );

	if ( !parts ) {
		finish( {error : 'Unidentified format; please see `/help convert`'} );
		return;
	}

	var num = Number( parts[1] ),
		unit = parts[ 2 ],
		target = parts[ 4 ] || '',
		moneh = false;
	bot.log( num, unit, target, '/convert input' );

	unit   = unalias( unit );
	target = unalias( target );
	if ( currencies[unit.toUpperCase()] ) {
		moneh = true;
	}

	if ( moneh ) {
		moneyConverter.convert( num, unit, target, finish );
	}
	else {
		convertUnit( num, unit, finish );
	}

	function finish ( res ) {
		bot.log( res, '/convert answer' );

		var reply;
		// list was passed
		if ( res.substr ) {
			reply = res;
		}
		//an error occured
		else if ( res.error ) {
			reply = res.error;
		}
		//just a normal result
		else {
			reply = format( res );
		}

		if ( cb && cb.call ) {
			cb( reply );
		}
		else {
			inp.reply( reply );
		}
	}

	function format ( res ) {
		var keys = Object.keys( res );

		if ( !keys.length ) {
			return 'Could not convert {0} to {1}'.supplant( unit, target );
		}
		return keys.filter( nameGoesHere ).map( formatKey ).join( ', ' );

		function nameGoesHere ( key ) {
			return !target || target === key;
		}
		function formatKey ( key ) {
			return res[ key ].maxDecimal( 4 ) + key;
		}
	}
};

function convertUnit ( number, unit, cb ) {
	bot.log( number, unit, '/convert unit broken' );

	if ( !converters[unit] ) {
		cb({
			error:'Confuse converter with ' + unit + ', receive error message'
		});
	}
	else {
		cb( converters[unit](number) );
	}
}

var moneyConverter = {
	ratesCache : {},

	convert : function ( number, from, to, cb ) {
		this.from = from;
		this.to = to;

		this.upFrom = from.toUpperCase();
		this.upTo = to.toUpperCase();

		var err = this.errorMessage();
		if ( err ) {
			cb( { error : err } );
			return;
		}
		bot.log( number, from, to, '/convert money broken' );

		this.getRate(function ( rate ) {
			var res = {}; //once again, the lack of dynamic key names sucks.
			res[ to ] = number * rate;

			cb( res );
		});
	},

	getRate : function ( cb ) {
		var self = this,
			rate;

		if ( rate = this.checkCache() ) {
			cb( rate );
			return;
		}

		IO.jsonp({
			url : 'http://rate-exchange.appspot.com/currency',
			jsonpName : 'callback',
			data : {
				from : self.from,
				to : self.to
			},
			fun : finish
		});

		function finish ( resp ) {
			rate = resp.rate;

			self.updateCache( rate );
			cb( rate );
		}
	},

	updateCache : function ( rate ) {
		this.ratesCache[ this.upFrom ] = this.ratesCache[ this.upFrom ] || {};
		this.ratesCache[ this.upFrom ][ this.upTo ] = {
			rate : rate,
			time : Date.now()
		};
	},

	checkCache : function () {
		var now = Date.now(), obj;

		var exists = (
			this.ratesCache[ this.upFrom ] &&
				( obj = this.ratesCache[this.upFrom][this.upTo] ) &&
				//so we won't request again, keep it in memory for 5 hours
				// 5(hours) = 1000(ms) * 60(seconds)
				//            * 60(minutes) * 5 = 18000000
				obj.time - now <= 18e6 );

		console.log( this.ratesCache, exists );

		return exists ? obj.rate : false;
	},

	errorMessage : function () {
		if ( !this.to ) {
			return 'What do you want to convert ' + this.from + ' to?';
		}
		if ( !currencies[this.upTo] ) {
			return this.to + ' aint no currency I ever heard of';
		}
	}
};

function listUnits () {
	return Object.keys( converters );
}

bot.addCommand({
	name : 'convert',
	fun : convert,
	permissions : {
		del : 'NONE'
	},
	description : 'Converts several units and currencies, case sensitive. '+
		'`/convert <num><unit> [to|in <unit>]` ' +
		'Pass in list for supported units `/convert list`',
	async : true
});
}());

;
var cowsay = (function () {
"use strict";

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

		this.message  = wordWrap( message, opts.W || defs.W ).trim();

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
		var lines = this.message.split( '\n' );

		var longest = lines.reduce( longestLine, 0 ),
			lineCount = lines.length,
			border = this.chooseBorders( lineCount );

		var balloon = lines.map( baloonLine );
		var boundaryOccurences = new Array( longest + 2 );
		balloon.unshift( ' ' + boundaryOccurences.join('_') );
		balloon.push   ( ' ' + boundaryOccurences.join('-') );

		return balloon.join( '\n' );

		function baloonLine ( line, idx ) {
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
				padders = border.slice( 2 );
			}

			//return the message, padded with spaces to the right as to fit
			// with the border, enclosed in the matching borders
			return (
				padders[ 0 ] + ' ' +
				rightPad( line, longest ) + ' ' +
				padders[ 1 ]
			);
		}
		function longestLine ( max, line ) {
			return line.length > max ? line.length : max;
		}
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
	return ( str + Array(len).join(padder) ).slice( 0, len );
}


return cowsay;
}());

bot.listen(
	/cow(think|say)\s(?:([eT])=(.{0,2})\s)?(?:([eT])=(.{0,2})\s)?(.+)/,

	function ( msg ) {
		//the first item is the whole match, second item is the "think" or
		// "say", last item is the message, we only want the "parameters"
		var opts = getOpts( msg.matches.slice(2, -1) );

		//cowsay or cowthink?
		opts.t = msg.matches[ 1 ] === 'think';
		bot.log( opts, 'cowsay opts' );

		var cowreact = cowsay.moo( msg.matches.pop(), opts );
		msg.send( msg.codify(cowreact) );

		function getOpts ( args ) {
			var ret = {};
			//'e=^^ T=vv would represent in capturing groups as:
			// ['e', '^^', 'T', 'vv']
			//so we go through the pairs
			for ( var i = 0, len = args.length; i < len; i += 2 ) {
				if ( args[i] && args[i+1] ) {
					ret[ args[i] ] = args[ i + 1 ];
				}
			}

			return ret;
		}
	}
);

;
(function () {
"use strict";
//this and the history.js file are nearly identical, as they both manually have
// to grab and parse from the wikimedia API

var notFoundMsgs = [
	'No definition found.',
	'It means I aint got time to learn your $5 words',
	'My pocket dictionary just isn\'t good enough for you.'
];

var define = {
	command : function defineCommand ( args, cb ) {
		bot.log( args, '/define input' );
		this.fetchData( args, finish );

		function finish ( results, pageid ) {
			bot.log( results, '/define results' );
			//TODO: format. so far we just be lazy and take the first one
			var res = results[ 0 ];

			if ( !res ) {
				res = notFoundMsgs.random();
			}
			else {
				res = bot.adapter.link(
					args, 'http://en.wiktionary.org/wiki?curid=' + pageid
				) + ' ' + res;
			}

			if ( cb && cb.call ) {
				cb( res );
			}
			else {
				args.reply( res );
			}
		}
	},

	handleResponse : function ( resp, cb ) {
		var query = resp.query,
			pageid = query.pageids[ 0 ],
			html = query.pages[ pageid ].extract;

		if ( pageid === '-1' ) {
			cb( [], -1 );
			return;
		}

		var root = document.createElement( 'body' );
		root.innerHTML = html; //forgive me...

		//the first ol has all the data we need
		cb( getEvents(root.getElementsByTagName('ol')[0]), pageid );
	},

	fetchData : function ( term, cb ) {
		var self = this;

		IO.jsonp({
			url : 'http://en.wiktionary.org/w/api.php',
			jsonpName : 'callback',
			data : {
				action : 'query',
				titles : term.toString(),
				format : 'json',
				prop : 'extracts',
				indexpageids : true
			},
			fun : function ( resp ) {
				self.handleResponse( resp, cb );
			}
		});
	}
};

//example of partial extract:
/*
  <h2> Translingual</h2>\n\n
  <p>Wikipedia</p>\n
  <h3> Symbol</h3>\n
  <p><b>42</b> (<i>previous</i>  <b>41</b>, <i>next</i>  <b>43</b>)</p>\n
  <ol>
      <li>The cardinal number forty-two.</li>\n</ol>
*/
//we just want the li data
function getEvents ( root, stopNode ) {
	var matches = [];

	(function filterEvents (root) {
		var node = root.firstElementChild;

		for (; node; node = node.nextElementSibling) {
			if (node === stopNode) {
				return;
			}
			else if (node.tagName !== 'LI' ) {
				continue;
			}

			matches.push( node );
		}
	})( root );

	//we need to flatten out the resulting elements, and we're done!
	return flatten(matches);
}
function flatten ( lis ) {
	return [].map.call( lis, extract );

	function extract ( li ) {
		return li.firstChild.data;
	}
}

bot.addCommand({
	name : 'define',
	fun : define.command,
	thisArg : define,
	permissions : {
		del : 'NONE'
	},

	description : 'Fetches definition for a given word. `/define something`',
	async : true
});
}());

;
//listener to help decide which Firefly episode to watch

bot.listen( /(which |what |give me a )?firefly( episode)?/i, function ( msg ) {
	var names = ["Serenity", "The Train Job", "Bushwhacked", "Shindig", "Safe", "Our Mrs. Reynolds", "Jaynestown", "Out of Gas", "Ariel", "War Stories", "Trash", "The Message", "Heart of Gold", "Objects in Space"];

	//no mention of episode, 5% chance of getting the movie
	if ( msg.indexOf('episode') === -1 && Math.random() < 0.05 ) {
		return 'Serenity (movie)';
	}

	var r = Math.floor(Math.random() * 14);
	return 'Episode {0} - {1}'.supplant(r + 1, names[r]);
});

;
(function () {
//they made me make it. I begged them not to.

//obligatories
var special = {
	'your mom' : ['Your mom is always open for business.'],
	'your sister' : ['Your sister is too busy right now.'],
	//hey, the last two lines aligned! together with the bodies...
	//erm, what?

	//the help message explicitly says age, though...
	'age' : ['For you? Never.']
};
var template = 'A person that age can shag down to {lower}, '+
	'and is the lower limit of a person of {higher} years.';

function fuckable ( args ) {
	var possibleName = args.toString().toLowerCase();

	if ( special[possibleName] ) {
		return special[ possibleName ].random();
	}

	//try and find a user with the same name as the argument
	var userId = Object.keys( bot.users ).first(function ( id ) {
		return bot.users[ id ].name.toLowerCase() === possibleName;
	});

	//we found a match. you're a daddy!
	if ( userId && Math.random() < 0.8 ) {
		//the perverts
		if ( Number(userId) === bot.adapter.user_id ) {
			return 'Keep dreaming';
		}

		return 'Why don\'t we ask ' + bot.adapter.reply( args ) + '?';
	}

	var age = Number( args );

	if ( !age || age < 0 ) {
		return 'This is srs bsns, please treat it as such' +
			' (see `/help fuckable`).';
	}

	var ret = '';
	if ( age < 14 ) {
		ret += 'You\'re one sick puppy. ';
	}

	var fuckee = age / 2 + 7,
	fucker = 2 * age - 14,
	wrapper = {};

	//the equation is:
	// fuckee = fucker / 2 + 7
	//now, we want fuckee <= fucker. this condition is not met when fucker < 14:
	// fuckee = 13 / 2 + 7 = 13.5 > 13
	//so, if age < 14, we flip the two to meet the condition.
	wrapper.higher = ( age > 14 ? fucker : fuckee );
	wrapper.lower  = ( age > 14 ? fuckee : fucker );

	return ret + template.supplant( wrapper );
}

bot.addCommand({
	name : 'fuckable',
	fun : fuckable,
	permissions : {
		del : 'NONE'
	},

	description : 'Calculates the lower boundary according to age/2+7 rule.' +
		' `/fuckable age`'
});

})();

;
(function () {
var types = {
	answer   : true,
	question : true };
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

function get ( args, cb ) {
	//default:
	// /get type range usrid
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

	var url = 'http://api.stackexchange.com/2.1/users/' + usrid + '/' + plural;
	var params = {
		site : bot.adapter.site,
		sort : 'creation',
		//basically, only show answer/question id and their link
		filter : '!BGS1(RNaKd_71l)9SkX3zg.ifSRSSy'
	};

	bot.log( url, params, '/get building url' );

	if ( range === 'between' ) {
		params.fromdate = Date.parse( parts[2] );
		params.todate = Date.parse( parts[3] );

		bot.log( url, params, '/get building url between' );
	}

	IO.jsonp({
		url  : url,
		data : params,
		fun  : parseResponse
	});

	function parseResponse ( respObj ) {
		//Une erreru! L'horreur!
		if ( respObj.error_message ) {
			args.reply( respObj.error_message );
			return;
		}

		//get only the part we care about in the result, based on which one
		// the user asked for (first, last, between)
		//respObj will have an answers or questions property, based on what we
		// queried for, in array form
		var posts = [].concat( ranges[range](respObj.items) ),
			res;

		bot.log( posts.slice(), '/get parseResponse parsing' );

		if ( posts.length ) {
			res = makeUserResponse( posts );
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

	function makeUserResponse( posts ) {
		return posts.map(function ( post ) {
			return post.link;
		}).join ( ' ; ');
	}
}

bot.addCommand({
	name : 'get',
	fun  : get,
	permissions : {
		del : 'NONE'
	},
	async : true
});

}());

;
// issue #51 https://github.com/Zirak/SO-ChatBot/issues/51

//valid args are one of the following:
// /github reponame
//which searches for a repository `reponame`
// /github username/reponame
//which searches for a repository `reponame` under `username`
var github = {

	command : function ( args, cb ) {
		var parts = /^([\S]+?)(?:\/([\S]+))?$/.exec( args ),
			format = this.formatCb( finish );

		bot.log( parts, '/github input' );

		if ( !parts ) {
			finish( 'I can\'t quite understand that format. ' +
					'See `/help github` for, well...help.' );
		}
		else if ( !parts[2] ) {
			this.searchRepo( parts[1], format );
		}
		else {
			this.searchUserRepo( parts[1], parts[2], format );
		}

		function finish ( res ) {
			bot.log( res, '/github finish' );

			if ( cb && cb.call ) {
				cb( res );
			}
			else {
				args.reply( res );
			}
		}
	},

	formatCb : function ( cb ) {
		var repoFullName = '{owner}/{name}';

		return function format ( repo ) {
			if ( repo.error ) {
				cb( repo.error );
				return;
			}

			//there are inconsistensies between the data returned from one
			// API call and another. there're two important ones here:
			//1. we have a full repo name (user/repoName) in one, but not
			//     the other (and different property names can be used to
			//     construct it)
			//2. the link to the repo is called html_url in one, and
			//      url in the other (in the former, url means something else)
			var fullName = repo.full_name ?
				repo.full_name : repoFullName.supplant( repo ),
				url = repo.html_url || repo.url;

			cb(
				bot.adapter.link(fullName, url ) + ' ' + repo.description
			);
		};
	},

	searchRepo : function ( repoName, cb ) {
		var keyword = encodeURIComponent( repoName );

		IO.jsonp({
			url : 'https://api.github.com/legacy/repos/search/' + keyword,
			jsonpName : 'callback',

			fun : finish
		});

		function finish ( resp ) {
			bot.log( resp, '/github searchRepo response' );
			var repo = resp.data.repositories[ 0 ];

			if ( !repo ) {
				repo = {
					error : 'No results found'
				};
			}

			cb( repo );
		}
	},

	searchUserRepo : function ( userName, repoName, cb ) {
		var keyword = encodeURIComponent( userName );
		repoName = encodeURIComponent(
			repoName.replace( / /g, '-' ).toLowerCase() );

		var url = 'https://api.github.com/repos/{0}/{1}';
		IO.jsonp({
			url : url.supplant( keyword, repoName ),
			jsonpName : 'callback',

			fun : finish
		});

		function finish ( resp ) {
			bot.log( resp, '/github searchUserRepo response' );

			var data = resp.data;

			if ( data.message === 'Not Found' ) {
				data = {
					error : 'User/Repo not found'
				};
			}

			cb( data );
		}
	}
};

bot.addCommand({
	name : 'github',
	fun  : github.command,
	thisArg : github,
	permissions : {
		del : 'NONE'
	},
	description : 'Search github for a repo.' +
		'`/github repoName` or `/github username/reponame`',
	async : true
});

;

;
(function () {
var nulls = [
	'The Google contains no such knowledge',
	'There are no search results. Run.',
	'My Google Fu has failed.'];

function google ( args, cb ) {
	IO.jsonp.google( args.toString() + ' -site:w3schools.com', finishCall );

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

		if ( !results.length ) {
			finish( nulls.random() );
			return;
		}
		finish( format(args.content, results) );
	}

	function format ( query, results ) {
		var res = formatLink( query ) + ' ' +
			results.map( formatResult ).join( ' ; ' );

		if ( res.length > 200 ) {
			res = results.map(function (r) {
				return r.unescapedUrl;
			}).join( ' ; ' );
		}

		return res;
	}

	function formatResult ( result ) {
		var title = IO.decodehtmlEntities( result.titleNoFormatting );
		return args.link( title, result.unescapedUrl );
	}
	function formatLink ( query ) {
		return args.link(
			'*',
			'http://google.com/search?q=' +
				encodeURIComponent( query ) );
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
"use strict";

var randomWord = function ( length, cb ) {
	var url = 'http://sleepy-bastion-8674.herokuapp.com/';

	if ( Number(length) ) {
		url += '?length=' + length;
	}

	IO.jsonp({
		url : url,
		jsonpName : 'callback',
		fun : complete //aaawwww yyeeaaahhhh
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

	validGuessRegex : /^[a-zA-Z]+$/,

	receiveMessage : function ( msg ) {
		this.msg = msg;

		if ( this.end ) {
			this.new( msg );
		}
		else {
			return this.handleGuess( msg );
		}
	},

	new : function ( msg ) {
		var self = this;
		randomWord( msg, finish );

		function finish ( word ) {
			bot.log( word + ' /hang random' );
			game.word = word;
			self.revealed = new Array( word.length + 1 ).join( '-' );
			self.guesses = [];
			self.guessNum = 0;

			//oh look, another dirty hack...this one is to make sure the
			// hangman is codified
			self.guessMade = true;
			self.register();

			if ( msg.length && !Number(msg) ) {
				self.receiveMessage( msg );
			}
		}
	},

	handleGuess : function ( msg ) {
		var guess = msg.slice().toLowerCase();
		bot.log( guess, 'handleGuess' );

		var err = this.checkGuess( guess );
		if ( err ) {
			return err;
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

		bot.log( guess, 'handleGuess handled' );

		//plain vanilla lose-win checks. yum yum yum.
		if ( this.loseCheck() ) {
			return this.lose();
		}
		if ( this.winCheck() ) {
			return this.win();
		}
	},

	checkGuess : function ( guess ) {
		if ( !guess.length || Number(guess) ) {
			return 'We\'re already playing!';
		}

		if ( !this.validGuessRegex.test(guess) ) {
			return 'I will only accept alpha characters';
		}

		//check if it was already submitted
		if ( this.guesses.indexOf(guess) > -1 ) {
			return guess + ' was already submitted';
		}

		//or if it's the wrong length
		if ( guess.length > this.word.length ) {
			return bot.adapter.codify( guess ) + ' is too long to fit';
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
		var self = this;

		//replace the placeholders in the dude with body parts
		var dude = this.dude.replace( /\d/g, function ( part ) {
			return part > self.guessNum ? ' ' : self.parts[ part ];
		});

		var belowDude = this.guesses.sort().join( ', ' ) +
			'\n' + this.revealed;
		var hangy = this.msg.codify( dude + '\n' + belowDude );

		bot.log( hangy, this.msg );
		this.msg.send( hangy );
	},

	//win the game
	win : function () {
		this.unregister();
		return 'Correct! The word is ' + this.word + '.';
	},

	//lose the game. less bitter messages? maybe.
	lose : function () {
		this.unregister();
		return 'You people suck. The word is ' + this.word;
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
"use strict";

var history = {
	command : function historyCommand ( args, cb ) {
		var params = this.extractParams( args );

		if ( params.error ) {
			return params.error;
		}

		this.fetchData( params, finish );

		function finish ( results ) {
			var res = results.random();

			if ( cb && cb.call ) {
				cb( res );
			}
			else {
				args.reply( res );
			}
		}
	},

	handleResponse : function ( resp, params, cb ) {
		var html = resp.parse.text,
			root = document.createElement( 'body' );
		root.innerHTML = html; //forgive me

		var events = getEventsAsText( root );

		cb( this.filter(events, params) );
	},

	extractParams : function ( args ) {
		var ret = {},
			date;

		if ( !args.length || args.toLowerCase() === 'today' ) {
			date = new Date();

			ret.month = date.getMonth() + 1;
			ret.day = date.getDate();
			return ret;
		}

		var parts;

		//simple YYYY
		if ( parts = /^\d{4}$/.exec(args) ) {
			ret.year = Number( parts[0] );
		}
		else if (
			parts = /^(?:(\d{4})(?:-|\/))?(\d{2})(?:-|\/)(\d{2})$/.exec( args )
		) {
			parts[1] && ( ret.year = Number(parts[1]) );
			ret.month = Number( parts[2] );
			ret.day = Number( parts[3] );
		}
		else {
			return error();
		}

		bot.log( ret, '/inhistory extractParams' );

		if ( !this.paramsCheck(ret) ) {
			return error();
		}
		return ret;

		function error () {
			return {
				error : 'That format confuses me! See `/help inhistory`'
			};
		}
	},

	paramsCheck : function ( params ) {
		var year  = params[ year ],
			month = params[ month ],
			day   = params[ day ];

		//fuck this shit, I have nowhere else to put it
		if ( month === 2 && day > 29 ) {
			return false;
		}

		//we're not very picky, since wikipedia may contain future dates
		var yearCheck = year === undefined || year > 0;
		var monthCheck = month === undefined || (
			month >= 1 && month <= 12
		);
		var dayCheck = day === undefined || (
			day >= 1 && day <= 31
		);

		return yearCheck && monthCheck && dayCheck;
	},

	filter : function ( events, params ) {
		//we only need to apply filtering for YYYY-MM-DD, not for MM-DD or YYYY
		if ( !params.year || !params.month ) {
			return events;
		}

		//limit to only the parameter year
		return events.filter(function ( data ) {
			var year = ( /^\d+/.exec(data) || [] )[ 0 ];

			return Number( year ) === params.year;
		});
	},

	fetchData : function ( params, cb ) {
		var titles = [];

		if ( params.year && !params.month ) {
			titles = [ params.year ];
		}
		else {
			titles = [ this.monthName(params.month), params.day ];
		}

		var url = 'http://en.wikipedia.org/w/api.php';

		var self = this;
		IO.jsonp({
			url : url,
			jsonpName : 'callback',
			data : {
				format : 'json',
				action : 'parse',
				mobileformat : 'html',
				prop : 'text',
				page : titles.join( ' ' )
			},
			fun : function ( resp ) {
				self.handleResponse( resp, params, cb );
			}
		});
	},

	monthName : function ( month ) {
		return [
			'january', 'february', 'march', 'april',
			'may', 'june', 'july', 'august',
			'september', 'october', 'november', 'december'
		][ month - 1 ];
	}
};

// http://tinker.io/53895
function getEventsAsText ( root ) {
	var linkBase = 'http://en.wikipedia.org';

	/*
	  the html looks like:
	  <h2 class="section_heading" id="section_1"><span id="Events">Events</span></h2>
	  <div class="content_block" id="content_1">
	    ...
	  </div>
	*/
	//fun fact: document-fragments don't have a getElementById, so we're left to
	// use querySelector. which is totally the way to do it.
	var lists = root.querySelectorAll('#content_1 > ul');

	/*
	  <li>
	    <a href="/wiki/January_5" title="January 5">January 5</a> –
	    <a href="/wiki/Emperor_Go-Sai" title="Emperor Go-Sai">Emperor Go-Sai</a>ascends the throne of <a href="/wiki/Japan" title="Japan">Japan</a>.
	  </li>
	*/
	//however, there are also multi-tiered results:
	/*
	  <li>
	    <a href="/wiki/July_27" title="July 27">July 27</a>

		<ul>
		  <li>The Jews in <a href="/wiki/New_Amsterdam" title="New Amsterdam">New Amsterdam</a> petition for a separate Jewish cemetery.
		  </li>

		  <li>The <a href="/wiki/Netherlands" title="Netherlands">Netherlands</a> and <a href="/wiki/Brandenburg" title="Brandenburg">Brandenburg</a> sign a military treaty.
		  </li>
		</ul>
	  </li>
	*/

	var ret = [];
	for (var i = 0, len = lists.length; i < len; i += 1) {
		ret.push.apply( ret, flattenList(lists[i]) );
	}
	return ret;

	function flattenList ( list ) {
		return Array.map( list.children, extract );

		function extract ( li ) {
			var links = li.getElementsByTagName( 'a' );
			while ( links.length ) {
				replaceLink( links[0] );
			}

			return Array.reduce( li.childNodes, extractFromLi, [] )
				.join( '' ).trim();
		}

		function extractFromLi ( ret, node ) {
			if ( node.tagName === 'UL' ) {
				ret.push.apply(
					ret,
					flattenList( node ).map(function ( t ) {
						return node.firstChild.data + ' – ' + t;
					}) );
			}
			else if ( node.nodeType === 1 ) {
				ret.push( node.textContent );
			}
			else {
				ret.push( node.data );
			}

			return ret;
		}

		function replaceLink ( link ) {
			var textLink = bot.adapter.link(
				link.textContent, linkBase + link.getAttribute('href')
			),
				textNode = document.createTextNode( textLink );

			link.parentNode.replaceChild( textNode, link );
		}
	}
}

bot.addCommand({
	name : 'inhistory',
	fun : history.command,
	thisArg : history,
	permissions : {
		del : 'NONE'
	},

	description : 'Grabs a historical event from today\'s date or a date ' +
		'given in MM-DD format. `/inhistory [MM-DD]`',
	async : true
});

})();

;
(function () {
"use strict";
var parse = bot.getCommand( 'parse' );
var storage = bot.memory.get( 'learn' );

var replyPatterns = /^(<>|<user>|<msg>)/i,
	onlyReply = new RegExp( replyPatterns.source + '$', 'i' );

function learn ( args ) {
	bot.log( args, '/learn input' );

	var commandParts = args.parse();
	var command = {
		name   : commandParts[ 0 ],
		output : commandParts[ 1 ],
		input  : commandParts[ 2 ] || '.*',
		//meta info
		creator: args.get( 'user_name' ),
		date   : new Date()
	};
	command.description = [
		'User-taught command:',
		commandParts[3] || '',
		args.codify( command.output )
	].join( ' ' );

	//a truthy value, unintuitively, means it isn't valid, because it returns
	// an error message
	var errorMessage = checkCommand( command );
	if ( errorMessage ) {
		return errorMessage;
	}
	command.name = command.name.toLowerCase();
	command.input = new RegExp( command.input );

	bot.log( command, '/learn parsed' );

	addCustomCommand( command );
	saveCommand( command );

	return 'Command ' + command.name + ' learned';
}

function addCustomCommand ( command ) {
	var cmd = bot.Command({
		//I hate this duplication
		name : command.name,

		description : command.description,
		creator : command.creator,
		date : command.date,

		fun : makeCustomCommand( command ),
		permissions : {
			use : 'ALL',
			del : 'ALL'
		}
	});
	cmd.learned = true;

	cmd.del = (function ( old ) {
		return function () {
			deleteCommand( command.name );
			old.call( cmd );
		};
	}( cmd.del ));

	bot.log( cmd, '/learn addCustomCommand' );
	bot.addCommand( cmd );
}
function makeCustomCommand ( command ) {
	var output = command.output.replace( replyPatterns, '' ).trim(),
		replyMethod = extractPattern();

	bot.log( command, '/learn makeCustomCommand' );

	return function ( args ) {
		bot.log( args, command.name + ' input' );

		var cmdArgs = bot.Message( output, args.get() ),
			res = parse.exec( cmdArgs, command.input.exec(args) );

		switch ( replyMethod ) {
		case '':
			args.send( res );
			break;
		case 'msg':
			args.directreply( res );
			break;
		default:
			args.reply( res );
		}
	};

	function extractPattern () {
		var matches = replyPatterns.exec( command.output ) || [ , 'user' ],
			pattern =  matches[ 1 ];

		return pattern.slice(1, -1);
	}
}

//return a truthy value (an error message) if it's invalid, falsy if it's
// valid
function checkCommand ( cmd ) {
	var somethingUndefined = Object.keys( cmd ).some(function ( key ) {
		return !cmd[ key ];
	}),
		error;

	if ( somethingUndefined ) {
		error = 'Illegal /learn object; see `/help learn`';
	}
	//not very possible, I know, but...uh...yes. definitely. I agree. spot on,
	// Mr. Pips.
	else if ( /\s/.test(cmd.name) ) {
		error = 'Invalid command name';
	}
	else if ( !canWriteTo(cmd.name) ) {
		error = 'Command ' + cmd.name + ' already exists';
	}
	else if ( onlyReply.test(cmd.output) ) {
		error = 'Please enter some output';
	}

	return error;

	function canWriteTo ( name ) {
		if ( !bot.commandExists(name) ) {
			return true;
		}

		//if the command was learned up to 5 minutes ago, allow overwriting it
		var alt = bot.getCommand( name );
		return alt.learned &&
			( alt.date.getTime() + 1000 * 60 * 5 ) > Date.now();
	}
}

function loadCommands () {
	Object.iterate( storage, teach );

	function teach ( key, cmd ) {
		cmd = JSON.parse( cmd );
		cmd.input = turnToRegexp( cmd.input );
		cmd.date = new Date( Date.parse(cmd.date) );

		addCustomCommand( cmd );
	}

	//input: strung regexp, e.g. /abc/i
	//return: regexp
	//algo: we split by /.
	//  the first item is empty, the part before the first /
	//  the second to second-before-last are the regexp body. there will be more
	//    than one item in that range if the regexp contained escaped slashes,
	//    like /abc\/def/
	//  the last item is the flags (or the empty string, if no flags are set)
	function turnToRegexp ( input ) {
		var parts = input.toString().split( '/' );
		return new RegExp(
			parts.slice( 1, -1 ).join( '/' ), //to compensate for escaped /
			parts[ parts.length-1 ]
		);
	}
}
function saveCommand ( command ) {
	//h4x in source/util.js defines RegExp.prototype.toJSON so we don't worry
	// about the input regexp stringifying
	storage[ command.name ] = JSON.stringify( command );
	bot.memory.save( 'learn' );
}
function deleteCommand ( name ) {
	delete storage[ name ];
	bot.memory.save( 'learn' );
}

bot.addCommand({
	name : 'learn',
	fun  : learn,
	privileges : {
		del : 'NONE'
	},

	description : 'Teaches me a command. ' +
		'`/learn cmdName outputPattern [inputRegex [description]]`'
});

loadCommands();
}());

;
(function () {
"use strict";

var unexisto = 'User {0} was not found (if the user is not in room {1}, pass ' +
		'a user-id instead of a username).';

function mustachify ( args ) {
	var usrid = args.content;

	//check for url passing
	if ( linkCheck(usrid) ) {
		finish( encodeURIComponent(usrid) );
		return;
	}

	if ( !usrid ) {
		usrid = args.get( 'user_id' );
	}
	else if ( /\D/.test(usrid) ) {
		usrid = args.findUserid( usrid );
	}

	bot.log( usrid, '/mustache mapped' );

	if ( usrid < 0 || !bot.users.hasOwnProperty(usrid) ) {
		return unexisto.supplant( usrid, bot.adapter.roomid );
	}
	else if ( Number(usrid) === bot.adapter.user_id ) {
		return [
			'Nobody puts a mustache on me. Again.',
			'Mustache me once, shame on you. Mustache me ---twice--- 12 times...'
		].random();
	}

	var hash = bot.users[ usrid ].email_hash;
	//SO now allows non-gravatar images. the email_hash will be a link to the
	// image in that case, prepended with a ! for some reason
	if ( hash[0] === '!' ) {
		finish( encodeURIComponent(hash.slice(1)) + '#.png' );
	}
	else {
		finish(
			'http%3A%2F%2Fwww.gravatar.com%2Favatar%2F{0}%3Fs%3D256%26d%3Didenticon#.png'.supplant(hash) );
	}

	function finish ( src ) {
		bot.log( src, '/mustache finish' );

		args.directreply(
			'http://mustachify.me/?src=' + src );
	}
}

function linkCheck ( suspect ) {
	return suspect.startsWith( 'http' ) || suspect.startsWith( 'www' );
}

bot.addCommand({
	name : 'mustache',
	fun : mustachify,
	privileges : {
		del : 'NONE'
	},

	description : 'Mustachifies a user. `/mustache [link|usrid|user name]`'
});

}());

;
(function () {
//I wish you could use `default` as a variable name
var def = {
	895174 : [
		'sbaaaang', 'badbetonbreakbutbedbackbone',
		'okok', 'donotusetabtodigitthisnick' ]
};

var tracking = bot.memory.get( 'tracker', def );
var message = '*→ {0} (also known as {1}) changed his name to {2}*',
	messageNoAlias = '*→ {0} changed his name to {2}*';

IO.register( 'userregister', function tracker ( user, room ) {
	var names = tracking[ user.id ];

	if ( !names ) {
		return;
	}
	if ( names[0].toLowerCase() === user.name.toLowerCase() ) {
		return;
	}

	bot.log( user, names, 'tracking found suspect' );

	var userLink = bot.adapter.link(
		names[0],
		IO.relativeUrlToAbsolute( '/users/' + user.id ) );

	var outFormat = names.length > 1 ? message : messageNoAlias,
		out = outFormat.supplant(
			userLink, names.slice(1), user.name );

	bot.adapter.out.add( out, room );
	names.unshift( user.name );
});

})();

;

;
(function () {

//collection of nudges; msgObj, time left and the message itself
var nudges = [],
	interval = 100 * 60;

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
	bot.log( nudge, 'nudge fire' );
	//check to see if the nudge was sent after a bigger delay than expected
	//TODO: that ^
	nudge.msg.reply( nudge.message );
}
setTimeout( update, interval );

//now for the command itself
function addNudge ( delay, message, msgObj ) {
	var inMS;
	bot.log( delay, message, '/nudge input' );

	//interval will be one of these (where n is a number):
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
		msg     : msgObj,
		message : '*nudge* ' + message,
		register: Date.now(),
		time    : inMS
	};
	nudges.push( nudge );
	bot.log( nudge, nudges, '/nudge register' );

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
	return addNudge( props[0], props.slice(1).join(' '), args );
}
function nudgeListener ( args ) {
	return addNudge( args.matches[1], args.matches[2], args );
}

}());

;
(function () {
"use strict";
var ownerRoom = 17;

if ( bot.adapter.roomid !== ownerRoom ) {
	return;
}

var muted = bot.memory.get( 'muted' );

function checkMuted () {
	var now = Date.now();

	Object.iterate( muted, function ( id, obj ) {
		if ( obj.endDate < now ) {
			giveVoice( id );
		}
	});

	setTimeout( checkMuted, 60 * 1000 );
}
setTimeout( checkMuted, 60 * 1000 );

function giveVoice ( id, cb ) {
	bot.log( 'giving voice to ' + id );

	IO.xhr({
		method : 'POST',
		url : '/rooms/setuseraccess/' + ownerRoom,
		data : {
			aclUserId : id,
			fkey : bot.adapter.fkey,
			userAccess : 'read-write'
		},

		complete : finish
	});

	function finish () {
		var args = [].slice.call( arguments );
		args.unshift( id );

		delete muted[ id ];

		if ( cb ) {
			bot.memory.save( 'muted' );
			cb && ( cb.apply(null, args) );
		}
	}
}
function takeVoice ( params, cb ) {
	bot.log( 'taking voice', params );

	IO.xhr({
		method : 'POST',
		url : '/rooms/setuseraccess/' + ownerRoom,
		data : {
			aclUserId : params.id,
			fkey : bot.adapter.fkey,
			userAccess : 'remove'
		},

		complete : finish
	});

	function finish () {
		muted[ params.id ] = {
			name : params.name,
			invokingId : params.invokingId,
			endDate : calcEndDate( params.duration ).getTime()
		};

		bot.memory.save( 'muted' );
		cb.apply( null, arguments );
	}

	function calcEndDate ( duration ) {
		var ret = new Date(),
			mod = duration.slice( -1 ),
			delta = Number( duration.slice(0, -1) );

		var modifiers = {
			m : function ( offset ) {
				ret.setMinutes( ret.getMinutes() + offset );
			},
			h : function ( offset ) {
				ret.setHours( ret.getHours() + offset );
			},
			d : function ( offset ) {
				ret.setDate( ret.getDate() + offset );
			}
		};
		modifiers[ mod ]( delta );

		return ret;
	}
}

IO.register( 'userregister', function permissionCb ( user, room ) {
	bot.log( user, room, 'permissionCb' );
	var id = user.id;

	if ( Number(room) !== ownerRoom || bot.isOwner(id) || muted[id] ) {
		bot.log( 'not giving voice', user, room );
		return;
	}

	giveVoice( id );
});

function stringMuteList () {
	var keys = Object.keys( muted );

	if ( !keys.length ) {
		return 'Nobody is muted';
	}

	var base = 'http://chat.stackoverflow.com/transcript/message/';

	return keys.map(function ( k ) {
		return bot.adapter.link( k, base + muted[k].invokingId );
	}).join( '; ' );
}

function userInfoFromParam ( param, args ) {
	var ret = {
		id : param
	};

	if ( /\D/.test(param) ) {
		ret.id = args.findUserid( param );
	}

	if ( ret.id < 0 ) {
		ret.error = 'User ' + param + ' not found';
	}

	return ret;
}

function parseDuration ( str ) {
	var parts = /\d+([dhm]?)/.exec( str );
	if ( !parts ) {
		return null;
	}

	if ( !parts[1] ) {
		parts[ 0 ] += 'm';
	}
	return parts[ 0 ];
}

bot.addCommand({
	name : 'mute',
	fun : function mute ( args ) {
		var parts = args.parse(),
			userInfo, duration;

		if ( !parts.length ) {
			return stringMuteList();
		}
		else if ( parts.length < 2 ) {
			return 'Please give mute duration, see `/help mute`';
		}

		bot.log( parts, '/mute input' );

		userInfo = userInfoFromParam( parts[0], args );
		if ( userInfo.error ) {
			return userInfo.error;
		}
		else if ( userInfo.id === bot.adapter.user_id ) {
			return 'Never try and mute a bot who can own your ass.';
		}
		else if ( bot.isOwner(userInfo.id) ) {
			return 'You probably didn\'t want to mute a room owner.';
		}

		duration = parseDuration( parts[1] );
		if ( !duration ) {
			return 'I don\'t know how to follow that format, see `/help mute`';
		}

		takeVoice({
			id : userInfo.id,
			invokingId : args.get('message_id'),
			duration : duration
		}, finish );

		function finish () {
			args.reply(
				'Muted user {0} for {1}'.supplant(userInfo.id, duration) );
		}
	},

	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Mutes a user. `/mute usrid duration` ' +
		'Duration should be in the format `n[mhd]` for n minutes/hours/days. ' +
		'If only n is provided, minutes is assumed.'
});

bot.addCommand({
	name : 'unmute',
	fun : function umute ( args ) {
		var parts = args.parse();

		bot.log( parts, '/unmute input' );

		if ( !parts.length ) {
			return 'Who shall I unmute?';
		}

		var userID = userInfoFromParam( parts[0], args );
		if ( userID.error ) {
			return userID.error;
		}

		giveVoice( userID.id, finish );

		function finish () {
			args.reply( 'Unmuted user ' + userID.id );
		}
	},

	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Unmutes a user. `/unmute usrid`'
});

})();

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
}

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

var template = '[{display_name}]({link}) '           +
		'has {reputation} reputation, '              +
		'earned {reputation_change_day} rep today, ' +
		'asked {question_count} questions, '         +
		'gave {answer_count} answers.';

var extended_template = 'avg. rep/post: {avg_rep_post}. ' +
		'Badges: {gold}g {silver}s {bronze}b ';

function stat ( msg, cb ) {
	var args = msg.parse(),
		id = args[ 0 ],
		extended = ( args[1] === 'extended' );

	if ( !id ) {
		id = msg.get( 'user_id' );
	}
	else if ( !/^\d+$/.test(id) ) {
		id = msg.findUserid( extended ? id : args.slice().join(' ') );
	}

	if ( id < 0 ) {
		return 'User Elusio proved elusive.';
	}

	//~5% chance
	if ( Math.random() <= 0.05 ) {
		finish( 'That dude sucks' );
		return;
	}

	IO.jsonp({
		url : 'https://api.stackexchange.com/2.0/users/' + id,
		data : {
			site   : bot.adapter.site,
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

	bot.log( res, '/stat templated' );
	return res;
}

function normalize_stats ( stats ) {
	stats = Object.merge({
			question_count        : 0,
			answer_count          : 0,
			reputation_change_day : 0
		}, stats );

	return stats;
}

function calc_extended_stats ( stats ) {
	stats = Object.merge( stats.badge_counts, stats );

	stats.avg_rep_post = (
			stats.reputation / ( stats.question_count + stats.answer_count )
		).maxDecimal( 2 );

	//1 / 0 === Infinity
	if ( stats.avg_rep_post === Infinity ) {
		stats.avg_rep_post = 'T͎͍̘͙̖̤̉̌̇̅ͯ͋͢͜͝H̖͙̗̗̺͚̱͕̒́͟E̫̺̯͖͎̗̒͑̅̈ ̈ͮ̽ͯ̆̋́͏͙͓͓͇̹<̩̟̳̫̪̇ͩ̑̆͗̽̇͆́ͅC̬͎ͪͩ̓̑͊ͮͪ̄̚̕Ě̯̰̤̗̜̗͓͛͝N̶̴̞͇̟̲̪̅̓ͯͅT͍̯̰͓̬͚̅͆̄E̠͇͇̬̬͕͖ͨ̔̓͞R͚̠̻̲̗̹̀>̇̏ͣ҉̳̖̟̫͕ ̧̛͈͙͇͂̓̚͡C͈̞̻̩̯̠̻ͥ̆͐̄ͦ́̀͟A̛̪̫͙̺̱̥̞̙ͦͧ̽͛̈́ͯ̅̍N̦̭͕̹̤͓͙̲̑͋̾͊ͣŅ̜̝͌͟O̡̝͍͚̲̝ͣ̔́͝Ť͈͢ ̪̘̳͔̂̒̋ͭ͆̽͠H̢͈̤͚̬̪̭͗ͧͬ̈́̈̀͌͒͡Ơ̮͍͇̝̰͍͚͖̿ͮ̀̍́L͐̆ͨ̏̎͡҉̧̱̯̤̹͓̗̻̭ͅḐ̲̰͙͑̂̒̐́̊';
	}

	bot.log( stats, '/stat extended' );
	return stats;
}

bot.addCommand({
	name : 'stat',
	fun : stat,
	permissions : {
		del : 'NONE'
	},

	description : 'Gives useless stats on a user. ' +
		'`/stat usrid|usrname [extended]`',
	async : true
});

}());

;
(function () {
/*
  ^\s*         #tolerate pre-whitespace
  s            #substitution prefix
  (\/|\|)      #delimiter declaration
  (            #begin matching regex
    (?:        #match shit which isn't an...
      (?:\\\1) #escaped delimeter
      |        #or...
      [^\1]    #anything but the delimeter
    )*?
  )            #end matching regex
  \1           #delimeter again
  (            #the fa-chizzle all over again...this time for replacement
    (?:
      (?:\\\1)
      |
      [^\1]
    )*?
  )      #read above, I'm not repeating this crap
  \1
  (      #flag capturing group
    g?   #global (optional)
    i?   #case insensitive (optional)
  )      #FIN
 */
var sub = /^\s*s(\/|\|)((?:(?:\\\1)|[^\1])*?)\1((?:(?:\\\1)|[^\1])*?)\1(g?i?)/;
bot.listen( sub, substitute );

function substitute ( msg ) {
	var re = RegExp( msg.matches[2], msg.matches[4] ),
		replacement = msg.matches[ 3 ];

	if ( !msg.matches[2] ) {
		return 'Empty regex is empty';
	}

	var message = get_matching_message( re, msg.get('message_id') );
	bot.log( message, 'substitution found message' );

	if ( !message ) {
		return 'No matching message (are you sure we\'re in the right room?)';
	}

	var link = get_message_link( message );
	return message.textContent.replace( re, replacement ) + ' ' +
		msg.link( '(source)', link );
}

function get_matching_message ( re, onlyBefore ) {
	var messages = [].slice.call(
		document.getElementsByClassName('content') ).reverse();
	return messages.first( matches );

	function matches ( el ) {
		var id = Number( el.parentElement.id.match(/\d+/)[0] );
		return id < onlyBefore && re.test( el.textContent );
	}
}

// <a class="action-link" href="/transcript/message/msgid#msgid>...</a>
// <div class="content">message</div>
//if the message was a reply, there'd be another element between them:
// <a class="reply-info" href="/transcript/message/repliedMsgId#repliedMsgId>
function get_message_link ( message ) {
	var node = message;

	while ( !node.classList.contains('action-link') ) {
		node = node.previousElementSibling;
	}

	return node.href;
}
}());

;
(function () {
"use strict";

var summon = function ( args ) {
	var room = Number( args );

	if ( !room ) {
		return 'That aint no room I ever heard of! ' +
			'`/help summon` for usage info';
	}

	bot.adapter.in.init( room );
};
var unsummon = function ( args, cb ) {
	var room = args.content ? Number( args ) : args.get( 'room_id' );

	if ( !room ) {
		return 'That aint no room I ever heard of! ' +
			'`/help unsummon` for usage info';
	}

	bot.adapter.in.leaveRoom( room, function ( err ) {
		if ( err === 'base_room' ) {
			finish( 'I can\'t leave my home.' );
		}
	});

	function finish ( res ) {
		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.reply( res );
		}
	}
};

bot.addCommand( bot.CommunityCommand({
	name : 'summon',
	fun : summon,
	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Say boopidi bee and in the room I shall appear. '+
		'`/summon roomid`'
}));

bot.addCommand( bot.CommunityCommand({
	name : 'unsummon',
	fun : unsummon,
	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Chant zippidi dee and from the room I shall take my leave. ' +
		'`/unsummon [roomid=your_roomid]`'
}));

})();

;
(function () {
var timers = Object.create( null ),
	id = 0;

var actions = {
	start : function ( name ) {
		if ( name === undefined ) {
			//if Crockford ever reads this, I want to reassure you: I did mean
			// postfix increment. I want to grab the original value of id while
			// increasing its value.
			//now you may continue reading the code at ease
			name = id++;
		}
		timers[ name ] = Date.now();
		return 'Registered timer ' + name;
	},

	stop : function ( name ) {
		if ( name === undefined ) {
			return 'You must provide a timer name';
		}
		var timer = timers[ name ];

		if ( !timer ) {
			return 'I have no knowledge of timer ' + name;
		}

		var delta = Date.now() - timer;
		delete timers[ name ];

		return delta + 'ms';
	}
};

function timer ( msg ) {
	var args = msg.parse(),
		act = args.shift(),
		name = args.shift();

	if ( !actions[act] ) {
		return 'Action {0} not recognized, see `/help timer`'.supplant( act );
	}
	return actions[ act ]( name );
}

bot.addCommand({
	name : 'timer',
	fun  : timer,
	permissions : {
		del : 'NONE'
	},
	description : 'Starts/stops a timer. ' +
		'`/timer start [name]` starts a timer, ' +
		'`/timer stop name` stops a timer.'
});

})();

;
(function () {
var list = bot.memory.get( 'todo' );

var userlist = function ( usrid ) {
	var usr = list[ usrid ],
		toRemove = [];
	if ( !usr ) {
		usr = list[ usrid ] = [];
	}

	return {
		get : function ( count ) {
			return usr.slice( count ).map(function ( item, idx ) {
				return '(' + idx + ')' + item;
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
			return this.removeByIndex( idx );
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
			return usr.some(function ( item ) {
				return suspect === item.toLowerCase();
			});
		}
	};
}.memoize();

var actions = {
	get : function ( usr, items ) {
		//if the user didn't provide an argument, the entire thing is returned
		var ret = usr.get( items[0] );
		return ret || 'No items on your todo';
	},

	add : function ( usr, items ) {
		var ret = '';
		items.every( add );
		return ret || 'Item(s) added.';

		function add ( item ) {
			if ( usr.exists(item) ) {
				ret = item + ' already exists.';
				return false;
			}
			usr.add( item );
			return true;
		}
	},

	rm : function ( usr, items ) {
		var ret = '';
		items.every( remove );

		return ret || 'Item(s) removed.';

		function remove ( item ) {
			if ( /^\d+$/.test(item) ) {
				usr.removeByIndex( Number(item) );
			}
			else if ( !usr.exists(item) ) {
				ret = item + ' does not exist.';
				return false;
			}
			else {
				usr.remove( item );
			}

			return true;
		}
	}
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
		ret;

	if ( actions[action] ) {
		ret = actions[ action ]( usr, items );
		bot.log( ret, '/todo ' + action );
	}
	else {
		ret = 'Unidentified /todo action ' + action;
		bot.log( ret, '/todo unknown' );
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
		'`rm items|indices` removes items specified by indice or content'
});

}());

;
(function () {
var undo = {
	last_id : null,

	command : function ( args, cb ) {
		var id = Number( args.parse()[0] );
		bot.log( id, '/undo input' );

		if ( !id ) {
			id = this.last_id;
		}

		if ( !id ) {
			finish( 'I\'ve yet to say a word.' );
		}
		else {
			this.remove( id, finish );
		}

		function finish ( ans ) {
			if ( cb ) {
				cb( ans );
			}
			else {
				args.reply( ans );
			}
		}
	},

	remove : function ( id, cb ) {
		IO.xhr({
			url   : '/messages/' + id + '/delete',
			data   : fkey(),
			method  : 'POST',
			complete : finish
		});

		function finish ( resp, xhr ) {
			var msg;

			if ( resp === '"ok"' ) {
				//nothing to see here
				return;
			}
			else if ( /it is too late/i.test(resp) ) {
				msg = 'TimeError: Could not reach 88mph';
			}
			else if ( /only delete your own/i.test(resp) ) {
				//...I can't think of anything clever
				msg = 'I can only delete my own messages';
			}
			else {
				msg = 'I have no idea what happened: ' + resp;
			}

			cb( msg );
		}
	},

	update_id : function ( xhr ) {
		this.last_id = JSON.parse( xhr.responseText ).id;
	}
};

IO.register( 'sendoutput', undo.update_id, undo );
bot.addCommand({
	name : 'undo',
	fun  : undo.command,
	thisArg : undo,
	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Undo (delete) specified or last message. `/undo [msgid]`'
});

}());

;
IO.register( 'input', function ( msgObj ) {
	if ( msgObj.user_id === 1386886 && Math.random() < 0.005 ) {
		bot.adapter.out.add(
			bot.adapter.reply(msgObj.user_name) + ' The Game' );
	}
});

;
(function () {
//meet Winded Weasel. he helps you make decisions and he answers questions.
//x or y [or z ...]
// => one of x, y, z, ...
//is x y
//can x y
// => yes or no

var chooseRe = /^\s*(choose|should)?.*\sor\s[^$]/i,
	questionRe = new RegExp('\\b(' +[
		"am", "are", "can", "could", "did", "do", "does", "is", "may", "might",
		"shall", "should", "will", "would"
	].map(RegExp.escape).join('|') + ')\\b', 'i');

//personal pronouns to capitalize and their mapping
//TODO: add possessives (should my cat => your cat should)
var capitalize = {
	he  : 'He',
	i   : 'You',
	it  : 'It',
	she : 'She',
	they: 'They',
	we  : 'You',
	you : 'I'
};

//will be filled in the build
var answers, undecided, sameness;
//"encoded" to leave some surprise
undecided=["SSdtIG5vdCBzdXJl", "RVJST1IgQ0FMQ1VMQVRJTkcgUkVTVUxU","SSBrbm93IGp1c3Qgb25lIHRoaW5nLCBhbmQgdGhhdCBpcyB0aGF0IEknbSBhIGx1bWJlcmphY2s="].map(atob);

sameness=["VGhhdCdzIG5vdCByZWFsbHkgYSBjaG9pY2UsIG5vdyBpcyBpdD8=","U291bmRzIGxpa2UgeW91IGhhdmUgYWxyZWFkeSBkZWNpZGVk","Q2hlYXRlciBjaGVhdGVyIHlvdXIgaG91c2UgaXMgYSBoZWF0ZXI="].map(atob);

//now for the juicy part
answers=["QWJzb2x1dGVseSBub3Q=","QWJzb2x1dGVseSBub3Q=","QWJzb2x1dGVseSBub3Q=","QWxsIHNpZ25zIHBvaW50IHRvIG5v","QWxsIHNpZ25zIHBvaW50IHRvIG5v","QWxsIHNpZ25zIHBvaW50IHRvIG5v","QWxsIHNpZ25zIHBvaW50IHRvIHllcw==","QWxsIHNpZ25zIHBvaW50IHRvIHllcw==","QWxsIHNpZ25zIHBvaW50IHRvIHllcw==","QnV0IG9mIGNvdXJzZQ==","QnV0IG9mIGNvdXJzZQ==","QnV0IG9mIGNvdXJzZQ==","QnkgYWxsIG1lYW5z","QnkgYWxsIG1lYW5z","QnkgYWxsIG1lYW5z","Q2VydGFpbmx5IG5vdA==","Q2VydGFpbmx5IG5vdA==","Q2VydGFpbmx5IG5vdA==","Q2VydGFpbmx5","Q2VydGFpbmx5","Q2VydGFpbmx5","RGVmaW5pdGVseQ==","RGVmaW5pdGVseQ==","RGVmaW5pdGVseQ==","RG91YnRmdWxseQ==","RG91YnRmdWxseQ==","RG91YnRmdWxseQ==","SSBjYW4gbmVpdGhlciBjb25maXJtIG5vciBkZW55","SSBleHBlY3Qgc28=","SSBleHBlY3Qgc28=","SSBleHBlY3Qgc28=","SSdtIG5vdCBzbyBzdXJlIGFueW1vcmUuIEl0IGNhbiBnbyBlaXRoZXIgd2F5","SW1wb3NzaWJsZQ==","SW1wb3NzaWJsZQ==","SW1wb3NzaWJsZQ==","SW5kZWVk","SW5kZWVk","SW5kZWVk","SW5kdWJpdGFibHk=","SW5kdWJpdGFibHk=","SW5kdWJpdGFibHk=","Tm8gd2F5","Tm8gd2F5","Tm8gd2F5","Tm8=","Tm8=","Tm8=","Tm8=","Tm9wZQ==","Tm9wZQ==","Tm9wZQ==","Tm90IGEgY2hhbmNl","Tm90IGEgY2hhbmNl","Tm90IGEgY2hhbmNl","Tm90IGF0IGFsbA==","Tm90IGF0IGFsbA==","Tm90IGF0IGFsbA==","TnVoLXVo","TnVoLXVo","TnVoLXVo","T2YgY291cnNlIG5vdA==","T2YgY291cnNlIG5vdA==","T2YgY291cnNlIG5vdA==","T2YgY291cnNlIQ==","T2YgY291cnNlIQ==","T2YgY291cnNlIQ==","UHJvYmFibHk=","UHJvYmFibHk=","UHJvYmFibHk=","WWVzIQ==","WWVzIQ==","WWVzIQ==","WWVzIQ==","WWVzLCBhYnNvbHV0ZWx5","WWVzLCBhYnNvbHV0ZWx5","WWVzLCBhYnNvbHV0ZWx5"].map(atob);
//can you feel the nectar?


bot.listen(chooseRe, function chooseListener ( msg ) {
	var parts = msg
		//remove the choose prefix
		.replace( /^\s*choose\s/i, '' )
		//also remove the trailing question mark
		.replace( /\?$/, '' )
		.split( /\s*\bor\b\s*/i )
		//remove whatever empty items there may be
		.filter( Boolean );

	var len = parts.length;

	//check to see whether there's only 1 thing asked to choose about, e.g.
	// choose a or a or a
	// choose a
	for ( var i = 1, same = true; i < len; i++ ) {
		if ( parts[i] !== parts[i-1] ) {
			same = false;
			break;
		}
	}

	if ( same ) {
		return sameness.random();
	}

	//all of them (1%)
	if ( Math.random() < 0.01 ) {
		return len === 2 ? 'Both!' : 'All of them!';
	}
	//none of them (1%)
	if ( Math.random() < 0.01 ) {
		return len === 2 ? 'Neither' : 'None of them!';
	}
	//I don't know (1%)
	if ( Math.random() < 0.01 ) {
		return undecided.random();
	}

	//choose!
	var choice = parts.random();

	//bots can be fickley too
	if ( Math.random() < 0.01 ) {
		bot.log( 'weasel decision mind change jedi nun-chuck' );
		setTimeout( changeMind, 10000 );
	}

	return format( choice );

	function changeMind () {
		var second;
		//this won't be an infinite loop as we guruantee there will be at least
		// 2 distinct results
		//possible blocking point for large N. but there won't be a
		// sufficiently large N, so this is probably not a problem
		do {
			second = parts.random();
		} while ( second === choice );

		msg.reply( 'Wait, I changed my mind! ' + format(second) );
	}

	function format ( ans ) {
		return ans.replace( /(should(?:n'?t)?) (\S+)/, subject );
	}

	//convert:
	// "should I" => "you should"
	// "should you" => "I should"
	//anything else just switch the order
	function subject ( $0, $1, $2 ) {
		var sub = $2.toLowerCase(),
			conv;

		//if we recognize this word, map it properly
		if ( capitalize.hasOwnProperty(sub) ) {
			conv = capitalize[ sub ];
		}
		//otherwise, use the original spelling
		else {
			conv = $2;
		}

		return conv + ' ' + $1;
	}
});

bot.listen(questionRe, function questionListener () {
	//TODO: same question => same mapping (negative/positive, not specific)
	return answers.random();
});

}());

;
(function () {
"use strict";

var fahrenheitCountries = Object.TruthMap([
	//the API returns US in a variety of forms...
	'US', 'United States of America', 'United States',
	//other than the US, it's used in Belize, Bahamas and and Cayman Islands
	'BZ', 'Belize', // http://www.hydromet.gov.bz/
	'BS', 'Bahamas', // http://archive.is/RTD4
	'KY', 'Cayam Islands' // http://www.weather.ky/forecast/index.htm
]);

var weather = {
	latlon : function ( lat, lon, cb ) {
		var nlat = Number( lat ),
			nlon = Number( lon );

		var errs = [];
		if ( nlat < -180 || nlat > 180 ) {
			errs.push( 'Latitude must be between -180 and 180' );
		}
		if ( nlon < -180 || nlon > 180 ) {
			errs.push( 'Longitude must be between -180 and 180' );
		}

		if ( errs.length ) {
			cb( errs.join('; ') );
			return;
		}

		IO.jsonp({
			url : 'http://api.openweathermap.org/data/2.5/weather',
			jsonpName : 'callback',
			data : {
				lat : lat,
				lon : lon,
				cnt : 1, //limit to 1 result
				type : 'json'
			},

			fun : this.finishCb( cb ),
			error : this.errorCb( cb )
		});
	},

	city : function ( city, cb ) {
		IO.jsonp({
			url : 'http://api.openweathermap.org/data/2.5/weather',
			jsonpName : 'callback',
			data : {
				q : city,
				type : 'json'
			},

			fun : this.finishCb( cb ),
			error : this.errorCb( cb )
		});
	},

	finishCb : function ( cb ) {
		var self = this;

		return function ( resp ) {
			cb( self.format(resp) );
		};
	},
	errorCb : function ( cb ) {
		return cb;
	},

	format : function ( resp ) {
		var main = resp.main;

		if ( !main ) {
			console.error( resp );
			return 'Sorry, I couldn\'t get the data: ' + resp.message;
		}

		return this.formatter( resp );
	},
	formatter : function ( data ) {
		var temps = data.main,
			ret;

		temps.celsius = ( temps.temp - 273.15 ).maxDecimal( 4 );

		ret =
			bot.adapter.link(
				data.name, 'http://openweathermap.org/city/' + data.id
			) + ': ';

		//to help our dear American friends, also include fahrenheit
		if ( fahrenheitCountries[data.sys.country] ) {
			temps.fahrenheit = ( temps.temp * 9/5 - 459.67 ).maxDecimal( 4 );
			ret += '{fahrenheit}F ({celsius}C, {temp}K)'.supplant( temps );
		}
		//and to those of us with one less insanity
		else {
			ret += '{celsius}C ({temp}K)'.supplant( temps );
		}

		var descs = ( data.weather || [] ).map(function ( w ) {
			return w.description;
		}).join( ', ' );

		if ( descs ) {
			ret += ', ' + descs;
		}

		return ret;
	}
};

var latlon = /\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/;
function weatherCommand ( args ) {
	var parts = latlon.exec( args );
	if ( parts ) {
		weather.latlon( parts[1], parts[2], args.reply.bind(args) );
	}
	else if ( args.content ) {
		weather.city( args.content, args.reply.bind(args) );
	}
	else {
		return 'See `/help weather` for usage info';
	}
}

bot.addCommand({
	name : 'weather',
	fun : weatherCommand,
	permissions : {
		del : 'NONE'
	},
	async : true,

	description : 'Gets current weather: ' +
		'`/weather (lan, lon)` or `/weather city`'
});
}());

;
(function () {
"use strict";
//welcomes new users with a link to the room rules

var seen = bot.memory.get( 'users' );

var message = "Welcome to the JavaScript chat! Please review the " +
		bot.adapter.link(
			"room pseudo-rules",
			"http://rlemon.github.com/so-chat-javascript-rules/" ) + ". " +
	"Please don't ask if you can ask or if anyone's around; just ask " +
	"your question, and if anyone's free and interested they'll help.";

function welcome ( name, room ) {
	bot.adapter.out.add(
		bot.adapter.reply( name ) + " " + message, room );
}

IO.register( 'userregister', function ( user, room ) {
	var semiLegitUser = bot.isOwner( user.id ) ||
		user.reputation > 1000 || user.reputation < 20;

	if (
		Number( room ) !== 17 || semiLegitUser  || seen[ user.id ]
	) {
		if ( semiLegitUser ) {
			finish( true );
		}
		return;
	}

	IO.xhr({
		method : 'GET',
		url : '/users/' + user.id,

		complete : complete
	});

	function complete ( resp ) {
		//I'm parsing html with regexps. hopefully Cthulu won't eat me.
		// <a href="/transcript/17">7</a>
		// <a href="/transcript/17">47.1k</a>
		var chatMessages = /transcript\/17(?:'|")>([\d\.]+)(k?)/.exec( resp );

		if ( !chatMessages || (
			chatMessages[ 2 ] || parseFloat( chatMessages[1] ) < 2
		)) {
			welcome( user.name, room );
		}
		finish();
	}

	function finish ( unsee ) {
		if ( unsee ) {
			delete seen[ user.id ];
		}
		else {
			seen[ user.id ] = true;
		}
		bot.memory.save( 'users' );
	}
});

bot.addCommand({
	name : 'welcome',
	fun : function ( args ) {
		if (!args.length) {
			return message;
		}

		welcome( args, args.get('roomid') );
	},
	permission : {
		del : 'NONE'
	},
	description : 'Welcomes a user. `/welcome user`'
});
}());

;
(function () {
"use strict";

function command ( args, cb ) {
	IO.jsonp({
		url : 'http://en.wiktionary.org/w/api.php',
		jsonpName : 'callback',
		data : {
			action : 'opensearch',
			search : args.toString(),
			limit : 1,
			format : 'json'
		},
		fun : finish
	});

	function finish ( resp ) {
		//the result will look like this:
		// [search_term, [title0, title1, title2, ...]]
		//we only asked for one result, so the 2nd array will have 1 item
		var title = resp[ 1 ][ 0 ],
			base = 'http://en.wikipedia.org/wiki/',
			found = true, res;

		if ( !title ) {
			found = false;
			res = [
				'No result found',
				'The Wikipedia contains no knowledge of such a thing',
				'The Gods of Wikipedia did not bless us'
			].random();
		}
		else {
			//for some reason, wikipedia can't simply return a url
			title = encodeURIComponent( title.replace(/ /g, '_') );

			res = base + title;
		}

		if ( cb && cb.call ) {
			cb( res );
		}
		else if ( found ){
			args.directreply( res );
		}
		else {
			args.reply( res );
		}
	}
}

bot.addCommand({
	name : 'wiki',
	fun : command,
	permissions : {
		del : 'NONE'
	},

	description : 'Search Wikipedia. `/wiki term`',
	async : true
});
})();

;
(function() {
//Gets or sets a XKCD comic-type thing
//just kidding! we can't set one. I'm just used to crappy javadoc style.
//*sniffle*

function getXKCD( args, cb ) {
	var prop = ( args.parse()[0] || '' ).toLowerCase(),
		linkBase = 'http://xkcd.com/';

	//they want a specifix xkcd
	if ( /\d{1,4}/.test(prop) ) {
		finish( linkBase + prop );
		return;
	}
	//we have no idea what they want. lazy arrogant bastards.
	else if ( prop && prop !== 'new' ) {
		finish( 'Clearly, you\'re not geeky enough for XKCD.' );
		return;
	}

	//they want a random XKCD, or the latest
	IO.jsonp({
		url : 'http://dynamic.xkcd.com/api-0/jsonp/comic',
		jsonpName : 'callback',
		fun : finishXKCD
	});

	function finishXKCD ( resp ) {
		var maxID = resp.num;

		if ( !prop ) {
			finish( linkBase + Math.rand(1, maxID) );
		}
		else if ( prop === 'new' ) {
			finish( linkBase + maxID );
		}
	}

	function finish( res ) {
		bot.log( res, '/xkcd finish' );

		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.directreply( res );
		}
	}
}

bot.addCommand({
	name : 'xkcd',
	fun : getXKCD,
	permissions : {
		del : 'NONE'
	},
	description : 'Returns an XKCD. Call with no args for random, ' +
		'`new` for latest, or a number for a specific one.',
	async : true
});
})();

;
(function () {
var nulls = [
	'Video not found (rule 35?)',
	'I could not find such a video',
	'The Lords of YouTube did not find your query favorable' ];
function youtube ( args, cb ) {
	IO.jsonp({
		url : 'https://gdata.youtube.com/feeds/api/videos',
		jsonpName : 'callback',
		data : {
			q : args.toString(),
			'max-results' : 1,
			v : 2,
			alt : 'json'
		},
		fun : finish
	});

	//the response looks something like this:
	/*
	{
		tons of crap
		"entry" : [{
			lots of crap
			"link" : [{
				some crap
				"href" : what we care about
			}]
			some more crap
		}]
		and then some more
	}
	*/
	function finish ( resp ) {
		var entry = resp.feed.entry;
		if ( !entry || !entry.length ) {
			args.reply( nulls.random() );
		}
		else {
			args.send( entry[0].link[0].href );
		}
	}
}

bot.addCommand({
	name : 'youtube',
	fun : youtube,
	permissions : {
		del : 'NONE'
	},
	description : 'Search Youtube. `/youtube query`',
	async : true
});
}());
