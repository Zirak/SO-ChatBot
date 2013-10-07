//solves #86, written by @Shmiddty: https://gist.github.com/Shmiddty/6829439
(function () {
"use strict";

// "user name" : {lastPing : Date.now(), msg : "afk message"}
var demAFKs = bot.memory.get( 'afk' );
//5 minute limit between auto-responds.
var rateLimit = 5 * 60 * 1000;

var responses = {
    coming : [
        'Welcome back!',
        'Oh, it\'s you again...',
        'Nobody cares.',
        'I thought you\'d never come back!',
        'Where\'s the milk?'
    ],
    leaving : [
        'Just go already!',
        'Why are you leaving me?!',
        'Nobody cares.',
        'Hurry back, ok?',
        'Can you pick up some milk on your way back?'
    ]
};

var respond = function ( user, msg ) {
    var afkObj = demAFKs[ user ],
        now = Date.now(),
        shouldReply = now - afkObj.lastPing >= rateLimit;

    if ( shouldReply ){
        //Send a response and such
        msg.directreply( [user, 'is afk:', afkObj.msg].join(' ') );
        afkObj.lastPing = now;
        bot.memory.save( 'afk' );
    }
};

var goAFK = function ( user, msg ) {
    demAFKs[ user ] = {
        lastPing : 0,
        msg : msg.trim() || 'afk'
    };
};

var clearAFK = function ( user ) {
    delete demAFKs[ user ];
};

bot.addCommand({
    name : 'afk',
    fun : function ( msg ) {
        //parse the message and stuff.
        var user = msg.get( 'user_name' ),
            afkMsg = msg.content,
            reply;

        bot.log( '/afk input', user, afkMsg );

        if ( demAFKs.hasOwnProperty(user) ) {
            clearAFK( user );

            reply = responses.coming.random();
        }
        else {
            goAFK( user, afkMsg );

            reply = responses.leaving.random();
        }

        bot.memory.save( 'afk' );
        msg.directreply( reply );
    },
    permissions: {
        del: 'NONE'
    },
    description: 'Set an AFK message: `!!afk <message>`. Invoke `!!afk` again' +
        ' to return.'
});

IO.register( 'input', function ( msgObj ) {
    var body = msgObj.content.toUpperCase();

    //we only care about messages not made by the bot, and containing pings
    if ( msgObj.user_id === bot.adapter.user_id || body.indexOf('@') < 0 ) {
        return;
    }

    var msg = bot.prepareMessage( msgObj );

    Object.keys( demAFKs ).forEach(function ( name ) {
        if ( body.indexOf('@'+name.toUpperCase()) > -1 ) {
            bot.log( '/afk responding for ' + name );
            respond( name, msg );
        }
    });
});

})();
