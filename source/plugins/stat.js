(function () {

var template = '[{display_name}]({link}) '          +
		'has {reputation} reputation, '             +
		'earned {reputation_change_day} rep today, '+
		'asked {question_count} questions, '        +
		'gave {answer_count} answers, '             +
		'for a q:a ratio of {ratio}';

function stat ( msg, cb ) {
	var args = msg.parse(),
		id = args[ 0 ];

	if ( !/^\d+$/.test(id) ) {
		id = msg.findUserid( id );
	}

	IO.jsonp({
		url : 'https://api.stackexchange.com/2.0/users/' + id,
		data : {
			site   : 'stackoverflow',
			filter :  '!G*klMsSp1IcBUKxXMwhRe8TaI(' //ugh, don't ask...
		},
		fun : done
	});

	function done ( resp ) {
		if ( resp.error_message ) {
			finish( resp.error_message );
			return;
		}

		var user = resp.items[ 0 ], res;

		if ( !user ) {
			res = 'User ' + id + ' not found';
		}
		else {
			user = normalize_stats( user );
			console.log( user, '/stat normalized' );
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

function normalize_stats ( stats ) {
	stats = Object.merge(
		{
			question_count        : 0,
			answer_count          : 0,
			reputation_change_day : 0
		},
		stats );

	stats.ratio = Math.ratio( stats.question_count, stats.answer_count );

	return stats;
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
