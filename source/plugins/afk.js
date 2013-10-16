//solves #86, written by @Shmiddty: https://gist.github.com/Shmiddty/6829439
(function () {
"use strict";

// "user name" : {lastPing : Date.now(), msg : "afk message", returnMsg: "bot sends this when you return"}
var demAFKs = bot.memory.get( 'afk' );
//5 minute limit between auto-responds.
var rateLimit = 5 * 60 * 1000;

var responses = [
    { 
        outgoing: "Why are you leaving me?!", 
        incoming: ["Welcome back!", "Where were you?!", "You saw that whore again, didn't you?!"]
    },{ 
        outgoing: "Just go already!", 
        incoming: ["Oh, it's you again...", "Look at what the cat dragged in...", "You've got some balls, coming back here after what you did."]
    },{ 
        outgoing: "Nobody cares.", 
        incoming: ["I already told you, nobody cares.", "There goes the neighbourhood."]
    },{ 
        outgoing: "Hurry back, ok?", 
        incoming: ["I thought you'd never come back!", "It's been 20 years. You can't just waltz back into my life like this."] 
    },{ 
        outgoing: "Stay safe.", 
        incoming: ["Were you bitten?! Strip! Prove you weren't bitten."] 
    },{ 
        outgoing: "Can you pick up some milk on your way back?", 
        incoming: ["Where's the milk?", "Turns out I already have milk. Oops."] 
    },{
        outgoing: "Apricots are people too!",
        incoming: ["You taste just like raisin.", "I am a banana!", "My spoon is too big!", "BROOOOOOOOOOOO."]
    }
];

var respond = function ( user, msg ) {
    var afkObj = demAFKs[ user ],
        room_id = msg.get("room_id"),
        now = Date.now(),
        lstPing = afkObj.lastPing[room_id],
        shouldReply = lstPing === undefined || now - lstPing >= rateLimit;

    if ( shouldReply ){
        //Send a response and such
        msg.directreply( [user, 'is afk'+(afkObj.msg?':':'.'), afkObj.msg].join(' ') );
        afkObj.lastPing[room_id] = now;
        bot.memory.save( 'afk' );
    }
};

var goAFK = function ( user, msg, returnMsg ) {
    demAFKs[ user ] = {
        lastPing : {},
        returnMsg : returnMsg,
        msg : msg.trim()
    };
};

var clearAFK = function ( user ) {
    delete demAFKs[ user ];
};

var commandHandler = function ( msg ) {
    //parse the message and stuff.
    var user = msg.get( 'user_name' ).replace(/ /g,''),
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
    msg.directreply( reply );
};

bot.addCommand({
    name : 'afk',
    fun : commandHandler,
    permissions : {
        del: 'NONE'
    },
    description : 'Set an AFK message: `!!afk <message>`. Invoke `!!afk` again' +
        ' to return.'
});

IO.register( 'input', function ( msgObj ) {
    var body = msgObj.content.toUpperCase(),
        msg = bot.prepareMessage( msgObj ),
        rgx = new RegExp( '^' + bot.invocationPattern + ' ?/? ?afk', 'i' );
    
    if ( demAFKs.hasOwnProperty(msgObj.user_name.replace(/ /g,'')) 
         && rgx.test(body) === false ) {
        // the user posted, and did not invoke the afk command
        // TODO: It might be a good idea to extract this into something like
        // bot.getCommandNameFromMessage(msgObj) 
        // which would return the string name for a valid command message,
        // or undefined for an message that contains an invalid command or no command.
        commandHandler(msg);
        
        // We don't want to return here, as the returning user could be pinging someone. 
    }
    
    //we only care about messages not made by the bot, and containing pings
    if ( msgObj.user_id === bot.adapter.user_id || body.indexOf('@') < 0 ) {
        return;
    }

    Object.keys( demAFKs ).forEach(function ( name ) {
        if ( body.indexOf('@'+name.toUpperCase()) > -1 ) {
            bot.log( '/afk responding for ' + name );
            respond( name, msg );
        }
    });
});

})();
