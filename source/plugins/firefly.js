//listener to help decide which Firefly episode to watch
module.exports = function (bot) {
bot.listen( /(which |what |give me a )?firefly( episode)?/i, function ( msg ) {
    var names = ["Serenity", "The Train Job", "Bushwhacked", "Shindig", "Safe", "Our Mrs. Reynolds", "Jaynestown", "Out of Gas", "Ariel", "War Stories", "Trash", "The Message", "Heart of Gold", "Objects in Space"];

    //no mention of episode, 5% chance of getting the movie
    if ( msg.indexOf('episode') === -1 && Math.random() < 0.05 ) {
        return 'Serenity (movie)';
    }

    var r = Math.floor(Math.random() * 14);
    return 'Episode {0} - {1}'.supplant(r + 1, names[r]);
});
};
