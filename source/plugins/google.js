module.exports = function (bot) {

var nulls = [
    'The Google contains no such knowledge',
    'There are no search results. Run.',
    'My Google Fu has failed.' ];

var command = {
    name : 'google',

    fun : function ( msg, cb ) {
        var self = this;

        this.logic( msg, finishedLogic );

        function finishedLogic ( obj ) {
            var res = self.format( obj );

            if ( cb && cb.call ) {
                cb( res );
            }
            else {
                msg.directreply( res );
            }
        }
    },

    logic : function ( query, cb ) {
        bot.IO.jsonp.google( String(query) + ' -site:w3schools.com', finishCall );

        function finishCall ( resp ) {
            bot.log( resp, '/google response' );
            if ( resp.responseStatus !== 200 ) {
                finish( 'My Google-Fu is on vacation; status ' +
                        resp.responseStatus );
                return;
            }

            //TODO: change hard limit to argument
            var results = resp.responseData.results.slice( 0, 3 );
            results.query = query;
            bot.log( results, '/google results' );

            cb( results );
        }
    },

    format : function format ( results ) {
        if ( !results.length ) {
            return nulls.random();
        }

        var res = formatLink( results.query ) + ' ' +
            results.map( formatResult ).join( ' ; ' );

        if ( res.length > bot.adapter.maxLineLength ) {
            res = results.pluck( 'unescapedUrl' ).join( ' ; ' );
        }

        return res;

        function formatResult ( result ) {
            var title = bot.IO.decodehtmlEntities( result.titleNoFormatting );
            return bot.adapter.link( title, result.unescapedUrl );
        }
        function formatLink ( query ) {
            var link =
                'http://google.com/search?q=' + encodeURIComponent( query );

            return bot.adapter.link( '*', link );
        }
    },

    permissions : {
        del : 'NONE'
    },
    description : 'Search Google. `/google query`',
    async : true
};

bot.addCommand( command );
};
