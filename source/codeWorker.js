//the following is code that'll run inside eval's web worker
module.exports = (function () {
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
    'Map'                : 1,
    'Math'               : 1,
    'NaN'                : 1,
    'Number'             : 1,
    'Object'             : 1,
    'Promise'            : 1,
    'Proxy'              : 1,
    'RangeError'         : 1,
    'ReferenceError'     : 1,
    'RegExp'             : 1,
    'Set'                : 1,
    'String'             : 1,
    'SyntaxError'        : 1,
    'TypeError'          : 1,
    'URIError'           : 1,
    'WeakMap'            : 1,
    'WeakSet'            : 1,
    'atob'               : 1,
    'btoa'               : 1,
    'console'            : 1,
    'decodeURI'          : 1,
    'decodeURIComponent' : 1,
    'encodeURI'          : 1,
    'encodeURIComponent' : 1,
    'eval'               : 1,
    'exec'               : 1, /* our own function */
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
    'DOMException'      : 1,
    'Event'             : 1,
    'MessageEvent'      : 1,
    'WorkerMessageEvent': 1
};

/**
 * DOM specification doesn't define an enumerable `fetch` function object on the global object
 * so we add the property here, and the following code will blacklist it.
 * (`fetch` descends from `GlobalFetch`, and is thus present in worker code as well)
 * Just in case someone runs the bot on some old browser where `fetch` is not defined anyways,
 * this will have no effect.
 * Reason for blacklisting fetch: well, same as XHR.
 */
global.fetch = undefined;

[ global, Object.getPrototypeOf(global) ].forEach(function ( obj ) {
    Object.getOwnPropertyNames( obj ).forEach(function( prop ) {
        if( whitey.hasOwnProperty(prop) ) {
            return;
        }

        try {
            Object.defineProperty( obj, prop, {
                get : function () {
                    /* TEE HEE */
                    throw new ReferenceError( prop + ' is not defined' );
                },
                configurable : false,
                enumerable : false
            });
        }
        catch ( e ) {
            delete obj[ prop ];

            if ( obj[ prop ] !== undefined ) {
                obj[ prop ] = null;
            }
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
var exec = function ( code, arg ) {
    return eval( 'undefined;\n' + code );
};
var console = {
    _items : [],
    log : function() {
        console._items.push.apply( console._items, arguments );
    }
};
console.error = console.info = console.debug = console.log;

(function() {
    "use strict";

    global.onmessage = function ( event ) {
        global.postMessage({
            event : 'start'
        });

        var jsonStringify = JSON.stringify, /*backup*/
            result,

            originalSetTimeout = setTimeout,
            timeoutCounter = 0;

        var sendResult = function ( result ) {
            global.postMessage({
                answer : jsonStringify( result, reviver ),
                log    : jsonStringify( console._items, reviver ).slice( 1, -1 )
            });
        };
        var done = function ( result ) {
            if ( timeoutCounter < 1 ) {
                sendResult( result );
            }
        };

        var reviver = function ( key, value ) {
            var output;

            if ( shouldString(value) ) {
                output = '' + value;
            }
            else {
                output = value;
            }

            return output;
        };

        /*JSON does not like any of the following*/
        var strung = {
            Function  : true, Error  : true,
            Undefined : true, RegExp : true
        };
        var shouldString = function ( value ) {
            var type = ( {} ).toString.call( value ).slice( 8, -1 );

            if ( type in strung ) {
                return true;
            }
            /*neither does it feel compassionate about NaN or Infinity*/
            return value !== value || Math.abs(value) === Infinity;
        };

        self.setTimeout = function (cb) {
            /*because of SomeKittens*/
            if (!cb) {
                return;
            }

            var args = [].slice.call( arguments );
            args[ 0 ] = wrapper;
            timeoutCounter += 1;

            originalSetTimeout.apply( self, args );

            function wrapper () {
                timeoutCounter -= 1;
                cb.apply( self, arguments );

                done();
            }
        };

        try {
            result = exec( event.data.code, event.data.arg );
        }
        catch ( e ) {
            result = e.toString();
        }

        /*handle promises appropriately*/
        if ( result && result.then && result.catch ) {
            result.then( done ).catch( done );
        }
        else {
            done( result );
        }
    };
})();
}).stringContents();
