module.exports = function (bot) {

//collection of nudges; msgObj, time left and the message itself
var nudges = [],
    id = 0,
    interval = 100 * 60;

function update () {
    var now = Date.now();
    nudges = nudges.filter(function ( nudge ) {
        nudge.time -= interval;

        if ( nudge.time <= 0 ) {
            sendNudge( nudge );
            return false;
        }
        return true;
    });

    setTimeout( update, interval );
}
function sendNudge ( nudge ) {
    bot.log( nudge, 'nudge fire' );
    //check to see if the nudge was sent after a bigger delay than expected
    //TODO: that ^
    nudge.msg.reply( nudge.message );
}
setTimeout( update, interval );

//now for the command itself
function addNudge ( delay, message, msgObj ) {
    var inMS;
    bot.log( delay, message, '/nudge input' );

    //interval will be one of these (where n is a number):
    // nm  =>  n minutes
    // n   =>  n minutes
    //so erm...yeah. just parse the bitch
    delay = parseFloat( delay );
    //minsInMs = mins * 60 * 1000
    //TODO: allow more than just minutes
    //TODO: upper cap
    inMS = delay * 60000;

    if ( isNaN(inMS) ) {
        return 'Many things can be labeled Not a Number; a delay should not' +
            ' be one of them.';
    }

    //let's put an arbitrary comment here

    id += 1;
    var nudge = {
        msg     : msgObj,
        message : '*nudge* ' + message,
        register: Date.now(),
        time    : inMS,
        id : id
    };
    nudges.push( nudge );
    bot.log( nudge, nudges, '/nudge register' );

    return 'Nudge #' + id + ' registered.';
}
function removeNudge ( id, msgObj ) {
    var matching, index;

    nudges.some(function ( nudge, idx ) {
        if (nudge.id === id) {
            matching = nudge;
            index = idx;
            return true;
        }
    });

    if ( !matching ) {
        return [
            'Nudge not found. Maybe it was already triggered, or this is ' +
                'a parallal universe.',
            'I looked for nudge #' + id + ', but all I found was this goat.'
        ].random();
    }

    if ( matching.msg.get('user_name') !== msgObj.get('user_name') ) {
        return 'It\'s not nice to try and remove a nudge which ain\'t yours';
    }

    bot.log( nudges[index], '/nudge remove #' + id );
    nudges.splice( index, 1 );
    return 'Nudge annhiliated';
}

bot.addCommand({
    name : 'nudge',
    fun  : nudgeCommand,
    permissions : {
        del : 'NONE'
    },

    description : 'Register a nudge after an interval. ' +
        '`/nudge intervalInMinutes message`, `/nudge remove id` to remove, ' +
        'or the listener, ' +
        '`nudge|remind|poke me? in? intervalInMinutes message`',
    unTellable : true
});

bot.listen(/(?:nudge|remind|poke)\s(?:me\s)?(?:in\s)?(\d+m?)\s?(.*)$/,
    nudgeListener
);

function nudgeCommand ( args ) {
    var props = args.parse(),
        lead = props[ 0 ],
        rest = props.slice( 1 ).join( ' ' );

    if ( lead === 'remove' ) {
        return removeNudge( Number(props[1]), args );
    }
    return addNudge( lead, rest, args );
}
function nudgeListener ( args ) {
    return addNudge( args.matches[1], args.matches[2], args );
}

};
