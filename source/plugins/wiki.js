module.exports = function (bot) {
"use strict";

function command ( args, cb ) {
    bot.IO.jsonp({
        url : 'http://en.wikipedia.org/w/api.php',
        jsonpName : 'callback',
        data : {
            action : 'opensearch',
            search : args.toString(),
            limit : 1,
            format : 'json'
        },
        fun : finish
    });

    function finish ( resp ) {
        //the result will look like this:
        // [search_term, [title0], [description0], [link0]]
        //we only asked for one result, so the inner arrays will have only 1 item each
        var res = resp[ 3 ][ 0 ],
            base = 'http://en.wikipedia.org/wiki/',
            found = true;

        if ( !res ) {
            found = false;
            res = [
                'No result found',
                'The Wikipedia contains no knowledge of such a thing',
                'The Gods of Wikipedia did not bless us'
            ].random();
        }

        if ( cb && cb.call ) {
            cb( res );
        }
        else if ( found ){
            args.directreply( res );
        }
        else {
            args.reply( res );
        }
    }
}

bot.addCommand({
    name : 'wiki',
    fun : command,
    permissions : {
        del : 'NONE'
    },

    description : 'Search Wikipedia. `/wiki term`',
    async : true
});
};
