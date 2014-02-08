(function () {
"use strict";
//this and the history.js file are nearly identical, as they both manually have
// to grab and parse from the wikimedia API

var notFoundMsgs = [
	'No definition found.',
	'It means I aint got time to learn your $5 words.',
	'My pocket dictionary just isn\'t good enough for you.'
];
var wikiUrl = 'http://en.wiktionary.org';
//I wish regexps had the x flag...
/*
  ( ... )    # the category: alternative spelling, common missspelling, etc
   (of|for)  # alternative spelling of, aternative term for
  (.+?)\.?   # what this shit is an alternative of, sometimes followed by a dot
*/
var alternativeRe = /(alternative (spelling|term)|common misspelling|informal form|archaic spelling) (of|for) (.+?)\.?$/i;

var define = {
	command : function defineCommand ( args, cb ) {
		bot.log( args, '/define input' );
		this.fetchData( args.toString(), finish );

		function finish ( definition, pageid ) {
			bot.log( definition, pageid, '/define result' );
			var res;

			if ( pageid < 0 ) {
				res = notFoundMsgs.random();
			}
			else {
				res = bot.adapter.link(
					definition.name, wikiUrl + '/wiki?curid=' + pageid
				) + ' ' + definition.text;
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
			page = query.pages[ pageid ],
			html = page.extract;

		if ( pageid === '-1' ) {
			cb( {}, -1 );
			return;
		}

		var root = document.createElement( 'body' );
		root.innerHTML = html; //forgive me...
		var definition  = this.extractDefinition( root );

		//if this is an alternative definition (or spelling, or whatever),
		// return the actual version.
		if ( definition.alternative ) {
			bot.log( definition.alternative, '/define found alternative' );
			this.fetchData( definition.alternative, cb );
		}
		else {
			cb({
				name : page.title,
				text : definition.text
			});
		}
	},

	extractDefinition : function ( root ) {
		/*
		Result of 42:
			<ol>
				<li>The cardinal number forty-two.</li>
			</ol>

		Result of plugin:
			<ol>
				<li>
					<span class="use-with-mention">
						Alternative spelling of
						<i class="Latn mention" lang="en" xml:lang="en">
							<a href="/wiki/plug-in#English" title="plug-in">
								plug-in
							</a>
						</i>
					</span>
					.
				</li>
			</ol>

		Result of puling:
			<ol>
				<li>
					<span class="use-with-mention">
						Present participle of
						<i class="Latn mention" lang="en" xml:lang="en">
							<a href="/wiki/pule#English" title="pule">
								pule
							</a>
						</i>
					</span>
					.
				</li>
			</ol>
		*/
		var defList = root.getElementsByTagName( 'ol' )[ 0 ],
			defElement = defList.firstElementChild,
			links = defElement.getElementsByTagName( 'a' );

		//before we start messing around with the element's innards, try and
		// find if it's an alternative of something else.
		var alternative = this.extractAlternative( defElement.textContent );

		//be sure to replace links with formatted links.
		while ( links.length ) {
			replaceLink( links[0] );
		}

		return {
			alternative : alternative,
			text : defElement.textContent
		};

		function replaceLink ( link ) {
			var href = wikiUrl + link.getAttribute( 'href' ),
				textLink = bot.adapter.link( link.textContent, href ),

				textNode = document.createTextNode( textLink );

			link.parentNode.replaceChild( textNode, link );
		}
	},

	extractAlternative : function ( definitionText ) {
		return ( alternativeRe.exec(definitionText) || [] ).pop();
	},

	fetchData : function ( term, cb ) {
		var self = this;

		IO.jsonp({
			url : 'http://en.wiktionary.org/w/api.php',
			jsonpName : 'callback',
			data : {
				action : 'query',
				titles : term,
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
