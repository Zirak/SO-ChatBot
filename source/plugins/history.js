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
		var html = resp.parse.text,
			root = document.createElement( 'body' );
		root.innerHTML = html; //forgive me

		var events = getEventsAsText( root );

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
		if ( parts = /^\d{4}$/.exec(args) ) {
			ret.year = Number( parts[0] );
		}
		else if (
			parts = /^(?:(\d{4})(?:-|\/))?(\d{2})(?:-|\/)(\d{2})$/.exec( args )
		) {
			parts[1] && ( ret.year = Number(parts[1]) );
			ret.month = Number( parts[2] );
			ret.day = Number( parts[3] );
		}
		else {
			return error();
		}

		bot.log( ret, '/inhistory extractParams' );

		if ( !this.paramsCheck(ret) ) {
			return error();
		}
		return ret;

		function error () {
			return {
				error : 'That format confuses me! See `/help inhistory`'
			};
		}
	},

	paramsCheck : function ( params ) {
		var year  = params[ year ],
			month = params[ month ],
			day   = params[ day ];

		//fuck this shit, I have nowhere else to put it
		if ( month === 2 && day > 29 ) {
			return false;
		}

		//we're not very picky, since wikipedia may contain future dates
		var yearCheck = year === undefined || year > 0;
		var monthCheck = month === undefined || (
			month >= 1 && month <= 12
		);
		var dayCheck = day === undefined || (
			day >= 1 && day <= 31
		);

		return yearCheck && monthCheck && dayCheck;
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
				action : 'parse',
				mobileformat : 'html',
				prop : 'text',
				page : titles.join( ' ' )
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

// http://tinker.io/53895
function getEventsAsText ( root ) {
	var linkBase = 'http://en.wikipedia.org';

	/*
	  the html looks like:
	  <h2 class="section_heading" id="section_1"><span id="Events">Events</span></h2>
	  <div class="content_block" id="content_1">
	    ...
	  </div>
	*/
	//fun fact: document-fragments don't have a getElementById, so we're left to
	// use querySelector. which is totally the way to do it.
	var lists = root.querySelectorAll('#content_1 > ul');

	/*
	  <li>
	    <a href="/wiki/January_5" title="January 5">January 5</a> –
	    <a href="/wiki/Emperor_Go-Sai" title="Emperor Go-Sai">Emperor Go-Sai</a>ascends the throne of <a href="/wiki/Japan" title="Japan">Japan</a>.
	  </li>
	*/
	//however, there are also multi-tiered results:
	/*
	  <li>
	    <a href="/wiki/July_27" title="July 27">July 27</a>

		<ul>
		  <li>The Jews in <a href="/wiki/New_Amsterdam" title="New Amsterdam">New Amsterdam</a> petition for a separate Jewish cemetery.
		  </li>

		  <li>The <a href="/wiki/Netherlands" title="Netherlands">Netherlands</a> and <a href="/wiki/Brandenburg" title="Brandenburg">Brandenburg</a> sign a military treaty.
		  </li>
		</ul>
	  </li>
	*/

	var ret = [];
	for (var i = 0, len = lists.length; i < len; i += 1) {
		ret.push.apply( ret, flattenList(lists[i]) );
	}
	return ret;

	function flattenList ( list ) {
		return Array.map( list.children, extract );

		function extract ( li ) {
			var links = li.getElementsByTagName( 'a' );
			while ( links.length ) {
				replaceLink( links[0] );
			}

			return Array.reduce( li.childNodes, extractFromLi, [] )
				.join( '' ).trim();
		}

		function extractFromLi ( ret, node ) {
			if ( node.tagName === 'UL' ) {
				ret.push.apply(
					ret,
					flattenList( node ).map(function ( t ) {
						return node.firstChild.data + ' – ' + t;
					}) );
			}
			else if ( node.nodeType === 1 ) {
				ret.push( node.textContent );
			}
			else {
				ret.push( node.data );
			}

			return ret;
		}

		function replaceLink ( link ) {
			var textLink = bot.adapter.link(
				link.textContent, linkBase + link.getAttribute('href')
			),
				textNode = document.createTextNode( textLink );

			link.parentNode.replaceChild( textNode, link );
		}
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
