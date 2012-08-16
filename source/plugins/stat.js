(function () {

var template = '[{display_name}]({link})'   +
		'has {reputation} reputation, '     +
		'asked {question_count} questions,' +
		'gave {answer_count} answers, '     +
		'for a q:a ratio of {ratio}';

function stat ( msg, cb ) {
	var args = msg.parse(),
		id = args[ 0 ];

	if ( !/^\d+$/.test(id) ) {
		id = msg.findUserid( id );
	}

	IO.jsonp({
		url : 'https://api.stackexchange.com/2.0/users/' + id,
		params : {
			site   : 'stackoverflow',
			filter :  '!G*klMsSp1IcBUKxXMwhRe8TaI(' //ugh, don't ask...
		},
		fun : done
	});

	function done ( resp ) {
		var user = resp.items[ 0 ], res;

		if ( !user ) {
			res = 'User ' + id + ' not found';
		}
		else {
			res = template.supplant( user );
		}

		finish( res );
	}

	function finish ( res ) {
		if ( cb ) {
			cb( res );
		}
		else {
			msg.reply( res );
		}
	}
}

bot.addCommand({
	name : 'stat',
	fun : stat,
	permissions : {
		del : 'NONE'
	},

	description : 'Gives useless stats on a user. `/stat usrid|usrname`'
});

}());
