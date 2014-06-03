(function () {

function color ( args ) {
		var outType, base, param;
		
		if ( args.match( /-g/ ) ) { //the only flag for this is g(gradient)
			outType = 'gradient=';
		} else outType = 'color=';
		
		base = 'http://jhawins.tk/colors.php?';
		
		param = args.toLowerCase()
			.replace( /-[a-z]*/, '' )//strip all flags
			.match( /([a-z0-9]+)+/g );
	
		args.directreply( base + outType + param + '#.png' );
	}
	
bot.addCommand({
	name : 'color',
	fun	 : color,
	permissions : {
		del : 'NONE'
	},

	description : 'Displays the' +
			'color(s) passed in as RGB, hexadecimal' +
			'or hex-shorthand or standard color names' +
			'(if it works in CSS it should work here). ' +
			' `/color color0[ color1[ ...]]`' +
			'use -g for gradient'
});

})();
