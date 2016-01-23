module.exports = function (bot) {
"use strict";

//status codes for (un)ban.
var codes = {
    added : 0,
    0 : '{0} added to mindjail.',

    notFound : 1,
    1 : 'I couldn\'t find {0}.',

    owner : 2,
    2 : 'I can\'t mindjail {0}, they\'re an owner.',

    alreadyIn : 3,
    3 : '{0} is already in mindjail.',

    notIn : 4,
    4 : '{0} isn\'t in mindjail.',

    freed : 5,
    5 : '{0} freed from mindjail!'
};

var ban = {
    name : 'ban',

    fun : function ( msg ) {
        return this.format( this.logic(msg.toString()) );
    },

    //takes a username or userid or the empty string. if the last is given,
    // an array of banned user ids. under regular conditions, an object with
    // the message code (see codes above) and the argument is given.
    logic : function ( arg ) {
        if ( !arg ) {
            return Object.keys( bot.banlist ).filter( Number );
        }

        var id = Number( arg ),
            code;

        if ( isNaN(id) ) {
            id = bot.users.findUserId( arg.replace(/^@/, '') );
        }

        bot.log( arg, id, '/ban argument' );

        if ( id < 0 ) {
            code = codes.notFound;
        }
        else if ( bot.isOwner(id) ) {
            code = codes.owner;
        }
        else if ( bot.banlist.contains(id) ) {
            code = codes.alreadyIn;
        }
        else {
            bot.banlist.add( id );
            code = codes.added;
        }

        return { code : code, usrid : arg };
    },

    //res is either an array of userids, or a success/error code with the userid
    format : function ( res ) {
        if ( Array.isArray(res) ) {
            return res.map( this.formatUser ).join( ', ' ) ||
                'Nothing to show.';
        }

        return codes[ res.code ].supplant( res.usrid );
    },

    formatUser : function ( usrid ) {
        var user = bot.users[ usrid ],
            name = user ? user.name : '?';

        return '{0} ({1})'.supplant( usrid, name );
    },

    permissions : { del : 'NONE', use : 'OWNER' },
    description : 'Bans a user from using me. Lacking arguments, prints the ' +
        'ban list. `/ban [usr_id|usr_name]`',
    pendingMessage : 'The user will be thrown into mindjail in {0} more invocations'
};

var unban = {
    name : 'unban',

    fun : function ( msg ) {
        return this.format( this.logic(msg.toString()) );
    },

    logic : function ( arg ) {
        var id = Number( arg ),
            code;

        if ( isNaN(id) ) {
            id = bot.users.findUserId( arg.replace(/^@/, '') );
        }

        bot.log( arg, id, '/unban argument' );

        if ( id < 0 ) {
            code = codes.notFound;
        }
        else if ( !bot.banlist.contains(id) ) {
            code = codes.notIn;
        }
        else {
            bot.banlist.remove( id );
            code = codes.freed;
        }

        return { code : code, usrid : arg };
    },

    format : function ( res ) {
        return codes[ res.code ].supplant( res.usrid );
    },

    permissions : { del : 'NONE', use : 'OWNER' },
    description : 'Frees a user from my mindjail. `/unban usr_id|usr_name`'
};

bot.addCommand( bot.CommunityCommand(ban) );
bot.addCommand( unban );

};
