module.exports = function (bot) {
"use strict";
var storage = bot.memory.get( 'learn' );

var replyPatterns = /^(<>|<user>|<msg>)/i,
    onlyReply = new RegExp( replyPatterns.source + '$', 'i' );
var mismatchErrMessage = 'Input not matching `{input}`. Help: {description}';

function learn ( args ) {
    bot.log( args, '/learn input' );

    var commandParts = args.parse();
    var command = {
        name   : commandParts[ 0 ],
        output : commandParts[ 1 ],
        input  : commandParts[ 2 ] || '.*',
        //meta info
        creator: args.get( 'user_name' ),
        creatorID : args.get('user_id' ),
        date   : new Date()
    };

    // this needs to be lowercased before we check if it is valid, otherwise !!help can be overwritten with !!HELP (true for all commands)
    command.name = command.name.toLowerCase();

    //a truthy value, unintuitively, means it isn't valid, because it returns
    // an error message
    var errorMessage = checkCommand( command );
    if ( errorMessage ) {
        return errorMessage;
    }

    command.input = new RegExp( command.input );
    command.description = [
        'User-taught command:',
        commandParts[3] || '',
        args.codify( command.output )
    ].join( ' ' );

    bot.log( command, '/learn parsed' );

    bot.info.learned += 1;
    addCustomCommand( command );
    saveCommand( command );

    return 'Command ' + command.name + ' learned';
}

function addCustomCommand ( command ) {
    var cmd = bot.Command({
        //I hate this duplication
        name : command.name,

        description : command.description,
        creator : command.creator,
        date : command.date,

        fun : makeCustomCommand( command ),
        permissions : {
            use : 'ALL',
            //to fix #171, command.creatorID was added. we need to retain BC
            del : command.creatorID ? [ command.creatorID ] : 'OWNER'
        }
    });
    cmd.learned = true;

    cmd.del = (function ( old ) {
        return function () {
            deleteCommand( command.name );
            old.call( cmd );
        };
    }( cmd.del ));

    bot.log( cmd, '/learn addCustomCommand' );
    bot.addCommand( cmd );
}
function makeCustomCommand ( command ) {
    var output = command.output.replace( replyPatterns, '' ).trim(),
        replyMethod = extractPattern();

    bot.log( command, '/learn makeCustomCommand' );

    return function userLearnedCommand ( args ) {
        bot.log( args, command.name + ' input' );

        var cmdArgs = bot.Message( output, args.get() ),
            parts = command.input.exec( args );

        //reply with the desc if there's incorrect usage (#102)
        if ( !parts ) {
            return mismatchErrMessage.supplant( command );
        }

        var res = bot.parseMacro( cmdArgs, parts );

        switch ( replyMethod ) {
        case '':
            args.send( res );
            break;
        case 'msg':
            args.directreply( res );
            break;
        default:
            args.reply( res );
        }
    };

    function extractPattern () {
        var matches = replyPatterns.exec( command.output ) || [ , 'user' ],
            pattern =  matches[ 1 ];

        return pattern.slice(1, -1);
    }
}

//return a truthy value (an error message) if it's invalid, falsy if it's
// valid
function checkCommand ( cmd ) {
    var somethingUndefined = Object.keys( cmd ).some(function ( key ) {
        return !cmd[ key ];
    }),
        error;

    if ( somethingUndefined ) {
        error = 'Illegal `/learn` object; see `/help learn`';
    }
    //not very possible, I know, but...uh...yes. definitely. I agree. spot on,
    // Mr. Pips.
    else if ( /\s/.test(cmd.name) ) {
        error = 'Invalid command name';
    }
    else if ( !canWriteTo(cmd.name) ) {
        error = 'Command ' + cmd.name + ' already exists';
    }
    else if ( onlyReply.test(cmd.output) ) {
        error = 'Please enter some output';
    }

    return error;

    function canWriteTo ( name ) {
        if ( !bot.commandExists(name) ) {
            return true;
        }

        //if the command was learned up to 5 minutes ago, allow overwriting it
        var alt = bot.getCommand( name );
        return alt.learned &&
            ( alt.date.getTime() + 1000 * 60 * 5 ) > Date.now();
    }
}

function loadCommands () {
    Object.iterate( storage, teach );

    function teach ( key, cmd ) {
        if ( cmd.charAt ) {
            cmd = JSON.parse( cmd );
        }

        cmd.input = turnToRegexp( cmd.input );
        cmd.date = new Date( Date.parse(cmd.date) );

        addCustomCommand( cmd );
    }

    //input: strung regexp, e.g. /abc/i
    //return: regexp
    //algo: we split by /.
    //  the first item is empty, the part before the first /
    //  the second to second-before-last are the regexp body. there will be more
    //    than one item in that range if the regexp contained escaped slashes,
    //    like /abc\/def/
    //  the last item is the flags (or the empty string, if no flags are set)
    function turnToRegexp ( input ) {
        var parts = input.toString().split( '/' );
        return new RegExp(
            parts.slice( 1, -1 ).join( '/' ), //to compensate for escaped /
            parts[ parts.length-1 ]
        );
    }
}
function saveCommand ( command ) {
    //h4x in source/util.js defines RegExp.prototype.toJSON so we don't worry
    // about the input regexp stringifying
    storage[ command.name ] = command;
    bot.memory.save( 'learn' );
}
function deleteCommand ( name ) {
    delete storage[ name ];
    bot.memory.save( 'learn' );
}

bot.addCommand({
    name : 'learn',
    fun  : learn,
    privileges : {
        del : 'NONE'
    },

    description : 'Teaches me a command. ' +
        '`/learn cmdName outputPattern [inputRegex [description]]`'
});

loadCommands();

};
