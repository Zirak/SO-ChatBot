(function () {
var types = {
	answer   : true,
	question : true };
var ranges = {
	//the result array is in descending order, so it's "reversed"
	first : function ( arr ) {
		return arr[ arr.length - 1 ];
	},

	last : function ( arr ) {
		return arr[ 0 ];
	},

	between : function ( arr ) {
		//SO api takes care of this for us
		return arr;
	}
};

function get ( args, cb ) {
	//default:
	// /get type range usrid
	var parts = args.parse(),
		type = parts[ 0 ] || 'answer',
		plural = type + 's',

		range = parts[ 1 ] || 'last',

		usrid = parts[ 2 ];

	//if "between" is given, fetch the correct usrid
	// /get type between start end usrid
	if ( range === 'between' ) {
		usrid = parts[ 4 ];
	}

	//range is a number and no usrid, assume the range is the usrid, and
	// default range to last
	// /get type usrid
	if ( !usrid && !isNaN(range) ) {
		usrid = range;
		range = 'last';
	}

	//if after all this usrid is falsy, assume the user's id
	if ( !usrid ) {
		usrid = args.get( 'user_id' );
	}

	bot.log( parts, 'get input' );

	if ( !types.hasOwnProperty(type) ) {
		return 'Invalid "getter" name ' + type;
	}
	if ( !ranges.hasOwnProperty(range) ) {
		return 'Invalid range specifier ' + range;
	}

	var url = 'http://api.stackexchange.com/2.1/users/' + usrid + '/' + plural;
	var params = {
		site : bot.adapter.site,
		sort : 'creation',
		//basically, only show answer/question id and their link
		filter : '!BGS1(RNaKd_71l)9SkX3zg.ifSRSSy'
	};

	bot.log( url, params, '/get building url' );

	if ( range === 'between' ) {
		params.fromdate = Date.parse( parts[2] );
		params.todate = Date.parse( parts[3] );

		bot.log( url, params, '/get building url between' );
	}

	IO.jsonp({
		url  : url,
		data : params,
		fun  : parseResponse
	});

	function parseResponse ( respObj ) {
		//Une erreru! L'horreur!
		if ( respObj.error_message ) {
			args.reply( respObj.error_message );
			return;
		}

		//get only the part we care about in the result, based on which one
		// the user asked for (first, last, between)
		//respObj will have an answers or questions property, based on what we
		// queried for, in array form
		var posts = [].concat( ranges[range](respObj.items) ),
			res;

		bot.log( posts.slice(), '/get parseResponse parsing' );

		if ( posts.length ) {
			res = makeUserResponse( posts );
		}
		else {
			res = 'User did not submit any ' + plural;
		}
		bot.log( res, '/get parseResponse parsed');

		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.directreply( res );
		}
	}

	function makeUserResponse( posts ) {
		return posts.map(function ( post ) {
			return post.link;
		}).join ( ' ; ');
	}
}

bot.addCommand({
	name : 'get',
	fun  : get,
	permissions : {
		del : 'NONE'
	},
	async : true
});

}());
