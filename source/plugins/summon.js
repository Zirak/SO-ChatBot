(function () {
"use strict";

var summon = function ( args ) {
	var room = Number( args );

	if ( !room ) {
		return 'That aint no room I ever heard of! ' +
			'`/help summon` for usage info';
	}

	bot.adapter.in.init( room );
};
var unsummon = function ( args, cb ) {
	var room = args.content ? Number( args ) : args.get( 'room_id' );

	if ( !room ) {
		return 'That aint no room I ever heard of! ' +
			'`/help unsummon` for usage info';
	}

	bot.adapter.in.leaveRoom( room, function ( err ) {
		if ( err === 'base_room' ) {
			finish( 'I can\'t leave my home.' );
		}
	});

	function finish ( res ) {
		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.reply( res );
		}
	}
};

bot.addCommand( bot.CommunityCommand({
	name : 'summon',
	fun : summon,
	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Say boopidi bee and in the room I shall appear. '+
		'`/summon roomid`'
}));

bot.addCommand( bot.CommunityCommand({
	name : 'unsummon',
	fun : unsummon,
	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Chant zippidi dee and from the room I shall take my leave. ' +
		'`/unsummon [roomid=your_roomid]`'
}));

})();
