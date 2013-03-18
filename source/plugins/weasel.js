(function () {
//meet Winded Weasel. he helps you make decisions and he answers questions.
//x or y [or z ...]
// => one of x, y, z, ...
//is x y
//can x y
// => yes or no

var chooseRe = /^\s*(choose|should)?.*\sor\s[^$]/i,
    questionRe = /^(is|are|can|am|will|would|do|does)[^$]/i;

var undecided = [
	'I\'m not sure',
	'ERROR CALCULATING RESULT',
	'I know just one thing, and that is that I\'m a lumberjack' ];

bot.listen(chooseRe, function ( msg ) {
	var parts = msg
		//remove the choose prefix. "should" will always be accompanied by a
		// subject (should I, should he, ...), so remove that as well
		.replace( /^\s*(choose|should \S+)\s/i, '' )
		//also remove the trailing question mark
		.replace( /\?$/, '' )
		.split( /\s+or\s+/i );

	var len = parts.length;

	//check to see whether there's only 1 thing asked to choose about, e.g.
	// choose a or a or a
	// choose a
	for ( var i = 1, same = true; i < len; i++ ) {
		if ( parts[i] !== parts[i-1] ) {
			same = false;
			break;
		}
	}

	if ( same ) {
		return [
			'That\'s not really a choice, now is it?',
			'Sounds like you have already decided',
			'Cheater cheater your house is a heater' ].random();
	}

	//all of them (1%)
	if ( Math.random() < 0.01 ) {
		return len === 2 ? 'Both!' : 'All of them!';
	}
	//none of them (1%)
	if ( Math.random() < 0.01 ) {
		return len === 2 ? 'Neither' : 'None of them!';
	}
	//I don't know (1%)
	if ( Math.random() < 0.01 ) {
		return undecided.random();
	}

	//choose!
	return parts.random();
});

bot.listen(questionRe, function ( msg ) {
	var verb = msg.matches[ 0 ]; //is, will, can, ...

	var isFuture = {
		will : true, would : true
	}[ verb ];

	if ( Math.random() < 0.005 ) {
		//TODO: add more stuff. magic 8ball things.
		return [ 'The person on your left has the answer' ]
	}

	var replies = [];

	//positive
	Object.defineProperty(replies, 0, {
		get : function () {
			var rand = Math.random() * 100;

			if ( rand < 80 ) {
				return ( rand < 15 ? 'All signs point to ' : '') +
					'Yes' +
					( rand < 20 ? '!' : '' );
			}
			if ( rand < 99 ) {
				return isFuture ? 'My pet goes agrees' : 'Indubitably'
			}

			return undecided.random();
		}
	});

	//negative
	Object.defineProperty(replies, 1, {
		get : function () {
			var rand = Math.random() * 100;

			if ( rand < 80 ) {
				return ( rand < 15 ? 'All signs point to ' : '' ) +
					'No' +
					( rand < 10 ? '!' : '' );
			}
			if ( rand < 99 ) {
				return isFuture ? 'My pet goat disagrees' : 'Not at all';
			}

			return undecided.random();
		}
	});

	if ( isFuture ) {
		replies.concat([
			'I wouldn\'t count on it', 'Definitely!'
		]);
	}

	return replies.random();
});
}());
