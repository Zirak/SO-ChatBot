(function () {

//in the "template", E is for eye, T for Tongue
//it looks more like a donkey who was involved in a sledgehammer accident
// because of escaping and newlines
var cow = ["",
"        \\   ^__^"              ,
"         \\  (E)\\_______"      ,
"            (__)\\       )\\/\\",
"             T ||----w |"       ,
"                ||     ||"
].join("\n");


function prettyBalloon ( message ) {
	message = message.trim().split( '\n' );
	var longest = Math.max.apply(
		Math,
		message.map(function ( line ) {
			return line.length;
		})
	),
	//for the top and bottom lines of the thought bubble
		boundaryOccurences = new Array( longest + 2 ),
		topLine = boundaryOccurences.join( '_' ),
		btmLine = boundaryOccurences.join( '-' ),

	//the border of the speech bubble
		border,
		walls = '',
		lineCount = message.length;

	switch ( lineCount ) {
	case 1:
		border = [ '<', '>' ];
		break;
	//intentional weirdness
	default:
		walls = '|';
	//intentional convuluted fallthrough
	case 2:
		border = [ '/', '\\', '\\', '/' ];
	}

	var balloon = message.map(function ( line, idx ) {
		var padders;
		//top left and top right
		if ( idx === 0 ) {
			padders = border.slice( 0, 2 );
		}
		//bottom left and bottom right
		else if ( idx === lineCount-1 ) {
			padders = border.slice( -2 );
		}
		//the wall
		else {
			padders = [ walls, walls ];
		}

		return padders[ 0 ] + ' ' +
			rightPad( line, longest ) + ' ' +
			padders[ 1 ];
	});

	balloon.unshift( ' ' + topLine );
	balloon.push( ' ' + btmLine );

	return balloon.join( '\n' );
}

function wordWrap ( str, len ) {
	var line = '',
		ret = [];

	str.split( ' ' ).forEach(function ( word ) {
		var wordLen = word.length;

		//let the wrapping...commence!
		if ( wordLen + line.length > len ) {
			ret.push( line );
			line = '';
		}

		line += word + ' ';
	});

	ret.push( line );

	return ret.join( '\n' );
}

function rightPad ( str, len, padder ) {
	padder = padder || ' ';
	while ( str.length < len ) {
		str += padder;
	}
	return str;
}

function cowsay ( message, len, eyes, tongue ) {
	len = len || 40;
	eyes = ( eyes || 'oo' ).slice( 0, 2 );
	tongue = ( tongue || '  ' ).slice( 0, 2 );

	return prettyBalloon( wordWrap(message, len) ) +
		cow.replace( 'E', eyes ).replace( 'T', tongue );
}

bot.addCommand({
	name : 'cowsay',
	fun : function ( args ) {
		if ( !args.content ) {
			return 'Telepathic module not loaded, please specify your demands' +
				' in textual format.';
		}
		args.respond(
			args.codify( cowsay(args.content) )
		);
	},
	permissions : {
		del : 'NONE'
	},
	description : 'Make moo'
});

}());
