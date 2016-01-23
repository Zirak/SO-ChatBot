module.exports = function (bot) {
"use strict";

var summon = function ( args ) {
    var room = Number( args );

    if ( !room ) {
        return 'That aint no room I ever heard of! ' +
            '`/help summon` for usage info';
    }

    bot.adapter.in.init( room );
};

var unsummon = function ( args, cb ) {
    var room = args.content ? Number( args ) : args.get( 'room_id' );

    if ( !room ) {
        return 'That aint no room I ever heard of! ' +
            '`/help unsummon` for usage info';
    }

    bot.adapter.in.leaveRoom( room, function ( err ) {
        if ( err === 'base_room' ) {
            finish( 'I can\'t leave my home!' );
        }
    });

    function finish ( res ) {
        if ( cb && cb.call ) {
            cb( res );
        }
        else {
            args.reply( res );
        }
    }
};

bot.addCommand( bot.CommunityCommand({
    name : 'summon',
    fun : summon,
    permissions : {
        del : 'NONE',
        use : 'OWNER'
    },
    description : 'Say boopidi bee and in the room I shall be. '+
        '`/summon roomid`',
    pendingMessage: 'I will appear in that room after {0} more invocation(s)'
}));

bot.addCommand( bot.CommunityCommand({
    name : 'unsummon',
    fun : unsummon,
    permissions : {
        del : 'NONE',
        use : 'OWNER'
    },
    description : 'Chant zippidi lepat and from the room I shall depart. ' +
        '`/unsummon [roomid=your_roomid]`',
    pendingMessage: 'I will leave this room after {0} more invocation(s)'
}));

};
