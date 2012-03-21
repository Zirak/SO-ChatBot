(function () {
var defaults = {
	e : 'oo',
	T : '  ',
	t : false,
	W : 40
};

var cowsay = {

	//in the "template", e is for eye, T for Tongue, L for bubble-Line
	//it looks more like a donkey who was involved in a sledgehammer accident
	// because of escaping and newlines
	//the cow business is a dangerous one
	cow : [
		'',
		'        L   ^__^',
		'         L  (e)\\_______',
		'            (__)\\       )\\/\\',
		'             T ||----w |',
		'                ||     ||'
	].join( '\n' ),

	moo : function ( message, opts ) {
		this.eyes     = opts.e.slice( 0, 2 );
		this.tongue   = opts.T.slice( 0, 2 );
		this.line     = opts.t ? 'O' : '\\';
		this.thinking = opts.t;

		this.message  = wordWrap( message, opts.W );

		//cowsay is actually the result of breeding a balloon and a cow
		return this.makeBalloon() + this.makeCow();
	},

	makeCow : function () {
		return this.cow
			.replace( 'e', this.eyes )
			.replace( 'T', this.tongue )
			.replace( new RegExp('L', 'g'), this.line );
	},

	makeBalloon : function () {
		var message = this.message.trim().split( '\n' );

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

			lineCount = message.length,
		//the border of the speech bubble
			border = this.chooseBorders( lineCount );

		var balloon = message.map(function ( line, idx ) {
			var padders;
			//top left and top right
			if ( idx === 0 ) {
				padders = border.slice( 0, 2 );
			}
			//bottom left and bottom right
			else if ( idx === lineCount-1 ) {
				padders = border.slice( 2, 4 );
			}
			//the wall
			else {
				padders = border.slice( -2 );
			}

			return padders[ 0 ] + ' ' +
				rightPad( line, longest ) + ' ' +
				padders[ 1 ];
		});

		balloon.unshift( ' ' + topLine );
		balloon.push( ' ' + btmLine );

		return balloon.join( '\n' );
	},

	chooseBorders : function ( lineCount ) {
		if ( this.thinking ) {
			return [ '(', ')', '(', ')', '(', ')' ];
		}

		var border;
		if ( lineCount === 1 ) {
			border = [ '<', '>' ];
		}
		//good enough
		else {
			border = [ '/', '\\', '\\', '/', '|', '|' ];
		}

		return border;
	}
};


function wordWrap ( str, len ) {
	var lineLen = 0,
		ret = [];

	return str.split( ' ' ).reduce(function ( ret, word ) {
		var wordLen = word.length;

		//let the wrapping...commence!
		if ( lineLen + wordLen > len ) {
			ret += '\n';
			lineLen = 0;
		}
		lineLen += wordLen + 1; //+1 for the space we now add

		return ret + word + ' ';
	}, '' );
}

function rightPad ( str, len, padder ) {
	padder = padder || ' ';
	while ( str.length < len ) {
		str += padder;
	}
	return str;
}

bot.listen(
	/cow(think|say)\s(?:([eT])=(.{0,2})\s)?(?:([eT])=(.{0,2})\s)?(.+)/,

	function ( msg ) {
		//the first item is the whole match, second item is the "think" or
		// "say", last item is the message, we only want the "parameters"
		var args = msg.matches.slice( 2, -1 ),
			opts = {};

		for ( var i = 0, len = args.length; i < len; i += 2 ) {
			//if that capturing group got something,
			if ( args[i] && args[i+1] ) {
				//set that parameter
				opts[ args[i] ] = args[ i + 1 ];
			}
		}
		console.log( opts );
		//cowsay or cowthink?
		opts.t = msg.matches[ 1 ] === 'think';
		opts = Object.merge( defaults, opts );
		console.log( opts );

		var cowreact = cowsay.moo( msg.matches.slice(-1)[0], opts );
		msg.respond( msg.codify(cowreact) );
	}
);

}());
