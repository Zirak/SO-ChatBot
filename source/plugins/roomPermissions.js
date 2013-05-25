(function () {
"use strict";
var ownerRoom = 17;

if ( bot.adapter.roomid !== ownerRoom ) {
	return;
}

var muted = JSON.parse( localStorage.bot_muted || '{}' );

function giveVoice ( id, cb ) {
	bot.log( 'giving voice to ' + id );

	IO.xhr({
		method : 'POST',
		url : '/rooms/setuseraccess/' + ownerRoom,
		data : {
			aclUserId : id,
			fkey : bot.adapter.fkey,
			userAccess : 'read-write'
		},

		complete : finish
	});

	function finish () {
		delete muted[ id ];

		if ( cb ) {
			localStorage.bot_muted = JSON.stringify( muted );
			cb && ( cb.apply(null, arguments) );
		}
	}
}
function takeVoice ( id, reason, cb ) {
	bot.log( 'taking voice from %s because: %s', id, reason );
	IO.xhr({
		method : 'POST',
		url : '/rooms/setuseraccess/' + ownerRoom,
		data : {
			aclUserId : id,
			fkey : bot.adapter.fkey,
			userAccess : 'remove'
		},

		complete : finish
	});

	function finish () {
		muted[ id ] = { reason : reason };

		localStorage.bot_muted = JSON.stringify( muted );
		cb.apply( null, arguments );
	}
}

function muteList () {
	return Object.keys( muted ).map(function ( k ) {
		return k + ' (' + muted[ k ].reason + ')';
	}).join( '; ' );
}

IO.register( 'userregister', function permissionCb ( user, room ) {
	bot.log( user, room, 'permissionCb' );
	var id = user.id;

	if ( Number(room) !== ownerRoom || bot.isOwner(id) || muted[id] ) {
		bot.log( 'not giving voice', user, room );
		return;
	}

	giveVoice( id );
});

bot.addCommand({
	name : 'mute',
	fun : function mute ( args ) {
		var parts = args.parse();

		if ( !parts.length ) {
			return muteList();
		}
		else if ( parts.length < 2 ) {
			return 'Please give mute reason, see `/help mute`';
		}

		bot.log( parts, '/mute input' );

		var id = parts[ 0 ],
			name;
		if ( /\D/.test(id) ) {
			name = id;
			id = args.findUserid( id );
		}
		if ( id < 0 ) {
			return 'User ' + name + ' not found';
		}

		takeVoice( id, parts[1], finish );

		function finish () {
			var msg = 'Muted user ' + id;
			if ( name ) {
				msg += ' (' + name + ')';
			}

			args.reply( msg );
		}
	},

	permission : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Mutes a user. `/mute usrid reason`'
});

bot.addCommand({
	name : 'unmute',
	fun : function umute ( args ) {
		var id = args.parse()[ 0 ],
			name;

		bot.log( id, '/unmute input' );

		if ( !id ) {
			return 'Who shall I unmute?';
		}

		if ( /\D/.test(id) ) {
			name = id;
			id = args.findUserid( id );
		}
		if ( id < 0 ) {
			return 'User ' + name + ' not found';
		}

		giveVoice( id, finish );

		function finish () {
			var msg = 'Unmuted user ' + id;
			if ( name ) {
				msg += ' (' + name + ')';
			}
			args.reply( msg );
		}
	},

	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Unmutes a user. `/unmute usrid`'
});

})();
