module.exports = function (bot) {
var nulls = [
    'Video not found (rule 35?)',
    'I could not find such a video',
    'The Lords of YouTube did not find your query favorable' ];
function youtube ( args, cb ) {
    bot.IO.jsonp.google(
        args.toString() + ' site:youtube.com/watch', finishCall );

    function finishCall ( resp ) {
        if ( resp.responseStatus !== 200 ) {
            finish( 'Something went on fire; status ' + resp.responseStatus );
            return;
        }

        var result = resp.responseData.results[ 0 ];
        bot.log( result, '/youtube result' );

        if ( !result ) {
            finish( nulls.random() );
        }
        else {
            finish( decodeURIComponent(result.url) );
        }
    }

    function finish ( res ) {
        if ( cb && cb.call ) {
            cb( res );
        }
        else {
            args.directreply( res );
        }
    }
}

bot.addCommand({
    name : 'youtube',
    fun : youtube,
    permissions : {
        del : 'NONE'
    },
    description : 'Search Youtube. `/youtube query`',
    async : true
});
};
