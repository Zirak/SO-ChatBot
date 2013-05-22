(function () {
var timers = Object.create( null ),
	id = 0;

var actions = {
	start : function ( name ) {
		if ( name === undefined ) {
			//if Crockford ever reads this, I want to reassure you: I did mean
			// postfix increment. I want to grab the original value of id while
			// increasing its value.
			//now you may continue reading the code at ease
			name = id++;
		}
		timers[ name ] = Date.now();
		return 'Registered timer ' + name;
	},

	stop : function ( name ) {
		if ( name === undefined ) {
			return 'You must provide a timer name';
		}
		var timer = timers[ name ];

		if ( !timer ) {
			return 'I have no knowledge of timer ' + name;
		}

		var delta = Date.now() - timer;
		delete timers[ name ];

		return delta + 'ms';
	}
};

function timer ( msg ) {
	var args = msg.parse(),
		act = args.shift(),
		name = args.shift();

	if ( !actions[act] ) {
		return 'Action {0} not recognized, see `/help timer`'.supplant( act );
	}
	return actions[ act ]( name );
}

bot.addCommand({
	name : 'timer',
	fun  : timer,
	permissions : {
		del : 'NONE'
	},
	description : 'Starts/stops a timer. ' +
		'`/timer start [name]` starts a timer, ' +
		'`/timer stop name` stops a timer.'
});

})();
