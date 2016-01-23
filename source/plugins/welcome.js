module.exports = function (bot) {
"use strict";
//welcomes new users with a link to the room rules and a short message.

var seen = bot.memory.get( 'users' ),
    //hardcoded for some (in)sanity. Change accordingly.
    ownerRoom = 17;

var message = bot.config.welcomeMessage;

function welcome ( name, room ) {
    bot.adapter.out.add( bot.adapter.reply(name) + " " + message, room );
}

IO.register( 'input', function welcomeListener ( msgObj ) {
    var uid = msgObj.user_id,
        user = bot.users[ uid ],
        room = msgObj.room_id;

    var semiLegitUser = user && isSemiLegitUser( user );
    if ( Number(room) !== ownerRoom || semiLegitUser  || seen[uid] ) {
        if ( semiLegitUser ) {
            delete seen[ uid ];
            finish();
        }
        return;
    }

    seen[ uid ] = true;

    bot.IO.xhr({
        method : 'GET',
        url : '/users/' + uid,

        document : true,
        complete : complete
    });

    function complete ( doc ) {
        //<div id='room-17'>
        // ...
        // <div class='room-message-count' title='72279 all time messages (by Zirak)
        //    ...
        // </div>
        // ...
        //</div>
        var messageCount = doc.querySelector(
            '#room-' + ownerRoom + ' .room-message-count'
        ),
            newUser;

        if ( messageCount ) {
            newUser = Number( /^\d+/.exec(messageCount.title) ) < 2;
        }
        else {
            newUser = true;
        }

        if ( newUser ) {
            welcome( user.name, room );
        }

        seen[ uid ] = true;
        finish();
    }

    function finish () {
        bot.memory.save( 'users' );
    }

    function isSemiLegitUser ( user ) {
        return bot.isOwner( user.id ) ||
            user.reputation > 1000 ||
            user.reputation < 20;
    }
});

bot.addCommand({
    name : 'welcome',
    fun : function ( args ) {
        if (!args.length) {
            return message;
        }

        welcome( args, args.get('room_id') );
    },
    permission : {
        del : 'NONE'
    },
    description : 'Welcomes a user. `/welcome user`'
});
};
