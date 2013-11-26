(function () {
    // This is a proxy to add padding to a JSON API
    // See: https://github.com/shea-sollars/sap
    var requestURI = 'http://www.lobby.ws/api/sap.js';

    bot.addCommand({
        async : true,
        description : 'Check domain availability',
        fun : checkDomain,
        name : 'domain',
        permissions : {
            del : 'NONE'
        }
    });

    function checkDomain ( msgObj, cb ) {
        IO.jsonp({
            data : {
                domain : msgObj.content
            },
            url : requestURI,
            fun : reportResult,
            jsonpName : 'cb'
        });

        /* expect respObj to be:
            {
                status : "error" || "success"
            ,    status_desc : "Error message" (if status == error)
            ,    domain : "Domain in question" || null (possibly if error)
            ,    available : true || false || null (possibly if error)
            }
        */
        function reportResult ( respObj ) {
            var respMsg;

            if ( !respObj.hasOwnProperty('status') || respObj.status !== 'success' ) {
                respMsg = 'An error occured';

                if ( respObj.hasOwnProperty('status_desc') ) {
                    respMsg += '; ' + respObj.status_desc;
                };
            }
            else {
                if ( !respObj.hasOwnProperty('domain') || !respObj.hasOwnProperty('available') ) {
                    respMsg = 'Something went wrong with that request. Try again.';
                }
                else {
                    respMsg = 'The domain ' + respObj.domain + ' ' +
                            ( respObj.available===true ? 'IS ' : 'is NOT ' ) +
                            'available';
                };
            };

            if ( cb && cb.call ) {
                cb( respMsg );
            }
            else {
                msgObj.reply( respMsg );
            };
        };
    };
}());
