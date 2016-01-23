module.exports = function (bot) {
"use strict";

var unexisto = 'User {0} was not found in room {1} (sorry, mustache only ' +
        'works there).';

function mustachify ( args ) {
    var props = parseArgs( args ),
        usrid = props.usrid;
    bot.log( props, '/mustache input' );

    //check for url passing
    if ( linkCheck(usrid) ) {
        finish( encodeURIComponent(usrid) );
        return;
    }

    if ( !usrid ) {
        usrid = args.get( 'user_id' );
    }
    else if ( /\D/.test(usrid) ) {
        usrid = args.findUserId( usrid );
    }

    bot.log( usrid, '/mustache mapped' );

    if ( !bot.users.hasOwnProperty(usrid) ) {
        return unexisto.supplant( usrid, bot.adapter.roomid );
    }
    else if ( Number(usrid) === bot.adapter.user_id ) {
        return [
            'Nobody puts a mustache on me. Again.',
            'Mustache me once, shame on you. Mustache me ---twice--- 9 times...'
        ].random();
    }

    var hash = bot.users[ usrid ].email_hash;
    //SO now allows non-gravatar images. the email_hash will be a link to the
    // image in that case, prepended with a ! for some reason
    if ( hash[0] === '!' ) {
        finish( encodeURIComponent(hash.slice(1)) + '#.png' );
    }
    else {
        finish(
            'http%3A%2F%2Fwww.gravatar.com%2Favatar%2F{0}%3Fs%3D256%26d%3Didenticon#.png'.supplant(hash) );
    }

    function finish ( src ) {
        bot.log( src, '/mustache finish' );

        args.directreply(
            'http://mustachify.me/' + props.mustache + '?src=' + src );
    }

    function parseArgs ( args ) {
        var parts = args.parse(),
            last = parts.pop(),
            ret = {};

        // /mustache usrid mustache
        // /mustache user-name mustache
        //we've already `.pop`ed the mustache part, so we need to account for it
        if ( parts.length > 0 && !(/\D/).test(last) ) {
            ret.usrid = parts.join( ' ' );
            ret.mustache = last;
        }
        // /mustache usrid
        else {
            ret.usrid = args.content;
            ret.mustache = Math.rand(0, 5);
        }

        return ret;
    }
}

function linkCheck ( suspect ) {
    return suspect.startsWith( 'http' ) || suspect.startsWith( 'www' );
}

var cmd = {
    name : 'mustache',
    fun : mustachify,
    privileges : {
        del : 'NONE'
    },

    description : 'Mustachifies a user. ' +
        '`/mustache [link|usrid|username] [mustache=rand(0,5)]`'
};

bot.addCommand( cmd );

// #176, alias moustache to mustache
var moustache = Object.merge( cmd, { name : 'moustache' });
bot.addCommand( moustache );

};
