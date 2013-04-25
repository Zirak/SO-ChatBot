(function () {
"use strict";

var history = {
	command : function historyCommand ( args, cb ) {
		var params = this.extractParams( args );

		if ( params.error ) {
			return params.error;
		}

		this.fetchData( params, finish );

		function finish ( results ) {
			var res = results.random();

			if ( cb && cb.call ) {
				cb( res );
			}
			else {
				args.reply( res );
			}
		}
	},

	handleResponse : function ( resp, params, cb ) {
		var query = resp.query,
			html = query.pages[ query.pageids[0] ].extract;
		var root = document.createElement( 'body' );
		root.innerHTML = html; //forgive me

		var headers = root.getElementsByTagName( 'h2' ),
			events = getEvents( root, headers[1] );

		cb( this.filter(events, params) );
	},

	extractParams : function ( args ) {
		var ret = {},
			date;

		if ( !args.length || args.toLowerCase() === 'today' ) {
			date = new Date();

			ret.month = date.getMonth() + 1;
			ret.day = date.getDate();
			return ret;
		}

		var parts;

		//simple YYYY
		parts = /\d{4}/.exec( args );
		if ( parts ) {
			ret.year = Number( parts[0] );
			return ret;
		}

		parts = /(\d{4})?(?:-|\/)?(\d{2})(?:-|\/)?(\d{2})/.exec( args );
		if ( parts ) {
			parts[1] && ( ret.year = Number(parts[1]) );
			ret.month = Number( parts[2] );
			ret.day = Number( parts[3] );
		}
		else {
			return error();
		}

		if (
			ret.month < 1 || ret.month > 12 || ret.day < 1 || ret.day > 31 ||
			( ret.month === 2 && ret.day > 29 )
		) {
			return error();
		}
		return ret;

		function error () {
			return {
				error : 'That format confuses me! See `/help inhistory`'
			};
		}
	},

	filter : function ( events, params ) {
		//we only need to apply filtering for YYYY-MM-DD, not for MM-DD or YYYY
		if ( !params.year || !params.month ) {
			return events;
		}

		//limit to only the parameter year
		return events.filter(function ( data ) {
			var year = ( /^\d+/.exec(data) || [] )[ 0 ];

			return Number( year ) === params.year;
		});
	},

	fetchData : function ( params, cb ) {
		var titles = [];

		if ( params.year && !params.month ) {
			titles = [ params.year ];
		}
		else {
			titles = [ this.monthName(params.month), params.day ];
		}

		var url = 'http://en.wikipedia.org/w/api.php';

		var self = this;
		IO.jsonp({
			url : url,
			jsonpName : 'callback',
			data : {
				format : 'json',
				action : 'query',
				prop : 'extracts',
				indexpageids : true,
				titles : titles.join( ' ' )
			},
			fun : function ( resp ) {
				self.handleResponse( resp, params, cb );
			}
		});
	},

	monthName : function ( month ) {
		return [
			'january', 'february', 'march', 'april',
			'may', 'june', 'july', 'august',
			'september', 'october', 'november', 'december'
		][ month - 1 ];
	}
};

function getEvents ( root, stopNode ) {
	var matches = [];

	(function filterEvents (root) {
		var node = root.firstElementChild;

		for (; node; node = node.nextElementSibling) {
			if (node === stopNode) {
				return;
			}

			var tag = node.tagName;
			if (tag === 'UL') {
				filterEvents(node);
				continue;
			}
			else if (tag !== 'LI' ) {
				continue;
			}

			matches.push( node );
		}
	})( root );

	//we need to flatten out the resulting elements, and we're done!
	return flatten(matches);
}

function flatten ( lis ) {
	return [].reduce.call(lis, extract, []);

	function extract ( ret, li ) {

		if ( li.children.length ) {
			ret.push.apply( ret, flatten(li.getElementsByTagName('li')) );
		}
		else {
			ret.push( li.firstChild.data );
		}
		return ret;
	}
}

bot.addCommand({
	name : 'inhistory',
	fun : history.command,
	thisArg : history,
	permissions : {
		del : 'NONE'
	},

	description : 'Grabs a historical event from today\'s date or a date ' +
		'given in MM-DD format. `/inhistory [MM-DD]`',
	async : true
});
})();
