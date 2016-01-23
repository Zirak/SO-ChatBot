//345678901234567890123456789012345678901234567890123456789012345678901234567890
//small utility functions

//takes n objects, and merges them into one super-object, which'll one day rule
// the galaxy. Non-mutative. The merging, not the galaxy ruling.
//
// > Object.merge( {a : 4, b : 5}, {a : 6, c : 7} )
// { a : 6, b : 5, c : 7 }
Object.merge = function () {
    return [].reduce.call( arguments, function ( ret, merger ) {

        Object.keys( merger ).forEach(function ( key ) {
            ret[ key ] = merger[ key ];
        });

        return ret;
    }, {} );
};

//iterates over an object. the callback receives the key, value and the obejct.
// > Object.iterate( {a : 4, b : 5}, console.log.bind(console) )
// a 4 { a: 4, b: 5 }
// b 5 { a: 4, b: 5 }
Object.iterate = function ( obj, cb, thisArg ) {
    Object.keys( obj ).forEach(function (key) {
        cb.call( thisArg, key, obj[key], obj );
    });
};

//takes an array, and turns it into the truth map (item[i] => true)
//TODO: replace with Set
Object.TruthMap = function ( props ) {
    return ( props || [] ).reduce( assignTrue, Object.create(null) );

    function assignTrue ( ret, key ) {
        ret[ key ] = true;
        return ret;
    }
};

//turns a pseudo-array (like arguments) into a real array
Array.from = function ( arrayLike, start ) {
    return [].slice.call( arrayLike, start );
};

//SO chat uses an unfiltered for...in to iterate over an array somewhere, so
// that we have to use Object.defineProperty to make these non-enumerable
Object.defineProperty( Array.prototype, 'invoke', {
    value : function ( funName ) {
        var args = Array.from( arguments, 1 );

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

Object.defineProperty( Array.prototype, 'pluck', {
    value : function ( propName ) {
        return this.map( pluck );

        function pluck ( item, index, arr ) {
            //protection aganst null/undefined.
            try {
                return item[ propName ];
            }
            catch (e) {
                return item;
            }
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

Object.defineProperty( Array.prototype, 'groupBy', {
    value : function ( classifier ) {
        return this.reduce(function ( ret, item ) {
            var key = classifier( item );

            if ( !ret[key] ) {
                ret[ key ] = [];
            }
            ret[ key ].push( item );

            return ret;
        }, {});
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
        var args = Array.from( arguments ),
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

//returns the function in string-form, without the enclosing crap.
Function.prototype.stringContents = function () {
    return this.toString()
        .replace(/^function\*?\s+\([^)]*\)\s*\{/, '')
        .replace(/\}$/, '');
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
    if ( typeof min === 'undefined' ) {
        min = 0;
        max = 9;
    }

    //rand( max ) === rand( 0, max )
    else if ( typeof max === 'undefined' ) {
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
    d1 = d1 || new Date();

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

    while ( delays.length ) {
        delay = delays.shift();

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
