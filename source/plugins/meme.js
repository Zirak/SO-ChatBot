module.exports = function (bot) {
// #151: Listen for meme image names and reply with that meme.

var urlBase = 'http://cdn.alltheragefaces.com/img/faces/png/',
    extension = 'png';

var memes = {
    deskflip : 'angry-desk-flip',
    fuu : 'rage-classic',
    iseewhatyoudidthere : 'happy-i-see-what-you-did-there-(clean)',
    no : 'angry-no',
    notbad : 'obama-not-bad',
    ohyou : 'happy-oh-stop-it-you',
    okay : 'okay-okay-clean',
    troll : 'troll-troll-face',
    trollface : 'troll-troll-face',
    youdontsay : 'misc-you-dont-say',
};

// ^(deskflip|no|notbad|...)\.(jpe?g|png)$
var re = new RegExp(
    '^(' +
        Object.keys( memes ).map( RegExp.escape ).join( '|' ) +
    ')\\.(jpe?g|png)$' );

bot.IO.register( 'input', function meme ( msgObj ) {
    var msg = msgObj.content.toLowerCase(),
        parts = re.exec( msg );

    if ( !parts ) {
        return;
    }

    var reply = getMemeLink( parts[1] );

    bot.adapter.out.add(
        bot.adapter.directreply( msgObj.message_id ) + ' ' +
            reply, msgObj.room_id );
});

bot.addCommand({
    name : 'meme',
    fun : function ( args ) {
        var name = args.replace( /\.\w+$/, '' );

        if ( !name || name === 'list' ) {
            return Object.keys( memes ).join( ', ' );
        }
        else if ( !memes.hasOwnProperty(name) ) {
            return 'Sorry, I don\'t know that one.';
        }

        args.directreply( getMemeLink(name) );
    },
    permissions : { del : 'NONE' },
    description : 'Return a simple meme link. Pass no arguments or `list` to ' +
        'get a list of known memes. `/meme [memeName]`.'
});

function getMemeLink ( meme ) {
    return urlBase + memes[ meme ] + '.' + extension;
}

};
