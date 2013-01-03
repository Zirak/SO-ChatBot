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

Object.defineProperty( Array.prototype, 'random', {
	value : function () {
		return this[ Math.floor(Math.random() * this.length) ];
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

//I got annoyed that RegExps don't automagically turn into correct shit when
// JSON-ing them. so HERE.
Object.defineProperty( RegExp.prototype, 'toJSON', {
	value : function () {
		return this.toString();
	},
	configurable : true,
	writable : true
});

//not the most efficient thing, but who cares. formats the difference between
// two dates
Date.timeSince = function ( d0, d1 ) {
	d1 = d1 || (new Date);

	var ms = d1 - d0,
		delay, interval;

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
