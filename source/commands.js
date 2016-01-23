"use strict";
//TODO something a bit more legit...break this file apart
module.exports = function (bot) {

var commands = {
    help : function ( args ) {
        if ( args && args.length ) {

            var cmd = bot.getCommand( args.toLowerCase() );
            if ( cmd.error ) {
                return cmd.error;
            }

            var desc = cmd.description || 'No info is available';

            return args + ': ' + desc;
        }

        return 'Information on interacting with me can be found at ' +
            '[this page](https://github.com/Zirak/SO-ChatBot/' +
            'wiki/Interacting-with-the-bot)';
    },

    listen : function ( msg ) {
        var ret = bot.callListeners( msg );
        if ( !ret ) {
            return bot.giveUpMessage();
        }
    },

    eval : function ( msg, cb ) {
        cb = cb || msg.directreply.bind( msg );

        return bot.prettyEval( msg, cb );
    },

    refresh : function() {
        window.location.reload();
    },

    forget : function ( args ) {
        var name = args.toLowerCase(),
            cmd = bot.getCommand( name );

        if ( cmd.error ) {
            return cmd.error;
        }

        if ( !cmd.canDel(args.get('user_id')) ) {
            return 'You are not authorized to delete the command ' + args;
        }

        cmd.del();
        return 'Command ' + name + ' forgotten.';
    },

    //a lesson on semi-bad practices and laziness
    //chapter III
    info : function ( args ) {
        if ( args.content ) {
            return commandFormat( args.content );
        }

        var info = bot.info;
        return timeFormat() + ', ' + statsFormat();

        function commandFormat ( commandName ) {
            var cmd = bot.getCommand( commandName );

            if ( cmd.error ) {
                return cmd.error;
            }
            var ret =  'Command {name}, created by {creator}'.supplant( cmd );

            if ( cmd.date ) {
                ret += ' on ' + cmd.date.toUTCString();
            }

            return ret;
        }

        function timeFormat () {
            var format = 'I awoke on {0} (that\'s about {1} ago)',

                awoke = info.start.toUTCString(),
                ago = Date.timeSince( info.start );

            return format.supplant( awoke, ago );
        }

        function statsFormat () {
            var ret = [],
                but = ''; //you'll see in a few lines

            if ( info.invoked ) {
                ret.push( 'got invoked ' + info.invoked + ' times' );
            }
            if ( info.learned ) {
                but = 'but ';
                ret.push( 'learned ' + info.learned + ' commands' );
            }
            if ( info.forgotten ) {
                ret.push( but + 'forgotten ' + info.forgotten + ' commands' );
            }
            if ( Math.random() < 0.15 ) {
                ret.push( 'teleported ' + Math.rand(100) + ' goats' );
            }

            return ret.join( ', ' ) || 'haven\'t done anything yet!';
        }
    }
};

commands.listcommands = (function () {
function partition ( list, maxSize ) {
    var size = 0, last = [];

    var ret = list.reduce(function partition ( ret, item ) {
        var len = item.length + 2; //+1 for comma, +1 for space

        if ( size + len > maxSize ) {
            ret.push( last );
            last = [];
            size = 0;
        }
        last.push( item );
        size += len;

        return ret;
    }, []);

    if ( last.length ) {
        ret.push( last );
    }

    return ret;
}

function getSortedCommands() {
    //well, sort of sorted. we want to sort the commands, but have the built-ins
    // be in front, with help as the first one. #153
    var commandNames = Object.keys( bot.commands );

    var commandGroups = commandNames.groupBy(function ( cmdName ) {
        return bot.commands[ cmdName ].learned ? 'learned' : 'builtin';
    });

    var sortedCommands = commandGroups.builtin.sort().concat(
        commandGroups.learned.sort()
    );

    var helpIndex = sortedCommands.indexOf('help');
    sortedCommands.unshift( sortedCommands.splice(helpIndex, 1)[ 0 ] );

    return sortedCommands;
}

return function ( args ) {
    var commands = getSortedCommands(),
        //500 is the max, compensate for user reply
        maxSize = 499 - bot.adapter.reply( args.get('user_name') ).length,
        //TODO: only call this when commands were learned/forgotten since last
        partitioned = partition( commands, maxSize );

    return partitioned.invoke( 'join', ', ' ).join( '\n' );
};
})();

commands.eval.async = true;

commands.tell = function ( args ) {
    var parts = args.split( ' ' );
    bot.log( args.valueOf(), parts, '/tell input' );

    var replyTo = parts[ 0 ],
        cmdName = parts[ 1 ],
        cmd;

    if ( !replyTo || !cmdName ) {
        return 'Invalid /tell arguments. Use /help for usage info';
    }

    cmdName = cmdName.toLowerCase();
    cmd = bot.getCommand( cmdName );
    if ( cmd.error ) {
        return cmd.error +
            ' (note that /tell works on commands, it\'s not an echo.)';
    }

    if ( cmd.unTellable ) {
        return 'Command ' + cmdName + ' cannot be used in `/tell`.';
    }

    if ( !cmd.canUse(args.get('user_id')) ) {
        return 'You do not have permission to use command ' + cmdName;
    }

    //check if the user's being a fag
    if ( /^@/.test(replyTo) ) {
        return 'Don\'t be annoying, drop the @, nobody likes a double-ping.';
    }

    //check if the user wants to reply to a message
    var direct = false,
        extended = {};
    if ( /^:?\d+$/.test(replyTo) ) {
        extended.message_id = replyTo.replace( /^:/, '' );
        direct = true;
    }
    else {
        extended.user_name = replyTo;
    }

    var msgObj = Object.merge( args.get(), extended ),
        cmdArgs = bot.Message( parts.slice(2).join(' '), msgObj );

    //this is an ugly, but functional thing, much like your high-school prom
    // date to make sure a command's output goes through us, we simply override
    // the standard ways to do output
    var reply = cmdArgs.reply.bind( cmdArgs ),
        directreply = cmdArgs.directreply.bind( cmdArgs );

    cmdArgs.reply = cmdArgs.directreply = cmdArgs.send = callFinished;

    bot.log( cmdArgs, '/tell calling ' + cmdName );

    //if the command is async, it'll accept a callback
    if ( cmd.async ) {
        cmd.exec( cmdArgs, callFinished );
    }
    else {
        callFinished( cmd.exec(cmdArgs) );
    }

    function callFinished ( res ) {
        if ( !res ) {
            return;
        }

        if ( direct ) {
            directreply( res );
        }
        else {
            reply( res );
        }
    }
};

var descriptions = {
    eval : 'Forwards message to javascript code-eval',
    forget : 'Forgets a given command. `/forget cmdName`',
    help : 'Fetches documentation for given command, or general help article.' +
        ' `/help [cmdName]`',
    info : 'Grabs some stats on my current instance or a command.' +
        ' `/info [cmdName]`',
    listcommands : 'Lists commands. `/listcommands`',
    listen : 'Forwards the message to my ears (as if called without the /)',
    refresh : 'Reloads the browser window I live in',
    tell : 'Redirect command result to user/message.' +
        ' /tell `msg_id|usr_name cmdName [cmdArgs]`'
};

//only allow owners to use certain commands
var privilegedCommands = {
    die : true, live  : true,
    ban : true, unban : true,
    refresh : true
};
//voting-based commands for unpriviledged users
var communal = {
    die : true, ban : true
};
//commands which can't be used with /tell
var unTellable = {
    tell : true, forget : true
};

Object.iterate( commands, function ( cmdName, fun ) {
    var cmd = {
        name : cmdName,
        fun  : fun,
        permissions : {
            del : 'NONE',
            use : privilegedCommands[ cmdName ] ? 'OWNER' : 'ALL'
        },
        description : descriptions[ cmdName ],
        pendingMessage: fun.pendingMessage,
        unTellable : unTellable[ cmdName ],
        async : fun.async
    };

    if ( communal[cmdName] ) {
        cmd = bot.CommunityCommand( cmd, fun.invokeReq );
    }
    bot.addCommand( cmd );
});

};
