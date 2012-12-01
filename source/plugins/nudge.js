(function () {

//collection of nudges; msgObj, time left and the message itself
var nudges = [],
	interval = 100 * 60;

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
	nudge.msg.reply( nudge.message );
}
setTimeout( update, interval );

//now for the command itself
function addNudge ( delay, message, msgObj ) {
	var inMS;
	console.log( delay, message, '/nudge input' );

	//interval will be one of these (where n is a number):
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
		msg     : msgObj,
		message : '*nudge* ' + message,
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
		'`nudge|remind|poke me? in? intervalInMinutes message`'
});

bot.listen(/(?:nudge|remind|poke)\s(?:me\s)?(?:in\s)?(\d+m?)\s?(.*)$/,
	nudgeListener
);

function nudgeCommand ( args ) {
	var props = args.parse();
	return addNudge( props[0], props.slice(1).join(' '), args );
}
function nudgeListener ( args ) {
	return addNudge( args.matches[1], args.matches[2], args );
}

}());
