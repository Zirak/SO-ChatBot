/*global bot:true, IO:true */
(function () {
//collection of nudges; msgObj, time left and the message itself
var nudges = [],
	interval = bot.adapter.in.interval || 5000;

function update () {
	var now = Date.now();
	nudges = nudges.filter(function ( nudge ) {
		nudge.time -= interval;

		if ( nudge.time <= 0 ) {
			sendNudge( nudge );
			return false;
		}
		return true;
	});

	setTimeout( update, interval );
}
function sendNudge ( nudge ) {
	console.log( nudge, 'nudge fire' );
	//check to see if the nudge was sent after a bigger delay than expected
	//TODO: that ^
	bot.reply( nudge.message, nudge.msgObj );
}
setTimeout( update, interval );

//now for the command itself
function addNudge ( delay, msg, msgObj ) {
	var inMS;
	console.log( delay, msg, '/nudge input' );

	//interval will be one of these:
	// nm  =>  n minutes
	// n   =>  n minutes
	//so erm...yeah. just parse the bitch
	delay = parseFloat( delay );
	//minsInMs = mins * 60 * 1000
	//TODO: allow more than just minutes
	//TODO: upper cap
	inMS = delay * 60000;

	if ( isNaN(inMS) ) {
		return 'Many things can be labeled Not a Number; a delay should not' +
			' be one of them.';
	}

	//let's put an arbitrary comment here

	var nudge = {
		msgObj  : msgObj,
		message : msg || '*nudge*',
		register: Date.now(),
		time    : inMS
	};
	nudges.push( nudge );
	console.log( nudge, nudges, '/nudge register' );

	return 'Nudge registered.';
}

bot.addCommand({
	name : 'nudge',
	fun  : nudgeCommand,
	permissions : {
		del : 'NONE'
	},

	description : 'Register a nudge after an interval. ' +
		'`/nudge intervalInMinutes message`, or the listener, ' +
		'`nudge|remind|poke me? in? intervalInMinutes message'
});

bot.listen(/(?:nudge|remind|poke)\s(?:me\s)?(?:in\s)?(\d+m?)\s?(.*)$/,
	nudgeListener
);

function nudgeCommand ( args ) {
	var props = args.parse();
	return addNudge( props[0], props.slice(1).join(' '), args.get() );
}
function nudgeListener ( args ) {
	return addNudge( args.matches[1], args.matches[2], args.get() );
}

}());
