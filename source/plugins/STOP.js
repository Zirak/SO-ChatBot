module.exports = function (bot) {
"use strict";

var hammers = {
    STOP  : 'HAMMERTIME!',
    STAHP : 'HAMMAHTIME!',
    HALT  : 'HAMMERZEIT!',
    STOY  : 'ZABIVAT\' VREMYA!',
    SISTITE: 'MALLEUS TEMPUS!'
};

// /(STOP|STAHP|...)[\.!\?]?$/
var re = new RegExp(
    '(' +
        Object.keys(hammers).map(RegExp.escape).join('|') +
        ')[\\.!?]?$' );

bot.IO.register( 'input', function STOP ( msgObj ) {
    var sentence = msgObj.content.toUpperCase(),
        res = re.exec( sentence );

    if ( res ) {
        bot.adapter.out.add( hammers[res[1]], msgObj.room_id );
    }
});

};
