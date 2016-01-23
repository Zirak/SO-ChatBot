module.exports = function (bot) {
var re = /(which |what |give me a )?stargate|sg1( episode)?/i;

var episodes = require('static/stargate.json');

var selectStargateEpisode = function ( msg ) {
    //no mention of episode, 5% chance of getting the movie
    if ( msg.indexOf('episode') === -1 && Math.random() < 0.05 ) {
        return 'Stargate (movie)';
    }

    var select = function ( arr ) {
        var i = Math.rand( arr.length - 1 );

        return {
            value : arr[i],
            index : i
        };
    };

    var season  = select( Object.keys(episodes.SG1) ),
        episode = select( episodes.SG1[season.value] );

    var data = {
        season  : season.value,
        index   : episode.index + 1,
        episode : episode.value
    };


    return '{season} episode #{index} - {episode}'.supplant( data );
};

bot.listen( re, selectStargateEpisode );
};
