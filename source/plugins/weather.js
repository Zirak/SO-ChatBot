module.exports = function (bot) {
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

        bot.IO.jsonp({
            url : 'http://api.openweathermap.org/data/2.5/weather',
            jsonpName : 'callback',
            data : {
                lat : lat,
                lon : lon,
                cnt : 1, //limit to 1 result,
                appid: bot.config.weatherKey,
                type : 'json'
            },

            fun : this.finishCb( cb ),
            error : this.errorCb( cb )
        });
    },

    city : function ( city, cb ) {
        bot.IO.jsonp({
            url : 'http://api.openweathermap.org/data/2.5/weather',
            jsonpName : 'callback',
            data : {
                q : city,
                appid: bot.config.weatherKey,
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

        temps.celsius = ( temps.temp - 273.15 ).maxDecimal( 2 );

        ret =
            bot.adapter.link(
                data.name, 'http://openweathermap.org/city/' + data.id
            ) + ': ';

        //to help our dear American friends, also include fahrenheit
        if ( fahrenheitCountries[data.sys.country] ) {
            temps.fahrenheit = ( temps.temp * 9/5 - 459.67 ).maxDecimal( 2 );
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
};
