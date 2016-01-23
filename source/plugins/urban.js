module.exports = function (bot) {

var cache = {};

function urban ( args, cb ) {
    if ( cache[args] ) {
        return finish( cache[args] );
    }

    var parts = args.parse(),
        query, resultIndex;

    if ( !parts.length ) {
        return 'Y U NO PROVIDE ARGUMENTS!?';
    }

    // /urban query in several words
    if ( isNaN(parts[1]) ) {
        bot.log( '/urban input isNaN' );
        query = args.toString();
        resultIndex = 0;
    }
    // /urban query index
    else {
        bot.log( '/urban input isn\'t NaN' );
        query = parts[ 0 ];
        resultIndex = Number( parts[1] );
    }

    bot.log( query, resultIndex, '/urban input' );

    bot.IO.jsonp({
        url : 'http://api.urbandictionary.com/v0/define',
        data : {
            term : query
        },
        jsonpName : 'callback',
        fun : complete
    });

    function complete ( resp ) {
        var msg;

        if ( resp.result_type === 'no_results' ) {
            msg = 'No definition found for ' + query;
        }
        else if ( resultIndex > resp.list.length ) {
            msg = 'Nothing in that index. The last one is:\n' +
                formatTop( resp.list.pop() );
        }
        else {
            msg = formatTop( resp.list[resultIndex] );
        }

        //truncate the message if it's too long. yes, this creates a problem
        // with formatted messages. yes, we take extra leeway. shut up.
        if ( msg.length > 500 ) {
            msg = msg.slice( 0, 450 ) + '(snip)';
        }
        cache[ args ] = msg;

        finish( msg );
    }

    function finish ( def ) {
        if ( cb && cb.call ) {
            cb( def );
        }
        else {
            args.reply( def );
        }
    }

    function formatTop ( top ) {
        //replace [tag] in definition with links
        var def = top.definition.replace( /\[([^\]]+)\]/g, formatTag );

        return args.link( top.word, top.permalink ) + ' ' + def;
    }
    function formatTag ( $0, $1 ) {
        var href =
            'http://urbandictionary.com/define.php?term=' +
            encodeURIComponent( $1 );

        return args.link( $0, href );
    }
}

bot.addCommand({
    name : 'urban',
    fun : urban,

    permissions : { del : 'NONE', use : 'ALL' },

    description : 'Fetches UrbanDictionary definition. ' +
        '`/urban query [resultIndex=0]`',
    async : true
});

};
