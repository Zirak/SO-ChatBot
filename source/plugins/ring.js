(function () {
//var rings = {
//   roomid : [ members ]
//}
var rings;
if ( !localStorage.bot_rings ) {
	localStorage.bot_rings = '{}';
}
rings = JSON.parse( localStorage.bot_rings );

// /ring activate ringName message
// /ring register ringName
var ring = function ( args ) {
	var parts = args.parse(),
		command = parts[ 0 ],
		ringName = parts[ 1 ],
		message = parts[ 2 ],

		usrname = args.get( 'user_name' ),
		roomid = args.get( 'room_id' ),

		res;
	bot.log( parts, '/ring input' );

	if ( command === 'activate' ) {
		res = activate( message, ringName, usrname, roomid );
	}
	else if ( command === 'register' ) {
		res = register( ringName, usrname, roomid );
	}
	else {
		res = 'Cannot understand command: ' + command + '. See /help ring';
	}

	return res;
};

bot.addCommand({
	name : 'ring',
	fun  : ring,
	permissions : {
		del : 'NONE'
	},

	description : 'Rings are room specific. ' +
		'`/ring activate ringName message` - activate a ring. ' +
		'`/ring register ringName` - register to a ring.'
});

function activate ( message, ringName, usrname, roomid ) {
	bot.log( message, ringName, usrname, roomid, '/ring activate' );
	if ( !rings[roomid] ) {
		return 'There are no rings in your chat-room';
	}

	var roomRing = rings[ roomid ];
	if ( !roomRing[ringName] ) {
		return 'There exists no ' + ringName + ' ring in your chat-room';
	}

	message = 'Ring ' + ringName +
		' activated by ' + usrname + '! ' +
		message;

	return roomRing[ ringName ].map(function ( name ) {
		return '@' + name;
	}).join( ', ' ) + ': ' + message;
}

function register ( ringName, usrname, roomid ) {
	bot.log( ringName, usrname, roomid, '/ring register' );
	if ( !rings[roomid] ) {
		rings[ roomid ] = {};
	}
	var roomRing = rings[ roomid ];

	if ( !roomRing[ringName] ) {
		roomRing[ ringName ] = [];
	}
	var ring = roomRing[ ringName ];

	if ( ring.indexOf(usrname) > -1 ) {
		return 'You are already registered to ring ' + ringname;
	}
	ring.push( usrname );
	
	update();

	return 'Registered to ring ' + ringName + ' in room #' + roomid;
}

function update () {
	localStorage.bot_rings = JSON.stringify( rings );
}

}());

