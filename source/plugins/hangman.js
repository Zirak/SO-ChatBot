(function () {
"use strict";

var randomWord = function ( cb ) {
	var url = 'http://randomword.setgetgo.com/get.php';

	IO.jsonp({
		url : url,
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		cb( resp.Word.trim() );
	}
};

var game = {

	//the dude is just a template to be filled with parts
	dude : [
		'  +---+' ,
		'  |   |' ,
		'  |  413',
		'  |   2' ,
		'  |  5 6',
		'__+__'
	].join( '\n' ),

	parts : [ '', 'O', '|', '/', '\\', '/', '\\' ],

	word : '',
	revealed : '',

	guesses : [],
	guessNum : 0,
	maxGuess : 6,
	guessMade : false,

	end : true,
	msg : null,

	validGuessRegex : /^[\w\s]+$/,

	receiveMessage : function ( msg ) {
		this.msg = msg;

		if ( this.end ) {
			this.new();
		}
		if ( msg.content ) {
			return this.handleGuess( msg );
		}
	},

	new : function () {
		var that = this;

		randomWord(function ( word ) {
			bot.log( word + ' /hang random' );

			game.word = word;
			that.revealed = new Array( word.length + 1 ).join( '-' );
			that.guesses = [];
			that.guessNum = 0;

			//oh look, another dirty hack...this one is to make sure the
			// hangman is codified
			that.guessMade = true;

			that.register();
		});
	},

	handleGuess : function ( msg ) {
		var guess = msg.slice().toLowerCase();
		bot.log( guess, 'handleGuess' );

		if ( !this.validGuessRegex.test(guess) ) {
			return 'Only alphanumeric and whitespace characters allowed';
		}

		//check if it was already submitted
		if ( this.guesses.indexOf(guess) > -1 ) {
			return guess + ' was already submitted';
		}

		//or if it's the wrong length
		if ( guess.length < this.word.length ) {
			return guess + ' is shorter than the word.';
		}

		//replace all occurences of guest within the hidden word with their
		// actual characters
		var indexes = this.word.indexesOf( guess );
		indexes.forEach(function ( index ) {
			this.uncoverPart( guess, index );
		}, this);

		//not found in secret word, penalize the evil doers!
		if ( !indexes.length ) {
			this.guessNum++;
		}

		this.guesses.push( guess );
		this.guessMade = true;

		bot.log( guess, this.guessMade, 'handleGuess handled' );

		//plain vanilla lose-win checks
		if ( this.loseCheck() ) {
			return this.lose();
		}

		if ( this.winCheck() ) {
			return this.win();
		}
	},

	//unearth a portion of the secret word
	uncoverPart : function ( guess, startIndex ) {
		this.revealed =
			this.revealed.slice( 0, startIndex ) +
			guess +
			this.revealed.slice( startIndex + guess.length );
	},

	//attach the hangman drawing to the already guessed list and to the
	// revealed portion of the secret word
	preparePrint : function () {
		var that = this;

		//replace the placeholders in the dude with body parts
		var dude = this.dude.replace( /\d/g, function ( part ) {
			return part > that.guessNum ? ' ' : that.parts[ part ];
		});

		var belowDude = this.guesses.sort().join( ', ' ) + '\n' + this.revealed;

		var hangy = this.msg.codify( dude + belowDude );
		bot.log( hangy, this.msg );
		this.msg.respond( hangy );
	},

	//win the game
	win : function () {
		this.unregister();
		return 'Correct! The phrase is ' + this.word + '.';
	},

	//lose the game. less bitter messages? maybe.
	lose : function () {
		this.unregister();
		return 'You people suck. The phrase was ' + this.word;
	},

	winCheck : function () {
		return this.word === this.revealed;
	},

	loseCheck : function () {
		return this.guessNum >= this.maxGuess;
	},

	register : function () {
		this.unregister(); //to make sure it's not added multiple times
		IO.register( 'beforeoutput', this.buildOutput, this );

		this.end = false;
	},
	unregister : function () {
		IO.unregister( 'beforeoutput', this.buildOutput );

		this.end = true;
	},

	buildOutput : function () {
		if ( this.guessMade ) {
			this.preparePrint();

			this.guessMade = false;
		}
	}
};
bot.addCommand({
	name : 'hang',
	fun : game.receiveMessage,
	thisArg : game
});

}());
