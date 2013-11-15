(function () {

var template = '[{display_name}]({link}) '           +
		'has {reputation} reputation, '              +
		'earned {reputation_change_day} rep today, ' +
		'asked {question_count} questions, '         +
		'gave {answer_count} answers. ' +
        'avg. rep/post: {avg_rep_post}. ' +
		'Badges: {gold}g {silver}s {bronze}b ';

function stat ( msg, cb ) {
	var id = msg.toString();

	if ( !id ) {
		id = msg.get( 'user_id' );
	}
	else if ( !/^\d+$/.test(id) ) {
		id = msg.findUserid( id );
	}

	if ( id < 0 ) {
		return 'User Elusio proved elusive.';
	}

	//~5% chance
	if ( Math.random() <= 0.05 ) {
		finish( 'That dude sucks' );
		return;
	}

	IO.jsonp({
		url : 'https://api.stackexchange.com/2.0/users/' + id,
		data : {
			site   : bot.adapter.site,
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
			res = handleUserObject( user );
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

function handleUserObject ( user ) {
	var res = template.supplant( normalizeStats(user) );

	bot.log( res, '/stat templated' );
	return res;
}

function normalizeStats ( stats ) {
	stats = Object.merge({
		question_count        : 0,
		answer_count          : 0,
		reputation_change_day : 0
	}, stats );

    stats = Object.merge( stats.badge_counts, stats );

    stats.avg_rep_post = (
		stats.reputation / ( stats.question_count + stats.answer_count )
	).maxDecimal( 2 );

	//1 / 0 === Infinity
	if ( stats.avg_rep_post === Infinity ) {
		stats.avg_rep_post = 'T͎͍̘͙̖̤̉̌̇̅ͯ͋͢͜͝H̖͙̗̗̺͚̱͕̒́͟E̫̺̯͖͎̗̒͑̅̈ ̈ͮ̽ͯ̆̋́͏͙͓͓͇̹<̩̟̳̫̪̇ͩ̑̆͗̽̇͆́ͅC̬͎ͪͩ̓̑͊ͮͪ̄̚̕Ě̯̰̤̗̜̗͓͛͝N̶̴̞͇̟̲̪̅̓ͯͅT͍̯̰͓̬͚̅͆̄E̠͇͇̬̬͕͖ͨ̔̓͞R͚̠̻̲̗̹̀>̇̏ͣ҉̳̖̟̫͕ ̧̛͈͙͇͂̓̚͡C͈̞̻̩̯̠̻ͥ̆͐̄ͦ́̀͟A̛̪̫͙̺̱̥̞̙ͦͧ̽͛̈́ͯ̅̍N̦̭͕̹̤͓͙̲̑͋̾͊ͣŅ̜̝͌͟O̡̝͍͚̲̝ͣ̔́͝Ť͈͢ ̪̘̳͔̂̒̋ͭ͆̽͠H̢͈̤͚̬̪̭͗ͧͬ̈́̈̀͌͒͡Ơ̮͍͇̝̰͍͚͖̿ͮ̀̍́L͐̆ͨ̏̎͡҉̧̱̯̤̹͓̗̻̭ͅḐ̲̰͙͑̂̒̐́̊';
	}

    //TODO: find out what people want out of Q/A ratio, and do it.

	return stats;
}
var cmd = {
	name : 'stat',
	fun : stat,
	permissions : {
		del : 'NONE'
	},

	description : 'Gives useless stats on a user. ' +
		'`/stat [usrid|usrname]`',
	async : true
};
bot.addCommand( cmd );

// alias for stupid rlemon
var statsCmd = Object.merge( cmd, { name : 'stats'} );
bot.addCommand(statsCmd);

}());
