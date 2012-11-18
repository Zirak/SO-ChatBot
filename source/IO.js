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
//#build static/htmlEntities.js

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
IO.jsonp.ddg = function ( query, cb ) {
	IO.jsonp({
		url : 'http://api.duckduckgo.com/',
		jsonpName : 'callback',
		data : {
			format : 'json',
			q : query
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
