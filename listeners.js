bot.listen( /tell me your laws/i, function ( msg ) {
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
