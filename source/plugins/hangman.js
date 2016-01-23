module.exports = function (bot) {
"use strict";

var randomWord = function ( length, cb ) {
    var url = 'http://sleepy-bastion-8674.herokuapp.com/';

    if ( Number(length) ) {
        url += '?length=' + length;
    }

    bot.IO.jsonp({
        url : url,
        jsonpName : 'callback',
        fun : complete //aaawwww yyeeaaahhhh
    });

    function complete ( resp ) {
        cb( resp.word.toLowerCase().trim() );
    }
};

var game = {
    //the dude is just a template to be filled with parts
    //like a futuristic man. he has no shape. he has no identity. he's just a
    // collection of mindless parts, to be assembled, for the greater good.
    //pah! I mock your pathetic attempts at disowning man of his prowess! YOU
    // SHALL NOT WIN! VIVE LA PENSÉE!!
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

    end : true,
    msg : null,

    validGuessRegex : /^[a-zA-Z]+$/,

    receiveMessage : function ( msg ) {
        this.msg = msg;

        if ( this.end ) {
            this.new( msg );
        }
        else {
            return this.handleGuess( msg );
        }
    },

    new : function ( msg ) {
        var self = this;
        randomWord( msg, finish );

        function finish ( word ) {
            bot.log( word + ' /hang random' );
            game.word = word;
            self.revealed = new Array( word.length + 1 ).join( '-' );
            self.guesses = [];
            self.guessNum = 0;

            self.guessMade();
            self.end = false;

            if ( msg.length && !Number(msg) ) {
                self.receiveMessage( msg );
            }
        }
    },

    handleGuess : function ( msg ) {
        var guess = msg.slice().toLowerCase();
        bot.log( guess, 'handleGuess' );

        var err = this.checkGuess( guess );
        if ( err ) {
            return err;
        }

        //replace all occurences of the guess within the hidden word with their
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
        this.guessMade();

        bot.log( guess, 'handleGuess handled' );

        //plain vanilla lose-win checks. yum yum yum.
        if ( this.loseCheck() ) {
            return this.lose();
        }
        if ( this.winCheck() ) {
            return this.win();
        }
    },

    checkGuess : function ( guess ) {
        if ( !guess.length || Number(guess) ) {
            return 'We\'re already playing!';
        }

        if ( !this.validGuessRegex.test(guess) ) {
            return 'I will only accept alpha characters';
        }

        //check if it was already submitted
        if ( this.guesses.indexOf(guess) > -1 ) {
            return guess + ' was already submitted';
        }

        //or if it's the wrong length
        if ( guess.length > this.word.length ) {
            return bot.adapter.codify( guess ) + ' is too long to fit';
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
        if (this.end) {
            return;
        }
        var self = this;

        //replace the placeholders in the dude with body parts
        var dude = this.dude.replace( /\d/g, function ( part ) {
            return part > self.guessNum ? ' ' : self.parts[ part ];
        });

        var belowDude = this.guesses.sort().join( ', ' ) +
            '\n' + this.revealed;
        var hangy = this.msg.codify( dude + '\n' + belowDude );

        bot.log( hangy, this.msg );
        this.msg.send( hangy );
    },

    //win the game
    win : function () {
        this.end = true;
        return 'Correct! The word is ' + this.word + '.';
    },

    //lose the game. less bitter messages? maybe.
    lose : function () {
        this.end = true;
        return 'You people suck. The word is ' + this.word;
    },

    winCheck : function () {
        return this.word === this.revealed;
    },

    loseCheck : function () {
        return this.guessNum >= this.maxGuess;
    },

    guessMade : function () {
        clearTimeout( this.printTimeout );
        this.printTimeout = setTimeout( this.preparePrint.bind(this), 2000 );
    }
};

bot.addCommand({
    name : 'hang',
    fun : game.receiveMessage,
    thisArg : game
});
};
