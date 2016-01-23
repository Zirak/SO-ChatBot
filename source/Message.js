/*global exports*/

exports.Message = function ( text, msgObj ) {
    var bot = this;

    //"casting" to object so that it can be extended with cool stuff and
    // still be treated like a string
    var ret = Object( text );
    ret.content = text;

    var rawSend = function ( text ) {
        bot.adapter.out.add( text, msgObj.room_id );
    };
    var deliciousObject = {
        send : rawSend,

        reply : function ( resp, user_name ) {
            var prefix = bot.adapter.reply( user_name || msgObj.user_name );
            rawSend( prefix + ' ' + resp );
        },
        directreply : function ( resp ) {
            var prefix = bot.adapter.directreply( msgObj.message_id );
            rawSend( prefix + ' ' + resp );
        },

        //parse() parses the original message
        //parse( true ) also turns every match result to a Message
        //parse( msgToParse ) parses msgToParse
        //parse( msgToParse, true ) combination of the above
        parse : function ( msg, map ) {
            // parse( true )
            if ( Boolean(msg) === msg ) {
                map = msg;
                msg = text;
            }
            var parsed = bot.parseCommandArgs( msg || text );

            // parse( msgToParse )
            if ( !map ) {
                return parsed;
            }

            // parse( msgToParse, true )
            return parsed.map(function ( part ) {
                return bot.Message( part, msgObj );
            });
        },

        //execute a regexp against the text, saving it inside the object
        exec : function ( regexp ) {
            var match = regexp.exec( text );
            this.matches = match || [];

            return match;
        },

        findUserId   : bot.users.findUserId,
        findUsername : bot.users.findUsername,

        codify : bot.adapter.codify.bind( bot.adapter ),
        escape : bot.adapter.escape.bind( bot.adapter ),
        link   : bot.adapter.link.bind( bot.adapter ),

        //retrieve a value from the original message object, or if no argument
        // provided, the msgObj itself
        get : function ( what ) {
            if ( !what ) {
                return msgObj;
            }
            return msgObj[ what ];
        },
        set : function ( what, val ) {
            msgObj[ what ] = val;
            return msgObj[ what ];
        }
    };

    Object.iterate( deliciousObject, function ( key, prop ) {
        ret[ key ] = prop;
    });

    return ret;
};
