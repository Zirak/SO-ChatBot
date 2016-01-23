module.exports = function (bot) {
var baseURL = 'http://api.jquery.com/';

function jquery ( args ) {
    if ( !args.content ) {
        return baseURL;
    }

    //check to see if more than one thing is requested
    var parsed = args.parse( true );
    if ( parsed.length > 1 ) {
        return parsed.map( jquery ).join( ' ' );
    }

    var props = args.trim().replace( /^\$/, 'jQuery' ),

    parts = props.split( '.' ), exists = false,
    url = props, msg;
    //parts will contain two likely components, depending on the input
    // jQuery.fn.prop -  parts[0] = jQuery, parts[1] = prop
    // jQuery.prop    -  parts[0] = jQuery, parts[1] = prop
    // prop           -  parts[0] = prop
    //
    //jQuery API urls works like this:
    // if it's on the jQuery object, then the url is /jQuery.property
    // if it's on the proto, then the url is /property
    //
    //so, the mapping goes like this:
    // jQuery.fn.prop => prop
    // jQuery.prop    => jQuery.prop if it's on jQuery
    // prop           => prop if it's on jQuery.prototype,
    //                     jQuery.prop if it's on jQuery

    bot.log( props, parts, '/jquery input' );

    //user gave something like jQuery.fn.prop, turn that to just prop
    // jQuery.fn.prop => prop
    if ( parts.length === 3 ) {
        parts = [ parts[2] ];
    }

    //check to see if it's a property on the jQuery object itself
    // jQuery.prop => jQuery.prop
    if ( parts[0] === 'jQuery' && jQuery[parts[1]] ) {
        exists = true;
    }

    //user wants something on the prototype?
    // prop => prop
    else if ( parts.length === 1 && jQuery.prototype[parts[0]] ) {
        url = parts[ 0 ];
        exists = true;
    }

    //user just wanted a property? maybe.
    // prop => jQuery.prop
    else if ( jQuery[parts[0]] ) {
        url = 'jQuery.' + parts[0];
        exists = true;
    }

    if ( exists ) {
        msg = baseURL + url;
    }
    else {
        msg = baseURL + '?s=' + encodeURIComponent( args );
    }
    bot.log( msg, '/jquery link' );

    return msg;
}

bot.addCommand({
    name : 'jquery',
    fun : jquery,

    permissions : { del : 'NONE', use : 'ALL' },
    description : 'Fetches documentation link from jQuery API. `/jquery what`'
});

};
