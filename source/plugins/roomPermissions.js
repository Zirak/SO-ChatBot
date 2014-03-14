(function () {
"use strict";
var ownerRoom = 17;

if ( bot.adapter.roomid !== ownerRoom ) {
	return;
}

var muted = bot.memory.get( 'muted' );

function checkMuted () {
	var now = Date.now();

	Object.iterate( muted, function ( id, obj ) {
		if ( obj.endDate < now ) {
			giveVoice( id );
		}
	});

	setTimeout( checkMuted, 60 * 1000 );
}
setTimeout( checkMuted, 60 * 1000 );

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
		var args = Array.from( arguments );
		args.unshift( id );

		delete muted[ id ];

		if ( cb ) {
			bot.memory.save( 'muted' );
			cb && ( cb.apply(null, args) );
		}
	}
}
function takeVoice ( params, cb ) {
	bot.log( 'taking voice', params );

	IO.xhr({
		method : 'POST',
		url : '/rooms/setuseraccess/' + ownerRoom,
		data : {
			aclUserId : params.id,
			fkey : bot.adapter.fkey,
			userAccess : 'remove'
		},

		complete : finish
	});

	function finish () {
		muted[ params.id ] = {
			name : params.name,
			invokingId : params.invokingId,
			endDate : calcEndDate( params.duration ).getTime()
		};

		bot.memory.save( 'muted' );
		cb.apply( null, arguments );
	}

	function calcEndDate ( duration ) {
		var ret = new Date(),
			mod = duration.slice( -1 ),
			delta = Number( duration.slice(0, -1) );

		var modifiers = {
			m : function ( offset ) {
				ret.setMinutes( ret.getMinutes() + offset );
			},
			h : function ( offset ) {
				ret.setHours( ret.getHours() + offset );
			},
			d : function ( offset ) {
				ret.setDate( ret.getDate() + offset );
			}
		};
		modifiers[ mod ]( delta );

		return ret;
	}
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

function stringMuteList () {
	var users = Object.keys( muted );

	if ( !users.length ) {
		return 'Nobody is muted';
	}

	var base = 'http://chat.stackoverflow.com/transcript/message/';

	return users.map(function ( user ) {
		var info = muted[ user ],

			remaining = remainingDuration( info.endDate ),
			strung = remaining ? '(' + remaining + ')' : '',

			text = user + strung;

		return bot.adapter.link( text, base + info.invokingId );
	}).join( '; ' );
}

function userInfoFromParam ( param, args ) {
	var ret = {
		id : param
	};

	if ( /\D/.test(param) ) {
		ret.id = args.findUserId( param );
	}

	if ( ret.id < 0 ) {
		ret.error = 'User ' + param + ' not found';
	}

	return ret;
}

function parseDuration ( str ) {
	var parts = /\d+([dhm]?)/.exec( str );
	if ( !parts ) {
		return null;
	}

	if ( !parts[1] ) {
		parts[ 0 ] += 'm';
	}
	return parts[ 0 ];
}

function remainingDuration ( future ) {
	var now = Date.now();

	if ( future < now ) {
		return;
	}
	var delta	= new Date( future - now ),
		days	= delta.getUTCDate(),
		hours	= delta.getUTCHours(),
		minutes = delta.getUTCMinutes(),
		seconds = delta.getUTCSeconds();

	if ( days > 1 ) {
		return ( days - 1 ) + 'd ' + hours + 'h';
	}
	else if ( hours > 0 ) {
		return hours + 'h ' + minutes + 'm';
	}

	return minutes + 'm ' + seconds + 's';
}

bot.addCommand({
	name : 'mute',
	fun : function mute ( args ) {
		var parts = args.parse(),
			userInfo, duration;

		if ( !parts.length ) {
			return stringMuteList();
		}
		else if ( parts.length < 2 ) {
			return 'Please give mute duration, see `/help mute`';
		}

		bot.log( parts, '/mute input' );

		userInfo = userInfoFromParam( parts[0], args );
		if ( userInfo.error ) {
			return userInfo.error;
		}
		else if ( userInfo.id === bot.adapter.user_id ) {
			return 'Never try and mute a bot who can own your ass.';
		}
		else if ( bot.isOwner(userInfo.id) ) {
			return 'You probably didn\'t want to mute a room owner.';
		}

		duration = parseDuration( parts[1] );
		if ( !duration ) {
			return 'I don\'t know how to follow that format, see `/help mute`';
		}

		takeVoice({
			id : userInfo.id,
			invokingId : args.get('message_id'),
			duration : duration
		}, finish );

		function finish () {
			args.reply(
				'Muted user {0} for {1}'.supplant(userInfo.id, duration) );
		}
	},

	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Mutes a user. `/mute usrid duration` ' +
		'Duration should be in the format `n[mhd]` for n minutes/hours/days. ' +
		'If only n is provided, minutes is assumed.'
});

bot.addCommand({
	name : 'unmute',
	fun : function umute ( args ) {
		var parts = args.parse();

		bot.log( parts, '/unmute input' );

		if ( !parts.length ) {
			return 'Who shall I unmute?';
		}

		var userID = userInfoFromParam( parts[0], args );
		if ( userID.error ) {
			return userID.error;
		}

		giveVoice( userID.id, finish );

		function finish () {
			args.reply( 'Unmuted user ' + userID.id );
		}
	},

	permissions : {
		del : 'NONE',
		use : 'OWNER'
	},
	description : 'Unmutes a user. `/unmute usrid`'
});

})();
