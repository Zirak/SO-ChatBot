// issue #51 introduced this feature; #97 added user search.

//valid args are one of the following:
// /github reponame
//which searches for a repository `reponame`
// /github username/
//which searches for a usernam `username`
// /github username/reponame
//which searches for a repository `reponame` under `username`
var github = {
	command : function ( args, cb ) {
		var parts = /^([\S]+?)(?:(\/)([\S]+)?)?$/.exec( args ) || [],
			self = this;

		parts = parts.filter( Boolean ).map( encodeURIComponent );
		bot.log( args, parts, '/github input' );

		if ( !parts.length ) {
			finish( 'I can\'t quite understand that format. ' +
					'See `/help github` for, well...help.' );
		}
		// username/reponame
		else if ( parts[3] ) {
			this.searchUserRepo( parts[1], parts[3], format );
		}
		// username/
		else if ( parts[2] ) {
			this.searchUser( parts[1], format );
		}
		// reponame
		else {
			this.searchRepo( parts[1], format );
		}

		function format ( obj ) {
			var res;

			if ( obj.error ) {
				res = obj.error;
			}
			else if ( obj.type === 'user' ) {
				res = self.userFormat( obj );
			}
			else {
				res = self.repoFormat( obj );
			}

			finish( res );
		}
		function finish ( res ) {
			bot.log( res, '/github finish' );

			if ( cb && cb.call ) {
				cb( res );
			}
			else {
				args.reply( res );
			}
		}
	},

	repoFormat : function ( repo ) {
		var name = repo.full_name, url = repo.html_url;

		return bot.adapter.link( name, url ) + ' ' + repo.description;
	},

	userFormat : function ( user ) {
		return bot.adapter.link( user.login, user.html_url );
	},

	searchRepo : function ( repoName, cb ) {
		IO.jsonp({
			url : 'https://api.github.com/search/repositories',
			data : {
				q : repoName
			},
			jsonpName : 'callback',

			fun : finish
		});

		function finish ( resp ) {
			bot.log( resp, '/github searchRepo response' );
			var repo = ( resp.data.items || [] )[ 0 ];

			repo = repo || { error : 'No results found' };
			repo.type = 'repo';

			cb( repo );
		}
	},

	searchUser : function ( username, cb ) {
		this.sendAPIQuery( '/search/users', { q : username }, finish );

		function finish ( resp ) {
			bot.log( resp, '/github searchUser response' );
			var user = ( resp.data.items || [] )[ 0 ];

			user = user || { error : 'No results found.' };
			user.type = 'user';

			cb( user );
		}
	},

	searchUserRepo : function ( userName, repoName, cb ) {
		this.searchRepo( repoName + ' user:' + userName, cb );
	},

	sendAPIQuery : function ( path, data, cb ) {
		IO.jsonp({
			url : 'https://api.github.com' + path,
			data : data,
			jsonpName : 'callback',

			fun : cb
		});
	}
};

bot.addCommand({
	name : 'github',
	fun  : github.command,
	thisArg : github,
	permissions : {
		del : 'NONE'
	},
	description : 'Search github for a user or repo.' +
		'`/github repoName` or `/github username/reponame` or ' +
		'`/github username/`',
	async : true
});
