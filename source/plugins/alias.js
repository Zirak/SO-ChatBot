(function () {
if ( !localStorage.bot_alias ) {
	localStorage.bot_alias = JSON.stringify( {} );
}

var dict = JSON.parse( localStorage.bot_alias );

bot.listen( /\~([\w\-_]+)(?:\s?(=)(=)?\s?(.+))?/, function ( msg ) {
	var name = msg.matches[ 1 ];

	//check to see if it's an assignment
	// msg.matches[2] is the optional =
	if ( msg.matches[2] ) {
		return save( msg );
	}
	else {
		return dict[ name ] || 'Nothing found for ' + name;
	}
});

function save ( msg ) {
	var name = msg.matches[ 1 ],
		force  = msg.matches[ 3 ],
		exists = !!dict[ name ],
		authorized = false;

	//only owners can force new values
	if ( exists && force ) {
		authorized = bot.isOwner( msg.get('user_id') );
	}
	else if ( !exists ) {
		authorized = true;
	}

	if ( !authorized ) {
		return 'You are not allowed to do this, young padawan';
	}

	var value = msg.matches[ 4 ];
	if ( !value ) {
		return 'Provide a value for the alias';
	}

	dict[ name ] = value;
	localStorage.bot_alias = JSON.stringify( dict );
	return 'Saved alias ' + name;
}

}());
