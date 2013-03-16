//when nothing happens after a while, I get bored.
(function () {
"use strict";

var responses; //will be filled in the following line
//#build ../static/boredResponses.js

var lastISpoke = {},
	messagesSinceLast = {},

	config  = {
		delay : 300000, //1000(ms) * 60 (sec) * 5 = 5min
		shortestConvo : 10,
		memorySize    : responses.length / 2,
	};

var memory = IO.CBuffer( config.memorySize );

function zzz () {
	var now = Date.now(),
		times = bot.adapter.in.lastTimes || {};

	Object.keys( times ).filter( roomcheck ).forEach( stuff );

	//let my naming expertise astound you once more
	function stuff ( roomid ) {
		bot.log( 'triggered bored on room #' + roomid );

		//10 seconds into the future, just to be sure
		lastISpoke[ roomid ] = now + 1000 * 10;
		messagesSinceLast[ roomid ] = 0;

		var resp;
		do {
			resp = responses.random();
		} while ( memory.contains(resp) );

		memory.add( resp );
		bot.adapter.out.add( resp, roomid );
	}

	//checks, for a specific room, whether enough time has passed since someone
	// (who wasn't us) spoke
	function roomcheck ( roomid ) {
		//max + 1. when the bot sends a message, it also counts as 1
		if ( messagesSinceLast[roomid] < config.shortestConvo+1 ) {
			return false;
		}

		var last = times[ roomid ];
		return (
			last > ( lastISpoke[roomid] || 0 ) &&
			last + config.delay <= now );
	}
}

function someoneSpoke ( msgObj ) {
	var base = messagesSinceLast[ msgObj.room_id ] || 0;
	messagesSinceLast[ msgObj.room_id ] = base + 1;
}

IO.register( 'heartbeat', zzz );
IO.register( 'input', someoneSpoke );

})();
