(function () {
//I wish you could use `default` as a variable name
var def = {
	895174 : [
		'sbaaaang', 'badbetonbreakbutbedbackbone',
		'okok', 'donotusetabtodigitthisnick' ]
};

var tracking = bot.memory.get( 'tracker', def );
var message = '*→ {0} (also known as {1}) changed his name to {2}*',
	messageNoAlias = '*→ {0} changed his name to {2}*';

IO.register( 'userregister', function tracker ( user, room ) {
	var names = tracking[ user.id ];

	if ( !names ) {
		return;
	}
	if ( names[0].toLowerCase() === user.name.toLowerCase() ) {
		return;
	}

	bot.log( user, names, 'tracking found suspect' );

	var userLink = bot.adapter.link(
		names[0],
		IO.relativeUrlToAbsolute( '/users/' + user.id ) );

	var outFormat = names.length > 1 ? message : messageNoAlias,
		out = outFormat.supplant(
			userLink, names.slice(1), user.name );

	bot.adapter.out.add( out, room );
	names.unshift( user.name );
});

})();
