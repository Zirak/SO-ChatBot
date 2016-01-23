module.exports = function (bot) {
"use strict";

var converters = {
    //temperatures
    // 1C = 32.8F = 274.15K
    C : function ( c ) {
        return {
            F : c * 1.8 + 32, // 9/5 = 1.8
            K : c + 273.15
        };
    },
    F : function ( f ) {
        return {
            C : (f - 32) / 1.8,
            K : (f + 459.67) * 5 / 9
        };
    },
    K : function ( k ) {
        if ( k < 0 ) {
            return {
                C : 0,
                F : 0
            };
        }

        return {
            C : k - 273.15,
            F : k * 1.8 - 459.67
        };
    },

    //lengths
    //1m = 3.2808(...)f
    m : function ( m ) {
        return {
            f : m * 3.280839895
        };
    },
    f : function ( f ) {
        return {
            m : f / 3.28083989
        };
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
            r : d * Math.PI / 180
        };
    },
    r : function ( r ) {
        return {
            d : r * 180 / Math.PI
        };
    },

    //weights
    g : function ( g ) {
        return {
            lb : g * 0.0022,
            //the following will be horribly inaccurate
            st : g * 0.000157473
        };
    },
    lb : function ( lb ) {
        return {
            g : lb * 453.592,
            st : lb * 0.0714286
        };
    },
    //stones: 1st = 6350g = 14lb
    st : function ( st ) {
        return {
            g : st * 6350.29,
            lb : st * 14
        };
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

var currencies = require('static/currencyNames'),
    symbols = require('static/currencySymbols');

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
            rate = this.checkCache();

        if ( rate ) {
            cb( rate );
            return;
        }

        bot.IO.jsonp({
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
                obj.time - now <= 18e6
        );

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
};
