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
