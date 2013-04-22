(function () {
"use strict";
//this and the history.js file are nearly identical, as they both manually have
// to grab and parse from the wikimedia API

var define = {
	command : function defineCommand ( args, cb ) {
		bot.log( args, '/define input' );
		this.fetchData( args, finish );

		function finish ( results, pageid ) {
			bot.log( results, '/define results' );
			//TODO: format. so far we just be lazy and take the first one
			var res = results[ 0 ];

			if ( !res ) {
				res = 'No definition found';
			}
			else {
				res = bot.adapter.link(
					args, 'http://en.wiktionary.org/wiki?curid=' + pageid ) +
					' ' + res;
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

//cb is for internal usage by other commands/listeners
function command ( args, cb ) {
	//we already defined it, grab from memory
	//unless you have alzheimer
	//in which case, you have bigger problems
	if ( cache[args] ) {
		return finish( cache[args] );
	}

	IO.jsonp.ddg( 'define ' + args.toString(), finishCall );

	//the duck talked back! either the xhr is complete, or the hallucinations
	// are back
	function finishCall ( resp ) {
		var url = resp.AbstractURL,
			def = resp.AbstractText;

		bot.log( url, def, '/define finishCall input' );

		//Webster returns the definition as
		// wordName definition: the actual definition
		// instead of just the actual definition
		if ( resp.AbstractSource === 'Merriam-Webster' ) {
			def = def.replace( args + ' definition: ', '' );
			bot.log( def, '/define finishCall webster' );
		}

		if ( !def ) {
			//if no definition was found, try Urban Dictionary
			bot.getCommand( 'urban' ).exec( args );
			return;
		}
		else {
			def = args + ': ' + def; //problem?
			//the chat treats ( as a special character, so we escape!
			def += ' [\\(source\\)](' + url + ')';
			//add to cache
			cache[ args ] = def;
		}
		bot.log( def, '/define finishCall output' );

		finish( def );
	}

	function finish ( def ) {
		if ( cb && cb.call ) {
			cb( def );
		}
		else {
			args.directreply( def );
		}
	}
}

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
	return [].map.call(lis, extract);

	function extract ( li ) {
		return( li.firstChild.data );
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
