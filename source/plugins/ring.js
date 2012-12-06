(function () {
"use strict";
//var rings = {
//   roomid : [ members ]
//}
var rings = JSON.parse( localStorage.bot_rings || '{}' );

var ring = function ( args ) {
	var parts = args.parse(),
		action = parts.shift(),
		res;
	bot.log( parts, '/ring input' );

	if ( actions[action] ) {
		res = actions[action](
			parts, args.get('user_name'), args.get('room_id') );
	}
	else {
		res = 'Unrecognized action ' + action + '. See `/help ring`';
	}

	return res;
};

var actions = {
	//activate ringName message
	activate : function ( args, usrname, roomid ) {
		if ( !rings[roomid] ) {
			return 'There are no rings in your chat-room';
		}

		var roomRing = rings[ roomid ],
			ringName = args.shift();
		if ( !roomRing[ringName] ) {
			return 'There exists no ' + ringName + ' ring in your chat-room';
		}

		var registered = roomRing[ ringName ].map( bot.adapter.reply );
		return registered + '(ring ' + ringName + ') ' + args.shift();
	},

	//register ringName
	register : function ( args, usrname, roomid ) {
		if ( !rings[roomid] ) {
			rings[ roomid ] = {};
		}

		var roomRing = rings[ roomid ],
			ringName = args.shift();
		if ( !roomRing[ringName] ) {
			roomRing[ ringName ] = [];
		}

		var ring = roomRing[ ringName ];
		if ( ring.indexOf(usrname) > -1 ) {
			return 'You are already registered to ring ' + ringName;
		}

		ring.push( usrname );
		save();
		return 'Registered to ring ' + ringName + ' in room #' + roomid;
	}
};

bot.addCommand({
	name : 'ring',
	fun  : ring,
	permissions : {
		del : 'NONE'
	},

	description : 'Upon activating a ring, all those who registered to it ' +
		' will be pinged. ' +
		'`/ring activate ringName message` - activate a ring. ' +
		'`/ring register ringName` - register to a ring.'
});

function save () {
	localStorage.bot_rings = JSON.stringify( rings );
}

}());
