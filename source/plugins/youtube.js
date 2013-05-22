(function () {
var nulls = [
	'Video not found (rule 35?)',
	'I could not find such a video',
	'The Lords of YouTube did not find your query favorable' ];
function youtube ( args, cb ) {
	IO.jsonp({
		url : 'https://gdata.youtube.com/feeds/api/videos',
		jsonpName : 'callback',
		data : {
			q : args.toString(),
			'max-results' : 1,
			v : 2,
			alt : 'json'
		},
		fun : finish
	});

	//the response looks something like this:
	/*
	{
		tons of crap
		"entry" : [{
			lots of crap
			"link" : [{
				some crap
				"href" : what we care about
			}]
			some more crap
		}]
		and then some more
	}
	*/
	function finish ( resp ) {
		var entry = resp.feed.entry;
		if ( !entry || !entry.length ) {
			args.reply( nulls.random() );
		}
		else {
			args.send( entry[0].link[0].href );
		}
	}
}

bot.addCommand({
	name : 'youtube',
	fun : youtube,
	permissions : {
		del : 'NONE'
	},
	description : 'Search Youtube. `/youtube query`',
	async : true
});
}());
