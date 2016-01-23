/*global exports*/

//some sort of pseudo constructor
exports.Command = function ( cmd ) {
    var bot = this;

    cmd.name = cmd.name.toLowerCase();
    cmd.thisArg = cmd.thisArg || cmd;

    cmd.permissions = cmd.permissions || {};
    cmd.permissions.use = cmd.permissions.use || 'ALL';
    cmd.permissions.del = cmd.permissions.del || 'NONE';

    cmd.description = cmd.description || '';
    cmd.creator = cmd.creator || 'God';

    //make canUse and canDel
    [ 'Use', 'Del' ].forEach(function ( perm ) {
        var low = perm.toLowerCase();

        cmd[ 'can' + perm ] = function ( usrid ) {
            var canDo = this.permissions[ low ];

            if ( canDo === 'ALL' ) {
                return true;
            }
            else if ( canDo === 'NONE' ) {
                return false;
            }
            else if ( bot.isOwner(usrid) ) {
                return true;
            }

            return canDo.indexOf( usrid ) > -1;
        };
    });

    cmd.exec = function () {
        return this.fun.apply( this.thisArg, arguments );
    };

    cmd.del = function () {
        bot.info.forgotten += 1;
        delete bot.commands[ cmd.name ];
        bot.commandDictionary.trie.del(cmd.name);
    };

    return cmd;
};

//a normally priviliged command which can be executed if enough people use it
exports.CommunityCommand = function ( command, req ) {
    var bot = this;

    var cmd = this.Command( command ),
        used = {},
        old_execute = cmd.exec,
        old_canUse  = cmd.canUse;

    var pendingMessage = command.pendingMessage ||
            'Already registered; still need {0} more';
    console.log( command.pendingMessage, pendingMessage );
    req = req || 2;

    cmd.canUse = function () {
        return true;
    };
    cmd.exec = function ( msg ) {
        var err = register( msg.get('user_id') );
        if ( err ) {
            bot.log( err );
            return err;
        }

        used = {};

        return old_execute.apply( cmd, arguments );
    };

    return cmd;

    //once again, a switched return statement: truthy means a message, falsy
    // means to go on ahead
    function register ( usrid ) {
        if ( old_canUse.call(cmd, usrid) ) {
            return false;
        }

        clean();
        var count = Object.keys( used ).length,
            needed = req - count;
        bot.log( used, count, req );

        if ( usrid in used ) {
            return 'Already registered; still need {0} more'.supplant( needed );
        }

        used[ usrid ] = new Date();
        needed -= 1;

        if ( needed > 0 ) {
            return pendingMessage.supplant( needed );
        }

        bot.log( 'should execute' );
        return false; //huzzah!
    }

    function clean () {
        var tenMinsAgo = new Date();
        tenMinsAgo.setMinutes( tenMinsAgo.getMinutes() - 10 );

        Object.keys( used ).reduce( rm, used );
        function rm ( ret, key ) {
            if ( ret[key] < tenMinsAgo ) {
                delete ret[ key ];
            }
            return ret;
        }
    }
};
