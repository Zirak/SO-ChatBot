(function () {
"use strict";
//this and the history.js file are nearly identical, as they both manually have
// to grab and parse from the wikimedia API

var notFoundMsgs = [
	'No definition found.',
	'It means I aint got time to learn your $5 words',
	'My pocket dictionary just isn\'t good enough for you.'
];

var define = {
	command : function defineCommand ( args, cb ) {
		bot.log( args, '/define input' );
		this.fetchData( args, finish );

		function finish ( results, pageid ) {
			bot.log( results, '/define results' );
			//TODO: format. so far we just be lazy and take the first one
			var res = results[ 0 ];

			if ( !res ) {
				res = notFoundMsgs.random();
			}
			else {
				res = bot.adapter.link(
					args, 'http://en.wiktionary.org/wiki?curid=' + pageid
				) + ' ' + res;
			}

			if ( cb && cb.call ) {
				cb( res );
			}
			else {
				args.reply( res );
			}
		}
	},

	handleResponse : function ( resp, cb ) {
		var query = resp.query,
			pageid = query.pageids[ 0 ],
			html = query.pages[ pageid ].extract;

		if ( pageid === '-1' ) {
			cb( [], -1 );
			return;
		}

		var root = document.createElement( 'body' );
		root.innerHTML = html; //forgive me...

		//the first ol has all the data we need
		cb( getEvents(root.getElementsByTagName('ol')[0]), pageid );
	},

	fetchData : function ( term, cb ) {
		var self = this;

		IO.jsonp({
			url : 'http://en.wiktionary.org/w/api.php',
			jsonpName : 'callback',
			data : {
				action : 'query',
				titles : term.toString(),
				format : 'json',
				prop : 'extracts',
				indexpageids : true
			},
			fun : function ( resp ) {
				self.handleResponse( resp, cb );
			}
		});
	}
};

//example of partial extract:
/*
  <h2> Translingual</h2>\n\n
  <p>Wikipedia</p>\n
  <h3> Symbol</h3>\n
  <p><b>42</b> (<i>previous</i>  <b>41</b>, <i>next</i>  <b>43</b>)</p>\n
  <ol>
      <li>The cardinal number forty-two.</li>\n</ol>
*/
//we just want the li data
function getEvents ( root, stopNode ) {
	var matches = [];

	(function filterEvents (root) {
		var node = root.firstElementChild;

		for (; node; node = node.nextElementSibling) {
			if (node === stopNode) {
				return;
			}
			else if (node.tagName !== 'LI' ) {
				continue;
			}

			matches.push( node );
		}
	})( root );

	//we need to flatten out the resulting elements, and we're done!
	return flatten(matches);
}
function flatten ( lis ) {
	return [].map.call( lis, extract );

	function extract ( li ) {
		return li.firstChild.data;
	}
}

bot.addCommand({
	name : 'define',
	fun : define.command,
	thisArg : define,
	permissions : {
		del : 'NONE'
	},

	description : 'Fetches definition for a given word. `/define something`',
	async : true
});
}());
