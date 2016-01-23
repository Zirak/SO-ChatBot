module.exports = function (bot) {

//only activate for SO room 17; TODO consider changing if well accepted
if (bot.adapter.site !== 'stackoverflow' || bot.adapter.roomid !== 17) {
    bot.log('Not activating unformatted code checking; not in right room/site');
    return;
}

var badMessages = new Map();

bot.IO.register( 'rawinput', function checkUnformattedCode (msgObj) {
    var msgid = msgObj.message_id;

    //only handle new messages and edits
    if (msgObj.event_type !== 1 && msgObj.event_type !== 2) {
        return;
    }

    //so far it should only apply to the js room
    if ( msgObj.room_id !== 17 ) {
        return;
    }

    //don't bother with owners
    if ( bot.isOwner(msgObj.user_id) ) {
        return;
    }

    //and only look at multiline messages
    if ( !msgObj.content.startsWith('<div class=\'full\'>') ) {
        potentiallyUnlecture();
        return;
    }

    var content = bot.adapter.in.breakMultilineMessage( msgObj.content )
            .map(function (line) {
                //for some reason, chat adds a space prefix for every line...
                return line.replace(/^ /, '');
            }).join( '\n' );
    content = IO.decodehtmlEntities(content);

    //and messages which aren't code blocks
    if ( content.startsWith('<pre class=\'full\'>') ) {
        potentiallyUnlecture();
        return;
    }

    var isANaughtyMessage = hasUnformattedCode( content );

    if ( !isANaughtyMessage ) {
        potentiallyUnlecture();
        return;
    }

    bot.log( '[formatting] Message {0} is a naughty one'.supplant(msgid) );
    var lectureTimeout = setTimeout( lectureUser, 10000, msgObj, content );
    badMessages.set( msgid, lectureTimeout );

    function potentiallyUnlecture () {
        if ( badMessages.has(msgid) ) {
            bot.log( '[formatting] Message {0} was fixed'.supplant(msgid) );
            clearTimeout( badMessages.get(msgid) );
            badMessages.delete( msgid );
        }
    }
});

function lectureUser ( msgObj, content ) {
    var user = bot.users[ msgObj.user_id ],
        msgid = msgObj.message_id;

    bot.log( '[formatting] Lecturing user ' + msgObj.user_name );
    bot.adapter.out.add(
        bot.adapter.reply( msgObj.user_name ) + ' ' + createLecture( content )
    );

    if ( user && user.reputation < 2000 ) {
        bot.log( '[formatting] Binning offending message' );
        bot.adapter.moveMessage( msgid, msgObj.room_id, 23262 );
    }
}

function createLecture ( content ) {
    var lineCount = content.split('\n').length;

    var lecture = (
        'Please don\'t post unformatted code - ' +
        'hit Ctrl+K before sending, use up-arrow to edit messages, ' +
        'and see the {0}.'
    ).supplant( bot.adapter.link('faq', '/faq') );

    if ( lineCount >= 10 ) {
        lecture += ' For posting large code blocks, use a paste site like ' +
            'https://gist.github.com, http://hastebin.com or http://pastie.org';
    }

    return lecture;
}

function hasUnformattedCode ( text ) {
    var lines = text.split( '\n' );
    if ( lines.length < 4 ) {
        return false;
    }

    var codeyLine = /^\}|^<\//;
    return lines.some( / /.test.bind(codeyLine) );
}

};
