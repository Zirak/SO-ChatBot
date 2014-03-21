(function () {

function color ( args ) {
	var base = 'http://somethinghitme.com/color/colors.php?color='
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

	description : 'Displays the color(s) passed in as RGB, hexadecimal or hex-shorthand or standard color names (if it works in CSS it should work here). ' +
		' `/color color0[ color1[ ...]]`'
});

})();
