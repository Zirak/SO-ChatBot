(function () {
//they made me make it. I begged them not to.

//obligatories
var special = {
	'your mom' : ['Your mom is always open for business.'],
	'your sister' : ['Your sister is too busy right now.'],
	//hey, the last two lines aligned! together with the bodies...
	//erm, what?

	//the help message explicitly says age, though...
	'age' : ['For you? Never.']
};
var template = 'A person that age can shag down to {lower}, '+
	'and is the lower limit of a person of {higher} years.';

function fuckable ( args ) {
	var possibleName = args.toString().toLowerCase();

	if ( special[possibleName] ) {
		return special[ possibleName ].random();
	}

	//try and find a user with the same name as the argument
	var userId = Object.keys( bot.users ).first(function ( id ) {
		return bot.users[ id ].name.toLowerCase() === possibleName;
	});

	//we found a match. you're a daddy!
	if ( userId && Math.random() < 0.8 ) {
		//the perverts
		if ( Number(userId) === bot.adapter.user_id ) {
			return 'Keep dreaming';
		}

		return 'Why don\'t we ask ' + bot.adapter.reply( args ) + '?';
	}

	var age = Number( args );

	if ( !age || age < 0 ) {
		return 'This is srs bsns, please treat it as such' +
			' (see `/help fuckable`).';
	}

	var ret = '';
	if ( age < 14 ) {
		ret += 'You\'re one sick puppy. ';
	}

	var fuckee = age / 2 + 7,
	fucker = 2 * age - 14,
	wrapper = {};

	//the equation is:
	// fuckee = fucker / 2 + 7
	//now, we want fuckee <= fucker. this condition is not met when fucker < 14:
	// fuckee = 13 / 2 + 7 = 13.5 > 13
	//so, if age < 14, we flip the two to meet the condition.
	wrapper.higher = ( age > 14 ? fucker : fuckee );
	wrapper.lower  = ( age > 14 ? fuckee : fucker );

	return ret + template.supplant( wrapper );
}

bot.addCommand({
	name : 'fuckable',
	fun : fuckable,
	permissions : {
		del : 'NONE'
	},

	description : 'Calculates the lower boundary according to age/2+7 rule.' +
		' `/fuckable age`'
});

})();
