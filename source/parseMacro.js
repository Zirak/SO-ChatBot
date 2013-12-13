//(function () {
"use strict";

var macros = {
	who : function ( msgObj ) {
		return msgObj.get( 'user_name' );
	},

	someone : function () {
		var presentUsers = document.getElementById( 'sidebar' )
			.getElementsByClassName( 'present-user' );

		//the chat keeps a low opacity for users who remained silent for long,
		// and high opacity for those who recently talked
		var active = [].filter.call( presentUsers, function ( user ) {
			return Number( user.style.opacity ) >= 0.5;
		}),
		user = active[ Math.floor(Math.random() * (active.length-1)) ];

		if ( !user ) {
			return 'Nobody';
		}

		return user.getElementsByTagName( 'img' )[ 0 ].title;
	},

	digit : function () {
		return Math.floor( Math.random() * 10 );
	},

	encode : function ( msgObj, string ) {
		return encodeURIComponent( string );
	},

	//random number, min <= n <= max
	//treats non-numeric inputs like they don't exist
	rand : function ( msgObj, min, max ) {
		min = Number( min );
		max = Number( max );
		return Math.rand( min, max );
	}
};
var macroRegex = /(?:.|^)\$(\w+)(?:\((.*?)\))?/g;

bot.parseMacro = function parse ( source, extraVars ) {
	return source.replace( macroRegex, replaceMacro );

	function replaceMacro ( $0, filler, fillerArgs ) {
		//$$ makes a literal $
		if ( $0.startsWith('$$') ) {
			return $0.slice( 1 );
		}

		//include the character that was matched in the $$ check, unless
		// it's a $
		var ret = '';
		if ( $0[0] !== '$' ) {
			ret = $0[ 0 ];
		}

		var macro = findMacro( filler );

		//not found? bummer.
		if ( !macro ) {
			return filler;
		}

		bot.log( macro, filler, fillerArgs, '/parse replaceMacro' );
		//when the macro is a function
		if ( macro.apply ) {
			ret += macro.apply( null, parseMacroArgs(fillerArgs) );
		}
		//when the macro is simply a substitution
		else {
			ret += macro;
		}
		return ret;
	}

	function parseMacroArgs ( macroArgs ) {
		bot.log( macroArgs, '/parse parseMacroArgs' );
		if ( !macroArgs ) {
			return [ source ];
		}

		//parse the arguments, split them into individual arguments,
		// and trim'em (to cover the case of "arg,arg" and "arg, arg")
		return (
			[ source ].concat(
				parse( macroArgs, extraVars )
					.split( ',' ).invoke( 'trim' ) ) );
		//this is not good code
	}

	function findMacro ( macro ) {
		var container = [ macros, extraVars ].first( hasMacro );

		return ( container || {} )[ macro ];

		function hasMacro ( obj ) {
			return obj && obj.hasOwnProperty( macro );
		}
	}
};


//})();
