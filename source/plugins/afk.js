//solves #86, written by @Shmiddty: https://gist.github.com/Shmiddty/6829439
(function () {
"use strict";

// "user name" : {lastPing : Date.now(), msg : "afk message", returnMsg: "bot sends this when you return"}
var demAFKs = bot.memory.get( 'afk' );
//5 minute limit between auto-responds.
var rateLimit = 5 * 60 * 1000;

var responses = [
    { outgoing: "Why are you leaving me?!", incoming: "Welcome back!" },
    { outgoing: "Just go already!", incoming: "Oh, it's you again..." },
    { outgoing: "Nobody cares.", incoming: "I already told you, nobody cares." },
    { outgoing: "Hurry back, ok?", incoming: "I thought you'd never come back" },
    { outgoing: "Can you pick up some milk on your way back?", incoming: "Where's the milk?" }
];

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

var goAFK = function ( user, msg, returnMsg ) {
    demAFKs[ user ] = {
        lastPing : 0,
        returnMsg : returnMsg
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
            reply, botReply;

        bot.log( '/afk input', user, afkMsg );

        if ( demAFKs.hasOwnProperty(user) ) {
            reply = demAFKs[ user ].returnMsg;
            clearAFK( user );
        }
        else {
            botReply = responses.random();
            reply = botReply.outgoing;
            
            goAFK( user, afkMsg, botReply.incoming );
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
