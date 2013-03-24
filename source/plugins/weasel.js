(function () {
//meet Winded Weasel. he helps you make decisions and he answers questions.
//x or y [or z ...]
// => one of x, y, z, ...
//is x y
//can x y
// => yes or no

var chooseRe = /^\s*(choose|should)?.*\sor\s[^$]/i,
    questionRe = /^(is|are|can|am|will|would|do|does)[^$]/i;

//will be filled in the build
var answers, undecided, sameness;
//#build ../static/weaselReplies.js

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
		return sameness.random();
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
	return answers.random();
});
}());
