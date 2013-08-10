IO.register( 'rawinput', function spamDetection ( msgObj ) {
    //ignore it if it's not a new message
    if ( msgObj.event_type !== 1 || msgObj.room_id !== bot.adapter.roomid ) {
        return;
    }

    var usrid = msgObj.user_id;
    //there is a heavy assumption that all users who post a message here have
    // been registered by the bot
    var user = bot.users[ usrid ];
    //since it's still in testing, it's rigged to respond to me (Zirak, 617762)
    if ( usrid !== 617762 && (bot.isOwner(usrid) || user.reputation > 1000) ) {
        return;
    }

    //this is very yucky. we do raw html comparison.
    //shut up...
    var query = '#chat .monologue.user-{0} .content'.supplant( usrid ),
        userMessages = document.querySelectorAll( query );

    var exactMatches = Array.filter( userMessages, function ( content ) {
        var msgid = ( /\d+/ ).exec( content.parentNode.id )[ 0 ];
        return msgid < msgObj.message_id &&
            content.innerHTML === msgObj.content;
    });

    if ( !exactMatches.length ) {
        return;
    }
    bot.log( exactMatches, msgObj.content, 'spam detection matches' );

    var reply = 'Please don\'t post the same thing more than once in a short ' +
        'period of time. If it\'s a question, try again in a few hours.';

    bot.adapter.out.add(
        bot.adapter.reply(msgObj.user_name) + " " + reply,
        msgObj.room_id );
});
