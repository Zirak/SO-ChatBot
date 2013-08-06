(function () {
var findCommand = function ( args ) {
    var input = args.toString().toLowerCase(),
        ret = '';

    var cmd = bot.getCommand( input ),
        guesses = cmd.guesses;

    if ( !guesses ) {
        ret += 'Exact match: ' + cmd.name + '. ';

        bot.commandDictionary.maxCost = Math.floor( input.length / 3 + 1 );
        guesses = bot.commandDictionary.search( input ).filter(function ( n ) {
            return n !== cmd.name;
        });
    }

    if ( guesses && guesses.length ) {
        ret += 'Close matches: ' + guesses.join( ', ' ) + '. ';
    }

    //now that we've checked the names, we should check descriptions
    var loose =
        Object.keys( bot.commands )
        .filter(function findCommandMatchDesc ( name ) {
            var match = bot.commands[ name ]
                .description.toLowerCase().indexOf( input ) > -1;

            return match &&
                name.toLowerCase() !== input &&
                guesses.indexOf( name ) < 0;
        });

    if ( loose.length ) {
        ret += 'Loose matches: ' + loose.join( ', ' );
    }

    //we have an exact match, wihout any close or loose matches
    if ( !cmd.error && !guesses.length && !loose.length ) {
        ret = cmd.name + ': ' + cmd.description;
    }

    if ( !ret ) {
        ret = 'I know nothing of it.';
    }

    return ret.trim();
};

bot.addCommand({
    name : 'findCommand',
    fun : findCommand,
    permissions : {
        del : 'NONE'
    },
    description : 'Searches for a bot command matching part of a ' +
        'name/description. `/findCommand partOfNameOrDescription`'
});
})();
