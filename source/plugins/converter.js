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
var alias = {
	lbs : 'lb' };

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
