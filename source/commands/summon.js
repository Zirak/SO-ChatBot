(function () {
"use strict";

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

function summon ( args ) {
	var room = Number( args );

	if ( !room ) {
		return 'That aint no room I ever heard of! ' +
			'`/help summon` for usage info';
	}

	bot.adapter.in.init( room );
};
})();
