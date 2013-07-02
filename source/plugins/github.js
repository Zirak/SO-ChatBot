// issue #51 https://github.com/Zirak/SO-ChatBot/issues/51

//valid args are one of the following:
// /github reponame
//which searches for a repository `reponame`
// /github username/reponame
//which searches for a repository `reponame` under `username`
var github = {

	command : function ( args, cb ) {
		var parts = /^([\S]+?)(?:\/([\S]+))?$/.exec( args ),
			format = this.formatCb( finish );

		bot.log( parts, '/github input' );

		if ( !parts ) {
			finish( 'I can\'t quite understand that format. ' +
					'See `/help github` for, well...help.' );
		}
		else if ( !parts[2] ) {
			this.searchRepo( parts[1], format );
		}
		else {
			this.searchUserRepo( parts[1], parts[2], format );
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

	formatCb : function ( cb ) {
		var repoFullName = '{owner}/{name}';

		return function format ( repo ) {
			if ( repo.error ) {
				cb( repo.error );
				return;
			}

			//there are inconsistensies between the data returned from one
			// API call and another. there're two important ones here:
			//1. we have a full repo name (user/repoName) in one, but not
			//     the other (and different property names can be used to
			//     construct it)
			//2. the link to the repo is called html_url in one, and
			//      url in the other (in the former, url means something else)
			var fullName = repo.full_name ?
				repo.full_name : repoFullName.supplant( repo ),
				url = repo.html_url || repo.url;

			cb(
				bot.adapter.link(fullName, url ) + ' ' + repo.description
			);
		};
	},

	searchRepo : function ( repoName, cb ) {
		var keyword = encodeURIComponent( repoName );

		IO.jsonp({
			url : 'https://api.github.com/legacy/repos/search/' + keyword,
			jsonpName : 'callback',

			fun : finish
		});

		function finish ( resp ) {
			bot.log( resp, '/github searchRepo response' );
			var repo = resp.data.repositories[ 0 ];

			if ( !repo ) {
				repo = {
					error : 'No results found'
				};
			}

			cb( repo );
		}
	},

	searchUserRepo : function ( userName, repoName, cb ) {
		var keyword = encodeURIComponent( userName );
		repoName = encodeURIComponent(
			repoName.replace( / /g, '-' ).toLowerCase() );

		var url = 'https://api.github.com/repos/{0}/{1}';
		IO.jsonp({
			url : url.supplant( keyword, repoName ),
			jsonpName : 'callback',

			fun : finish
		});

		function finish ( resp ) {
			bot.log( resp, '/github searchUserRepo response' );

			var data = resp.data;

			if ( data.message === 'Not Found' ) {
				data = {
					error : 'User/Repo not found'
				};
			}

			cb( data );
		}
	}
};

bot.addCommand({
	name : 'github',
	fun  : github.command,
	thisArg : github,
	permissions : {
		del : 'NONE'
	},
	description : 'Search github for a repo.' +
		'`/github repoName` or `/github username/reponame`',
	async : true
});
