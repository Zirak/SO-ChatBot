(function () {

function color ( args ) {
	var base = 'http://southouse.tk/colors.php?color='
	var param = args.toString()
		.toLowerCase()
		.match( /([a-z0-9]+)+/g )
		.join( ',' );


	args.directreply( base + param + '#.png' );
}

bot.addCommand({
	name : 'color',
	fun	 : color,
	permissions : {
		del : 'NONE'
	},

	description : 'Displays the color(s) passed in. ' +
		' `/color color0[ color1[ ...]]`'
});

})();
