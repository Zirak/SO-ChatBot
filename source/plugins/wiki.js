(function () {
"use strict";

function command ( args, cb ) {
	IO.jsonp({
		url : 'http://en.wikipedia.org/w/api.php',
		jsonpName : 'callback',
		data : {
			action : 'opensearch',
			search : args.toString(),
			limit : 1,
			format : 'json'
		},
		fun : finish
	});

	function finish ( resp ) {
		//the result will look like this:
		// [search_term, [title0, title1, title2, ...], [description0, description1...], [link0, link1...]]
		//we only asked for one result, so the inner arrays will have only 1 item each
		var title = resp[ 1 ][ 0 ],
			base = 'http://en.wikipedia.org/wiki/',
			found = true, res;

		if ( !title ) {
			found = false;
			res = [
				'No result found',
				'The Wikipedia contains no knowledge of such a thing',
				'The Gods of Wikipedia did not bless us'
			].random();
		}
		else {
			res = resp[3][0]; // grab the link from the last inner array
		}

		if ( cb && cb.call ) {
			cb( res );
		}
		else if ( found ){
			args.directreply( res );
		}
		else {
			args.reply( res );
		}
	}
}

bot.addCommand({
	name : 'wiki',
	fun : command,
	permissions : {
		del : 'NONE'
	},

	description : 'Search Wikipedia. `/wiki term`',
	async : true
});
})();
