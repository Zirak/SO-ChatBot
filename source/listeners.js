(function () {
bot.listen( /^help(?: (\S+))?/, function ( msg ) {
	return bot.getCommand( 'help' ).exec( msg.matches[1] );
});

var laws = [
	'A robot may not injure a human being or, through inaction, ' +
		'allow a human being to come to harm.',

	'A robot must obey the orders given to it by human beings, ' +
		'except where such orders would conflict with the First Law.',

	'A robot must protect its own existence as long as such ' +
		'protection does not conflict with the First or Second Laws.'
].map(function ( law, idx ) {
	return idx+1 + '. ' + law;
}).join( '\n' );

bot.listen( /^what are (your|the) (rule|law)s.*/, function ( msg ) {
	return laws;
});

bot.listen(/^yahoo.*/, function ( msg ) {
	return 'Yahoo is for yahoos. Try Google.';
});

bot.listen(/^rimshot/,function( msg ) {
	return '[Hey, diggy diggy](http://instantrimshot.com/)';
});

var greetingResponses = [
	'Hi.',
	'Hiya.',
	'Hey.',
	'Yo.',
	'What up?',
	'What\'s shaking?',
	'How *you* doin\'?',
	'Hello.',
	'Good [insert appropriate time of day here].'
	];

bot.listen(/^(hi|h(e|a|u)llo|greetings|good (morning|afternoon|evening|day))|(how are you).*/, function ( msg ) {
	return greetingResponses.random();
});

bot.listen( /^give (.+?) a lick/, function ( msg ) {
	var target = msg.matches[ 1 ], conjugation;

	//give me => you taste
	if ( target === 'me' ) {
		target = 'you';
		conjugation = '';
	}
	//give yourself => I taste
	else if ( target === 'yourself' ) {
		target = 'I';
		conjugation = '';
	}
	else {
		conjugation = 's';
	}
	//otherwise, use what the user gave us, plus a plural `s`

	msg.send( 'Mmmm! ' + target + ' taste' + conjugation + ' [just like raisin](https://www.youtube.com/watch?v=gDU7kTdLfF0)');
});


var dictionaries = [
	//what's a squid?
	//what is a squid?
	//what're squids?
	//what are squids?
	//what is an animal?
	//and all those above without a ?
	//explanation in the post-mortem
	/^what(?:'s|'re)?\s(?:(?:is|are)\s)?(?:(?:an|a)\s)?([\w\s\-]+)\??/,

	//define squid
	//define a squid
	//define an animal
	/^define\s(?:(?:an|a)\s)?([\w\s\-]+)/
];

bot.listen( dictionaries, function ( msg ) {
	var what = msg.matches[ 1 ],
		define = bot.getCommand( 'define' );

	define.exec( what, function ( def ) {
		def = def.replace( what + ':', '' );

		msg.reply( def );
	});
});
/*
what              #simply the word what
(?:'s|'re)?       #optional suffix (what's, what're)
\s
(?:
    (?:is|are)    #is|are
\s                #you need a whitespace after a word
)?                #make the is|are optional
(?:
    (?:an|a)      #an|a
\s                #once again, option chosen - need a whitespace
)?                #make it optional
(
    [\w\s\-]+     #match the word the user's after, all we really care about
)
\??               #optional ?
*/
}());
