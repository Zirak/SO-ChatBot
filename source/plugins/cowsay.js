module.exports = function (bot) {
"use strict";

var cowsay = {

    defaults : {
        e : 'oo',
        T : '  ',
        t : false,
        W : 40
    },

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

    //message is the text to moo, opts is an optional object, mimicking the
    // cowsay command arguments:
    //   e  =>  eyes
    //   T  =>  tongue
    //   t  =>  is the cow thinking?
    //   W  =>  word-wrapping width
    //defaults specified in cowsay.defaults
    moo : function ( message, opts ) {
        var defs = this.defaults;

        //the eyes and tongue should be exactly 2 characters
        //if the ones the user gave are too short, pad'em
        this.eyes     = rightPad( opts.e || defs.e, 2 ).slice( 0, 2 );
        this.tongue   = rightPad( opts.T || defs.T, 2 ).slice( 0, 2 );
        this.line     = opts.t ? 'O' : '\\';
        this.thinking = opts.t;

        this.message  = wordWrap( message, opts.W || defs.W ).trim();

        //cowsay is actually the result of breeding a balloon and a cow
        return this.makeBalloon() + this.makeCow();
    },

    makeCow : function () {
        return this.cow
            .replace( /e/g, this.eyes )
            .replace( /T/g, this.tongue )
            .replace( /L/g, this.line );
    },

    makeBalloon : function () {
        var lines = this.message.split( '\n' );

        var longest = lines.reduce( longestLine, 0 ),
            lineCount = lines.length,
            border = this.chooseBorders( lineCount );

        var balloon = lines.map( baloonLine );
        var boundaryOccurences = new Array( longest + 2 );
        balloon.unshift( ' ' + boundaryOccurences.join('_') );
        balloon.push   ( ' ' + boundaryOccurences.join('-') );

        return balloon.join( '\n' );

        function baloonLine ( line, idx ) {
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
                padders = border.slice( 2 );
            }

            //return the message, padded with spaces to the right as to fit
            // with the border, enclosed in the matching borders
            return (
                padders[ 0 ] + ' ' +
                rightPad( line, longest ) + ' ' +
                padders[ 1 ]
            );
        }
        function longestLine ( max, line ) {
            return line.length > max ? line.length : max;
        }
    },

    //choose the borders to use for the balloon
    chooseBorders : function ( lineCount ) {
        var border;

        //thought bubbles always look the same
        // ( moosage line 1 )
        // ( moosage line 2 )
        if ( this.thinking ) {
            border = [ '(', ')', '(', ')', '(', ')' ];
        }
        //single line messages are enclosed in < > and have no other borders
        // < mooosage >
        else if ( lineCount === 1 ) {
            border = [ '<', '>' ];
        }
        //multi-line messages have diaganol borders and straight walls
        // / moosage line 1 \
        // | moosage line 2 |
        // \ moosage line 3 /
        else {
            border = [ '/', '\\', '\\', '/', '|', '|' ];
        }

        return border;
    }
};

function wordWrap ( str, len ) {
    var lineLen = 0;
    return str.split( ' ' ).reduce( handleWord, '' );

    function handleWord ( ret, word ) {
        var wordLen = word.length;

        //let the wrapping...commence!
        if ( lineLen + wordLen > len ) {
            ret += '\n';
            lineLen = 0;
        }
        lineLen += wordLen + 1; //+1 for the space we now add

        return ret + word + ' ';
    }
}
function rightPad ( str, len, padder ) {
    padder = padder || ' ';
    return ( str + Array(len).join(padder) ).slice( 0, len );
}

bot.listen(
    /cow(think|say)\s(?:([eT])=(.{0,2})\s)?(?:([eT])=(.{0,2})\s)?(.+)/,

    function ( msg ) {
        //the first item is the whole match, second item is the "think" or
        // "say", last item is the message, we only want the "parameters"
        var opts = getOpts( msg.matches.slice(2, -1) );

        //cowsay or cowthink?
        opts.t = msg.matches[ 1 ] === 'think';
        bot.log( opts, 'cowsay opts' );

        var cowreact = cowsay.moo( msg.matches.pop(), opts );
        msg.send( msg.codify(cowreact) );

        function getOpts ( args ) {
            var ret = {};
            //'e=^^ T=vv would represent in capturing groups as:
            // ['e', '^^', 'T', 'vv']
            //so we go through the pairs
            for ( var i = 0, len = args.length; i < len; i += 2 ) {
                if ( args[i] && args[i+1] ) {
                    ret[ args[i] ] = args[ i + 1 ];
                }
            }

            return ret;
        }
    }
);

};
