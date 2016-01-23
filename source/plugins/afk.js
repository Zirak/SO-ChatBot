//solves #86, mostly written by @Shmiddty
module.exports = function (bot) {
"use strict";

/*
memory.afk = {
    "user name" : {
        afkSince : time of /afk call
        lastPing : { roomID : time of last ping },
        msg : afk message,
        returnMsg : welcome-back message
    },
    ...
};
*/
var demAFKs = bot.memory.get( 'afk' );
//5 minute limit between auto-responds.
var rateLimit = 5 * 60 * 1000,
//2 minutes where you can talk without escaping the afk.
    gracePeriod = 2 * 60 * 1000;

var responses = [
    {
        outgoing : 'Why are you leaving me!?',
        incoming : [
            'Welcome back!', 'Where were you!?',
            'You saw that whore again, didn\'t you!?'
        ]
    },
    {
        outgoing : 'Just go already!',
        incoming : [
            'Oh, it\'s you again...', 'Look at what the cat dragged in...',
            'You\'ve got some balls, coming back here after what you did.'
        ]
    },
    {
        outgoing : 'Nobody cares.',
        incoming : [
            'I already told you, nobody cares.',
            'There goes the neighbourhood.'
        ]
    },
    {
        outgoing : 'Hurry back, ok?',
        incoming : [
            'I thought you\'d never come back!',
            'It\'s been 20 years. You can\'t just waltz back into my life ' +
                'like this.'
        ]
    },
    {
        outgoing : 'Stay safe.',
        incoming : [ 'Were you bitten!? Strip! Prove you weren\'t bitten.' ]
    },
    {
        outgoing : 'Can you pick up some milk on your way back?',
        incoming : [
            'Where\'s the milk?',
            'Turns out I already have milk. Oops.'
        ]
    },
    {
        outgoing : 'Apricots are people too!',
        incoming : [
            'You taste just like raisin.', 'I am a banana!',
            'My spoon is too big!', 'BROOOOOOOOOOOO.'
        ]
    }
];

var respondFor = function ( user, msg ) {
    var afkObj = demAFKs[ user ],
        room_id = msg.get( 'room_id' ),
        now = Date.now();

    if ( shouldReply() ) {
        //Send a response and such
        msg.directreply( formulateReponse() );
        afkObj.lastPing[ room_id ] = now;
        bot.memory.save( 'afk' );
    }

    function formulateReponse () {
        var format = '{user} is afk{sep}{rest}';
        var data = {
            user : user,
            sep : '.',
            rest : ''
        };

        if ( afkObj.msg ) {
            data.sep = ': ';
            data.rest = afkObj.msg;
        }

        return format.supplant( data );
    }

    function shouldReply () {
        var lastPing = afkObj.lastPing[ room_id ];

        return (
            ( now - afkObj.afkSince >= gracePeriod ) &&
            ( !lastPing || now - lastPing >= rateLimit ) );
    }
};

var goAFK = function ( name, msg, returnMsg ) {
    var noReturn = false;

    bot.log( '/afk goAFK ', name );

    if ( msg.indexOf('!') === 0 ) {
        msg = msg.substring( 1 );
        noReturn = true;
    }

    demAFKs[ name ] = {
        afkSince : Date.now(),
        lastPing : {},
        msg : msg.trim(),
        returnMsg : returnMsg,
    };

    if ( noReturn ) {
        demAFKs[ name ].noReturn = 1;
    }
};

var clearAFK = function ( name ) {
    bot.log( '/afk clearAFK', name );
    delete demAFKs[ name ];
};

var commandHandler = function ( msg ) {
    //parse the message and stuff.
    var user = msg.get( 'user_name' ).replace( /\s/g, '' ),
        afkMsg = msg.content,
        reply, botReply;

    bot.log( '/afk input', user, afkMsg );

    if ( demAFKs.hasOwnProperty(user) ) {
        reply = demAFKs[ user ].returnMsg;
        clearAFK( user );
    }
    else {
        botReply = responses.random();
        reply = botReply.outgoing;

        goAFK( user, afkMsg, botReply.incoming.random() );
    }

    bot.memory.save( 'afk' );
};

bot.addCommand({
    name : 'afk',
    fun : commandHandler,
    permissions : {
        del: 'NONE'
    },
    description : 'Set an afk message: `/afk <message>`. Invoke `/afk` ' +
        'again to return.',
    unTellable : true
});

bot.IO.register( 'input', function afkInputListener ( msgObj ) {
    var body = msgObj.content.toUpperCase(),
        msg = bot.prepareMessage( msgObj ),

        userName = msgObj.user_name.replace( /\s/g, '' ),

        now = Date.now();

    //we don't care about bot messages
    if ( msgObj.user_id === bot.adapter.user_id ) {
        return;
    }

    if ( hasReturned() ) {
        bot.log( '/afk he returned!', msgObj );
        commandHandler( msg );
        //We don't want to return here, as the returning user could be pinging
        // someone.
    }

    //and we don't care if the message doesn't have any pings
    if ( body.indexOf('@') < 0 ) {
        return;
    }

    Object.keys( demAFKs ).forEach(function afkCheckAndRespond ( name ) {
        // /(^|\b)@bob\b/i
        var pinged = new RegExp(
            '(^|\b)' + RegExp.escape( '@' + name ) + '\\b', 'i' );

        if ( pinged.test(body) ) {
            bot.log( '/afk responding for ' + name );
            respondFor( name, msg );
        }
    });

    function hasReturned () {
        //if the user posts, we want to release them from afk's iron grip.
        // however, to prevent activating it twice, we need to check whether
        // they're calling the bot's afk command already.
        var invokeRe = new RegExp(
            '^' + RegExp.escape( bot.config.pattern ) + '\\s*\/?\\s*AFK' );

        return demAFKs.hasOwnProperty( userName ) &&
                !invokeRe.test( body ) &&
                ( now - demAFKs[userName].afkSince >= gracePeriod );
    }
});

};
