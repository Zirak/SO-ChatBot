module.exports = function (bot) {
var specParts = require('static/specParts.json');

function spec ( args ) {
    var lookup = args.content.toLowerCase(), matches;

    matches = specParts.filter( hasLookup ).map( mapLink );

    bot.log( matches, '/spec done' );
    if ( !matches.length ) {
        return args + ' not found in spec';
    }
    return matches.join( ', ' );

    function hasLookup ( obj ) {
        return obj.name.toLowerCase().indexOf( lookup ) > -1;
    }
    function mapLink ( obj ) {
        var name = args.escape( obj.name );
        return '[' + name + '](http://es5.github.com/#' + obj.section + ')';
    }
}

bot.addCommand({
    name : 'spec',
    fun : spec,
    permissions : {
        del : 'NONE'
    },
    description : 'Find a section in the ES5 spec'
});
};
