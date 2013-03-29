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
		//I don't quite like this solution for re-writing the units, but
		// this idea is good (praise rlemon!), so I'll just clean it later.
		var m = f / 3.28083989;
		if ( m > 1000 ) {
			return {
				km : m / 1000 };
		}
		else if ( m < 0.01 ) {
			return {
				mm : m * 1000 };
		}
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
			r : d * Math.PI / 180 };
	},
	r : function ( r ) {
		return {
			d : r * 180 / Math.PI };
	},

	//weights
	g : function ( g ) {
		return {
			lb : g * 0.0022 };
	},
	lb : function ( lb ) {
		var g = lb * 453.592;
		if ( g > 1000 ) {
			return {
				kg : g / 1000 };
		}

		return {
			g : lb * 453.592 };
	},

	//kg: 1g = 1kg * 1000
	kg : function ( kg ) {
		return converters.g( kg * 1000 );
	}
};
converters.lbs = converters.lb;

/*
  (        #start number matching
   -?      #optional negative
   \d+     #the integer part of the number
   \.?     #optional dot for decimal portion
   \d*     #optional decimal portion
  )
  \s*      #optional whitespace, just 'cus
  (        #start unit matching
   \S+  #the unit. we don't know anyhing about it, besides having no ws
  )
 */
var rUnits = /(-?\d+\.?\d*)\s*(\S+)(\s+(?:to|in)\s+(.+))?/;

//string is in the form of:
// <number><unit>
//note that units are case-sensitive: F is the temperature, f is the length
var convert = function ( inp, cb ) {
	bot.log( inp, '/convert input' );
	if ( inp.toString() === 'list' ) {
		cb( listUnits().join(', ') );
	}

	var parts = rUnits.exec( inp );

	if ( !parts ) {
		finish( 'Unidentified format; please see `/help convert`' );
	}
	else if ( parts[3] ) {
		convertMoney( parts, finish );
	}
	else {
		convertUnit( parts, finish );
	}

	function finish ( res ) {
		bot.log( res, '/console answer' );
		var reply = Object.keys( res ).map( format ).join( ', ' );

		if ( cb && cb.call ) {
			cb( reply );
		}
		else {
			inp.reply( reply );
		}

		function format ( key ) {
			return res[ key ].maxDecimal( 4 ) + key;
		}
	}
};

function convertUnit ( parts, cb ) {
	var number = Number( parts[1] ),
		unit = parts[ 2 ];

	bot.log( parts, '/convert unit broken' );

	if ( !converters[unit] ) {
		cb( 'Confuse converter with ' + unit + ', receive error message' );
	}
	else {
		cb( converters[unit](number) );
	}
}

var ratesCache = {};
function convertMoney ( parts, cb ) {
	var number = Number( parts[1] ),
		from = parts[ 2 ].toUpperCase(),
		to = parts[ 4 ].toUpperCase(); //[3] contains "to" and ws as well

	bot.log( number, from, to, '/convert money broken' );

	getRate( from, to, function ( rate ) {
		var res = {}; //once again, the lack of dynamic key names sucks.
		res[ to ] = number * rate;

		cb( res );
	});
}

function getRate ( from, to, cb ) {
	if ( checkCache(from, to) ) {
		cb( ratesCache[from][to].rate );
		return;
	}

	IO.jsonp({
		url : 'http://rate-exchange.appspot.com/currency',
		jsonpName : 'callback',
		data : {
			from : from,
			to : to
		},
		fun : finish
	});

	function finish ( resp ) {
		ratesCache[ from ] = ratesCache[ to ] || {};
		ratesCache[ from ][ to ] = {
			rate : resp.rate,
			time : Date.now()
		};

		cb( resp.rate );
	}
}

function checkCache ( from, to ) {
	var now = Date.now(), obj;

	var exists = (
		ratesCache[ from ] &&
			( obj = ratesCache[from][to] ) &&
			//so we won't request again, keep it in memory for 5 hours
			// 5(hours) = 1000(ms) * 60(seconds) * 60(minutes) * 5 = 18000000
			obj.time - now <= 18e6 );

	console.log( ratesCache, exists );

	return exists;
}


function listUnits () {
	return Object.keys( converters );
}

bot.addCommand({
	name : 'convert',
	fun : convert,
	permissions : {
		del : 'NONE'
	},
	description : 'Converts several units, case sensitive. ' +
		'`/convert <num><unit>` ' +
		'For money: `/convert [<num>]<currency> to|in <currency>` ' +
		'Pass in list for supported units `/convert list`',
	async : true
});
}());
