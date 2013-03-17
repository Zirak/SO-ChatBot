//meet Winded Weasel. he helps you make decisions and he answers questions.
//x or y [or z ...]
// => one of x, y, z, ...
//is x y
//can x y
// => yes or no

var chooseRe = /(^choose|or)[^$]/i,
	questionRe = /^(is|are|can|will|would)[^$]/;

bot.listen(chooseRe, function ( msg ) {
	var parts = msg.replace( /^choose\s/i, '' ).split( /\s*or\s*/i ),
		len = parts.length;

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

	//choose!
	return parts.random();
});

bot.listen(questionRe, function ( msg ) {
	var verb = msg.matches[ 0 ]; //is, will, can, ...

	var isFuture = {
		will : true, would : true
	}[ verb ];

	if ( Math.random() < 0.005 ) {
		return ['The person on your left has the answer']
	}

	var replies = [ 'Yes!', 'No' ];

	if ( isFuture ) {
		replies.concat([
			'I wouldn\'t count on it', 'Definitely!'
		]);
	}

	return replies.random();
});
