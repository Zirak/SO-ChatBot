bot.listen( /tell (me (?:your|the) )?(rules|laws)/, function ( msg ) {
	var laws = [
		'A robot may not injure a human being or, through inaction, ' +
			'allow a human being to come to harm.',

		'A robot must obey the orders given to it by human beings, ' +
			'except where such orders would conflict with the First Law.',

		'A robot must protect its own existence as long as such ' +
			'protection does not conflict with the First or Second Laws.'
	];
	var out = laws.reduce(function ( ret, law, idx ) {
		law = idx + 1 + ')' + law + '\n';

		return ret + law;
	}, '' );

	return out;
});

bot.listen( /give ([\w\s]+) a lick/, function ( msg ) {
	var target = msg.matches[ 1 ], conjugation = 's';
	if ( target === 'me' ) {
		target = 'you';
		conjugation = '';
	}
	else if ( target === 'yourself' ) {
		target = 'I';
		conjugation = '';
	}

	return 'Mmmm! ' + target + ' taste' + conjugation + ' just like raisin';
});

if ( bot.commandExists('define') ) {
	var dictionaries = [
		//what's a squid?
		//what is a squid?
		//what're squids?
		//what are squids?
		//what squid is
		//what squids are
		//what is an animal
		//imagine all those above without a ?
		//explanation in the post-mortem
		/what(?:\'s)?\s(?:(?:is|are)\s)?(?:(?:an|a)\s)?([\w\s\-]+)\??/,

		//define squid
		//define a squid
		//define an animal
		/define\s(?:(?:an|a)\s)?([\w\s\-]+)/
	];

	bot.listen( dictionaries, function ( msg ) {
		var what = msg.matches[ 1 ];

		bot.commands.define.exec( what, function ( def ) {
			def = def.replace( what + ':', '' );

			msg.reply( def );
		});
	});
}
/*
what              --simply the word what
(?:\'s)?          --optional 's suffix (what's)
\s
(?:
    (?:is|are)    --is|are
\s                --you need a whitespace after a word
)?                --make the is|are optional
(?:
    (?:an|a)      --an|a
\s                --once again, option chosen - need a whitespace
)?                --make it optional
(
    [\w\s\-]+     --match the word the user's after, all we really care about
)
\??               --optional ?
*/
