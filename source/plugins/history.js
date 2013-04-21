(function () {
var history = {
	command : function historyCommand ( args ) {
		var params = this.extractParams( args );

		if ( params.error ) {
			return params.error;
		}

		this.fetchData( params, finish );

		function finish ( results ) {
			args.reply( results.random() );
		}
	},

	handleResponse : function ( resp, cb ) {
		var query = resp.query,
			html = query.pages[ query.pageids[0] ].extract;
		var root = document.createElement( 'body' );
		root.innerHTML = html; //forgive me

		var headers = root.getElementsByTagName( 'h2' );

		cb( getEvents(root, headers[1]) );
	},

	extractParams : function ( args ) {
		var ret = {},
			date;

		if ( !args.length ) {
			date = new Date();

			ret.month = date.getMonth() + 1;
			ret.day = date.getDate();
			return ret;
		}

		var parts = /(\d{2})(?:-|\/)?(\d{2})/.exec( args );
		if ( parts && parts.length === 3 ) {
			ret.month = Number( parts[1] );
			ret.day = Number( parts[2] );
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

	fetchData : function ( params, cb ) {
		var param = [ this.monthName(params.month), params.day ].join( ' ' );
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
				titles : param
			},
			fun : function ( resp ) {
				self.handleResponse( resp, cb );
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
		'given in MM-DD format. `/inhistory [MM-DD]`'
});
})();
