var global = this;

/*most extra functions could be possibly unsafe*/
var whitey = {
	'Array'              : 1,
	'Boolean'            : 1,
	'Date'               : 1,
	'Error'              : 1,
	'EvalError'          : 1,
	'Function'           : 1,
	'Infinity'           : 1,
	'JSON'               : 1,
	'Math'               : 1,
	'NaN'                : 1,
	'Number'             : 1,
	'Object'             : 1,
	'RangeError'         : 1,
	'ReferenceError'     : 1,
	'RegExp'             : 1,
	'String'             : 1,
	'SyntaxError'        : 1,
	'TypeError'          : 1,
	'URIError'           : 1,
	'atob'               : 1,
	'btoa'               : 1,
	'decodeURI'          : 1,
	'decodeURIComponent' : 1,
	'encodeURI'          : 1,
	'encodeURIComponent' : 1,
	'eval'               : 1,
	'global'             : 1,
	'isFinite'           : 1,
	'isNaN'              : 1,
	'onmessage'          : 1,
	'parseFloat'         : 1,
	'parseInt'           : 1,
	'postMessage'        : 1,
	'self'               : 1,
	'undefined'          : 1,
	'whitey'             : 1,

	/* typed arrays and shit */
	'ArrayBuffer'       : 1,
	'Blob'              : 1,
	'Float32Array'      : 1,
	'Float64Array'      : 1,
	'Int8Array'         : 1,
	'Int16Array'        : 1,
	'Int32Array'        : 1,
	'Uint8Array'        : 1,
	'Uint16Array'       : 1,
	'Uint32Array'       : 1,
	'Uint8ClampedArray' : 1,

	/*
	these properties allow FF to function. without them, a fuckfest of
	inexplicable errors enuses. took me about 4 hours to track these fuckers
	down.
	fuck hell it isn't future-proof, but the errors thrown are uncatchable
	and untracable. so a heads-up. enjoy, future-me!
	*/
	'DOMException' : 1,
	'Event'        : 1,
	'MessageEvent' : 1
};

[ global, global.__proto__ ].forEach(function ( obj ) {
	Object.getOwnPropertyNames( obj ).forEach(function( prop ) {
		if( !whitey.hasOwnProperty( prop ) ) {
			delete obj[ prop ];
		}
	});
});

Object.defineProperty( Array.prototype, 'join', {
	writable: false,
	configurable: false,
	enumrable: false,

	value: (function ( old ) {
		return function ( arg ) {
			if ( this.length > 500 || (arg && arg.length > 500) ) {
				throw 'Exception: too many items';
			}

			return old.apply( this, arguments );
		};
	}( Array.prototype.join ))
});

/* we define it outside so it'll not be in strict mode */
function exec ( code ) {
	return eval( 'undefined;\n' + code );
}

(function(){
	"use strict";

	var console = {
		_items : [],
		log : function() {
			console._items.push.apply( console._items, arguments );
		}
	};
	var p = console.log.bind( console );

	global.onmessage = function ( event ) {
		postMessage({
			event : 'start'
		});

		var jsonStringify = JSON.stringify, /*backup*/
			result;

		try {
			result = exec( event.data );
		}
		catch ( e ) {
			result = e.toString();
		}

		/*JSON does not like any of the following*/
		var strung = {
			Function  : true, Error  : true,
			Undefined : true, RegExp : true
		};
		var should_string = function ( value ) {
			var type = ( {} ).toString.call( value ).slice( 8, -1 );

			if ( type in strung ) {
				return true;
			}
			/*neither does it feel compassionate about NaN or Infinity*/
			return value !== value || value === Infinity;
		};

		var reviver = function ( key, value ) {
			var output;

			if ( should_string(value) ) {
				output = '' + value;
			}
			else {
				output = value;
			}

			return output;
		};

		postMessage({
			answer : jsonStringify( result, reviver ),
			log    : jsonStringify( console._items, reviver ).slice( 1, -1 )
		});
	};
})();
