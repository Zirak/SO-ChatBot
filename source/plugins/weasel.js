module.exports = function (bot) {
//meet Winded Weasel. he helps you make decisions and he answers questions.
//x or y [or z ...]
// => one of x, y, z, ...
//is x y
//can x y
// => yes or no

var chooseRe = /^\s*(choose|should)?.*\sor\s[^$]/i,
    questionRe = new RegExp('\\b(' +[
        "am", "are", "can", "could", "did", "do", "does", "is", "may", "might",
        "shall", "should", "will", "would"
    ].map(RegExp.escape).join('|') + ')\\b', 'i');

//personal pronouns to capitalize and their mapping
//TODO: add possessives (should my cat => your cat should)
var capitalize = {
    he  : 'He',
    i   : 'You',
    it  : 'It',
    she : 'She',
    they: 'They',
    we  : 'You',
    you : 'I'
};

var replies = require('static/weaselReplies.js');

bot.listen(chooseRe, function chooseListener ( msg ) {
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
        return replies.sameness.random();
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
        return replies.undecided.random();
    }

    //choose!
    var choice = parts.random();

    //bots can be fickley too
    if ( Math.random() < 0.01 ) {
        bot.log( 'weasel decision mind change jedi nun-chuck' );
        setTimeout( changeMind, 10000 );
    }

    return format( choice );

    function changeMind () {
        var second;
        //this won't be an infinite loop as we guruantee there will be at least
        // 2 distinct results
        //possible blocking point for large N. but there won't be a
        // sufficiently large N, so this is probably not a problem
        do {
            second = parts.random();
        } while ( second === choice );

        msg.reply( 'Wait, I changed my mind! ' + format(second) );
    }

    function format ( ans ) {
        return ans.replace( /(should(?:n'?t)?) (\S+)/, subject );
    }

    //convert:
    // "should I" => "you should"
    // "should you" => "I should"
    //anything else just switch the order
    function subject ( $0, $1, $2 ) {
        var sub = $2.toLowerCase(),
            conv;

        //if we recognize this word, map it properly
        if ( capitalize.hasOwnProperty(sub) ) {
            conv = capitalize[ sub ];
        }
        //otherwise, use the original spelling
        else {
            conv = $2;
        }

        return conv + ' ' + $1;
    }
});

bot.listen(questionRe, function questionListener () {
    //TODO: same question => same mapping (negative/positive, not specific)
    return replies.answers.random();
});

};
