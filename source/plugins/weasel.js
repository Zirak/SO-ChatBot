(function () {
//meet Winded Weasel. he helps you make decisions and he answers questions.
//x or y [or z ...]
// => one of x, y, z, ...
//is x y
//can x y
// => yes or no

var chooseRe = /^\s*(choose|should)?.*\sor\s[^$]/i,
    questionRe = /^(is|are|can|am|will|would|do|does|should)[^$]/i;

//personal pronouns to capitalize and their mapping
//TODO: add possessives (should my cat => your cat should)
var capitalize = {
	he  : 'He',
	i   : 'You',
	it  : 'It',
	she : 'She',
	they: 'They',
	we  : 'You',
	you : 'I',
};

//will be filled in the build
var answers, undecided, sameness;
//#build ../static/weaselReplies.js

bot.listen(chooseRe, function ( msg ) {
	var parts = msg
		//remove the choose prefix
		.replace( /^\s*choose\s/i, '' )
		//also remove the trailing question mark
		.replace( /\?$/, '' )
		.split( /\s*\bor\b\s*/i )
		//remove whatever empty items there may be
		.filter( Boolean );

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
	var choice = parts.random();
	//convert:
	// "should I" => "you should"
	// "should you" => "I should"
	//anything else just switch the order
	return choice.replace( /^should (\S+)/, subject );

	function subject ( $0, $1 ) {
		var sub = $1.toLowerCase(),
			conv;

		//if we recognize this word, map it properly
		if ( capitalize.hasOwnProperty(sub) ) {
			conv = capitalize[ sub ];
		}
		//otherwise, use the original spelling
		else {
			conv = $1;
		}

		return conv + ' should';
	}
});

bot.listen(questionRe, function ( msg ) {
	//TODO: same question => same mapping (negative/positive, not specific)
	return answers.random();
});
}());
