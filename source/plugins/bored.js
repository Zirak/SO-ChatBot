//when nothing happens after a while, I get bored.
(function () {
var run = false,
	lastIdx = null,
	delay = 300000; //1000(ms) * 60 (sec) * 5 = 5min

function zzz () {
	if ( !run ) {
		return;
	}
	run = false;
	var now = Date.now(),
		obj = bot.adapter.in.lastTimes;
	Object.keys( obj ).filter( timeCheck ).forEach( stuff );

	//let my naming expertise astound you once more
	function stuff ( roomid ) {
		//...I...don't know, really.
		console.log( 'triggered bored' );
	}

	function timeCheck ( roomid ) {
		return obj[ roomid ] + delay <= now;
	}
}
IO.register( 'heartbeat', zzz );
})();
