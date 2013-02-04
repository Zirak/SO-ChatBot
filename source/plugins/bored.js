//when nothing happens after a while, I get bored.
(function () {
var delay = 300000; //1000(ms) * 60 (sec) * 5 = 5min

function zzz () {
	var now = Date.now(),
		times = bot.adapter.in.lastTimes;
	Object.keys( times ).filter( timeCheck ).forEach( stuff );

	//let my naming expertise astound you once more
	function stuff ( roomid ) {
		//...I...don't know, really.
		bot.log( 'triggered bored' );
	}

	function timeCheck ( roomid ) {
		return times[ roomid ] + delay <= now;
	}
}
IO.register( 'heartbeat', zzz );
})();
