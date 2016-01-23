module.exports = function (bot) {
//Gets or sets a XKCD comic-type thing
//just kidding! we can't set one. I'm just used to crappy javadoc style.
//*sniffle*

function getXKCD( args, cb ) {
    var prop = ( args.parse()[0] || '' ).toLowerCase(),
        linkBase = 'http://xkcd.com/';

    //they want a specifix xkcd
    if ( /^\d+$/.test(prop) ) {
        bot.log( '/xkcd specific', prop );
        finish( linkBase + prop );
        return;
    }
    //they want to search for a certain comic
    else if ( prop && prop !== 'new' ) {
        bot.log( '/xkcd search', args.toString() );
        bot.IO.jsonp.google(
            args.toString() + ' site:xkcd.com -forums.xkcd -m.xkcd -fora.xkcd',
            finishGoogleQuery );
        return;
    }

    bot.log( '/xkcd random/latest', prop );
    //they want a random XKCD, or the latest
    bot.IO.jsonp({
        url : 'http://dynamic.xkcd.com/api-0/jsonp/comic',
        jsonpName : 'callback',
        fun : finishXKCD
    });

    function finishXKCD ( resp ) {
        var maxID = resp.num;

        if ( !prop ) {
            finish( linkBase + Math.rand(1, maxID) );
        }
        else if ( prop === 'new' ) {
            finish( linkBase + maxID );
        }
    }
    function finishGoogleQuery ( resp ) {
        if ( resp.responseStatus !== 200 ) {
            finish( 'Something went on fire; status ' + resp.responseStatus );
            return;
        }

        var results = resp.responseData.results;
        if ( !results.length ) {
            finish( 'Seems like you hallucinated this comic' );
            return;
        }

        var result = results[ 0 ],
            answer = result.url,
            matches = /xkcd.com\/(\d+)/.exec( answer );

        if ( !matches ) {
            answer = 'Search didn\'t yield a comic; got ' + result.unescapedUrl;
        }

        finish( answer );
    }

    function finish( res ) {
        bot.log( res, '/xkcd finish' );

        // because chat does not onebox https xkcd links
        res = res.replace( /^https:/, 'http:' );

        if ( cb && cb.call ) {
            cb( res );
        }
        else {
            args.directreply( res );
        }
    }
}

bot.addCommand({
    name : 'xkcd',
    fun : getXKCD,
    permissions : {
        del : 'NONE'
    },
    description : 'Returns an XKCD. Call with no args for random, ' +
        '`new` for latest, or a number for a specific one.',
    async : true
});

};
