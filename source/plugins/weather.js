(function () {
var weather = {
	latlon : function ( lat, lon, cb ) {
		IO.jsonp({
			url : 'http://api.openweathermap.org/data/2.1/find/city',
			jsonpName : 'callback',
			data : {
				lat : lat,
				lon : lon,
				cnt : 1, //limit to 1 result
				type : 'json'
			},

			fun : this.finishCb( cb )
		});
	},

	city : function ( city, cb ) {
		IO.jsonp({
			url : 'http://api.openweathermap.org/data/2.1/find/name',
			jsonpName : 'callback',
			data : {
				q : city,
				type : 'json'
			},

			fun : this.finishCb( cb )
		});
	},

	finishCb : function ( cb ) {
		var self = this;

		return function ( resp ) {
			cb( self.format(resp) );
		};
	},

	format : function ( resp ) {
		var list = resp.list;

		if ( !list ) {
			console.error( resp );
			return 'Sorry, I couldn\'t get the data: ' + resp.message;
		}
		return list.map( this.formatter ).join( '; ' );
	},
	formatter : function ( data ) {
		var temps = data.main,
			ret;

		temps.celsius = ( temps.temp - 273.15 ).maxDecimal( 4 );

		ret =
			bot.adapter.link(
				data.name, 'http://openweathermap.org/city/' + data.id
			) +
			': {celsius}C ({temp}K)'.supplant( temps );

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
	else {
		weather.city( args.content, args.reply.bind(args) );
	}
}

bot.addCommand({
	name : 'weather',
	fun : weatherCommand,
	permissions : {
		del : 'NONE',
	},
	async : true,

	description : 'Gets current weather: ' +
		'`/weather (lan, lon)` or `/weather city`'
});
}());
