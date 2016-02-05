(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global exports*/

//some sort of pseudo constructor
exports.Command = function ( cmd ) {
    var bot = this;

    cmd.name = cmd.name.toLowerCase();
    cmd.thisArg = cmd.thisArg || cmd;

    cmd.permissions = cmd.permissions || {};
    cmd.permissions.use = cmd.permissions.use || 'ALL';
    cmd.permissions.del = cmd.permissions.del || 'NONE';

    cmd.description = cmd.description || '';
    cmd.creator = cmd.creator || 'God';

    //make canUse and canDel
    [ 'Use', 'Del' ].forEach(function ( perm ) {
        var low = perm.toLowerCase();

        cmd[ 'can' + perm ] = function ( usrid ) {
            var canDo = this.permissions[ low ];

            if ( canDo === 'ALL' ) {
                return true;
            }
            else if ( canDo === 'NONE' ) {
                return false;
            }
            else if ( bot.isOwner(usrid) ) {
                return true;
            }

            return canDo.indexOf( usrid ) > -1;
        };
    });

    cmd.exec = function () {
        return this.fun.apply( this.thisArg, arguments );
    };

    cmd.del = function () {
        bot.info.forgotten += 1;
        delete bot.commands[ cmd.name ];
        bot.commandDictionary.trie.del(cmd.name);
    };

    return cmd;
};

//a normally priviliged command which can be executed if enough people use it
exports.CommunityCommand = function ( command, req ) {
    var bot = this;

    var cmd = this.Command( command ),
        used = {},
        old_execute = cmd.exec,
        old_canUse  = cmd.canUse;

    var pendingMessage = command.pendingMessage ||
            'Already registered; still need {0} more';
    console.log( command.pendingMessage, pendingMessage );
    req = req || 2;

    cmd.canUse = function () {
        return true;
    };
    cmd.exec = function ( msg ) {
        var err = register( msg.get('user_id') );
        if ( err ) {
            bot.log( err );
            return err;
        }

        used = {};

        return old_execute.apply( cmd, arguments );
    };

    return cmd;

    //once again, a switched return statement: truthy means a message, falsy
    // means to go on ahead
    function register ( usrid ) {
        if ( old_canUse.call(cmd, usrid) ) {
            return false;
        }

        clean();
        var count = Object.keys( used ).length,
            needed = req - count;
        bot.log( used, count, req );

        if ( usrid in used ) {
            return 'Already registered; still need {0} more'.supplant( needed );
        }

        used[ usrid ] = new Date();
        needed -= 1;

        if ( needed > 0 ) {
            return pendingMessage.supplant( needed );
        }

        bot.log( 'should execute' );
        return false; //huzzah!
    }

    function clean () {
        var tenMinsAgo = new Date();
        tenMinsAgo.setMinutes( tenMinsAgo.getMinutes() - 10 );

        Object.keys( used ).reduce( rm, used );
        function rm ( ret, key ) {
            if ( ret[key] < tenMinsAgo ) {
                delete ret[ key ];
            }
            return ret;
        }
    }
};

},{}],2:[function(require,module,exports){
/*global module, require*/

var IO = window.IO = module.exports = {
    //event handling
    events : {},
    preventDefault : false,

    //register for an event
    register : function ( name, fun, thisArg ) {
        if ( !this.events[name] ) {
            this.events[ name ] = [];
        }
        this.events[ name ].push({
            fun : fun,
            thisArg : thisArg,
            args : Array.prototype.slice.call( arguments, 3 )
        });

        return this;
    },

    unregister : function ( name, fun ) {
        if ( !this.events[name] ) {
            return this;
        }

        this.events[ name ] = this.events[ name ].filter(function ( obj ) {
            return obj.fun !== fun;
        });

        return this;
    },

    //fire event!
    fire : function ( name ) {
        this.preventDefault = false;

        if ( !this.events[name] ) {
            return;
        }

        var args = Array.prototype.slice.call( arguments, 1 ),
            that = this;
        this.events[ name ].forEach( fireEvent );

        function fireEvent( evt ) {
            var call = evt.fun.apply( evt.thisArg, evt.args.concat(args) );

            that.preventDefault = call === false;
        }
    },

    urlstringify : (function () {
        //simple types, for which toString does the job
        //used in singularStringify
        var simplies = { number : true, string : true, boolean : true };

        var singularStringify = function ( thing ) {
            if ( typeof thing in simplies ) {
                return encodeURIComponent( thing.toString() );
            }
            return '';
        };

        var arrayStringify = function ( key, array ) {
            key = singularStringify( key );

            return array.map(function ( val ) {
                return pair( key, val, true );
            }).join( '&' );
        };

        //returns a key=value pair. pass in dontStringifyKey so that, well, the
        // key won't be stringified (used in arrayStringify)
        var pair = function ( key, val, dontStringifyKey ) {
            if ( !dontStringifyKey ) {
                key = singularStringify( key );
            }

            return key + '=' + singularStringify( val );
        };

        return function ( obj ) {

            return Object.keys( obj ).map(function ( key ) {
                var val = obj[ key ];

                if ( Array.isArray(val) ) {
                    return arrayStringify( key, val );
                }
                else {
                    return pair( key, val );
                }
            }).join( '&' );
        };
    }()),

    loadScript : function ( url, cb ) {
        var script = document.createElement( 'script' );
        script.src = url;
        script.onload = cb;

        document.head.appendChild( script );
    }
};

//turns some html tags into markdown. a major assumption is that the input is
// properly sanitised - that is, all <, &, etc entered by the user got turned
// into html entities.
IO.htmlToMarkdown = (function () {

// A string value is the delimiter (what replaces the tag)
var markdown = {
    i : '*',
    b : '**',
    strike : '---',
    code : '`',

    a : function ( $0, $1, text ) {
        var href = /href="([^"]+?)"/.exec( $0 );

        if ( !href ) {
            return $0;
        }
        return '[' + text + '](' + href[1] + ')';
    }
};
var htmlRe = /<(\S+)[^\>]*>([^<]+)<\/\1>/g;

return function ( html ) {
    var delim;

    return html.replace( htmlRe, decodeHtml );

    function decodeHtml ( $0, tag, text ) {
        if ( !markdown.hasOwnProperty(tag) ) {
            return $0;
        }

        delim = markdown[ tag ];

        return delim.apply ?
            markdown[ tag ].apply( markdown, arguments ) :
            delim + text + delim;
    }
};
}());

IO.decodehtmlEntities = (function () {
var entities = require('static/htmlEntities.json');

/*
  &       -all entities start with &
  (
   #      -charcode entities also have a #
   x?     -hex charcodes
  )?
  [\w;]   -now the entity (alphanumeric, separated by ;)
  +?      -capture em until there aint no more (don't get the trailing ;)
  ;       -trailing ;
*/
var entityRegex = /&(#x?)?[\w;]+?;/g;
var replaceEntities = function ( entities ) {
    //remove the & and split into each separate entity
    return entities.slice( 1 ).split( ';' ).map( decodeEntity ).join( '' );
};
var decodeEntity = function ( entity ) {
    if ( !entity ) {
        return '';
    }

    //starts with a #, it's charcode
    if ( entity[0] === '#' ) {
        return decodeCharcodeEntity( entity );
    }

    if ( !entities.hasOwnProperty(entity) ) {
        //I hate this so. so. so much. it's just wrong.
        return '&' + entity +';';
    }
    return entities[ entity ];
};
var decodeCharcodeEntity = function ( entity ) {
    //remove the # prefix
    entity = entity.slice( 1 );

    var cc;
    //hex entities
    if ( entity[0] === 'x' ) {
        cc = parseInt( entity.slice(1), 16 );
    }
    //decimal entities
    else {
        cc = parseInt( entity, 10 );
    }

    return String.fromCharCode( cc );
};

return function ( html ) {
    return html.replace( entityRegex, replaceEntities );
};
}());

//build IO.in and IO.out
[ 'in', 'out' ].forEach(function ( dir ) {
    var fullName = dir + 'put';

    IO[ dir ] = {
        buffer : [],

        receive : function ( obj ) {
            IO.fire( 'receive' + fullName, obj );

            if ( IO.preventDefault ) {
                return this;
            }

            this.buffer.push( obj );

            return this;
        },

        //unload the next item in the buffer
        tick : function () {
            if ( this.buffer.length ) {
                IO.fire( fullName, this.buffer.shift() );
            }

            return this;
        },

        //unload everything in the buffer
        flush : function () {
            IO.fire( 'before' + fullName );

            if ( !this.buffer.length ) {
                return this;
            }

            var i = this.buffer.length;
            while( i --> 0 ) {
                this.tick();
            }

            IO.fire( 'after' + fullName );

            this.buffer = [];
            return this;
        }
    };
});

IO.relativeUrlToAbsolute = function ( url ) {
    //the anchor's href *property* will always be absolute, unlike the href
    // *attribute*
    var a = document.createElement( 'a' );
    a.setAttribute( 'href', url );

    return a.href;
};

IO.injectScript = function ( url ) {
    var script = document.createElement( 'script' );
    script.src = url;

    document.head.appendChild( script );
    return script;
};

IO.xhr = function ( params ) {
    //merge in the defaults
    params = Object.merge({
        method   : 'GET',
        headers  : {},
        complete : function (){}
    }, params );

    params.headers = Object.merge({
        'Content-Type' : 'application/x-www-form-urlencoded'
    }, params.headers );

    //if the data is an object, and not a fakey String object, dress it up
    if ( typeof params.data === 'object' && !params.data.charAt ) {
        params.data = IO.urlstringify( params.data );
    }

    var xhr = new XMLHttpRequest();
    xhr.open( params.method, params.url );

    if ( params.document ) {
        xhr.responseType = 'document';
    }

    xhr.addEventListener( 'load', function () {
        params.complete.call(
            params.thisArg, xhr.response, xhr
        );
    });

    Object.iterate( params.headers, xhr.setRequestHeader.bind(xhr) );

    xhr.send( params.data );

    return xhr;
};

IO.jsonp = function ( opts ) {
    opts.data = opts.data || {};
    opts.jsonpName = opts.jsonpName || 'jsonp';

    var script = document.createElement( 'script' ),
        semiRandom;

    do {
        semiRandom = 'IO' + ( Date.now() * Math.ceil(Math.random()) );
    } while ( window[semiRandom] );

    //this is the callback function, called from the "jsonp file"
    window[ semiRandom ] = function () {
        opts.fun.apply( opts.thisArg, arguments );

        //cleanup
        delete window[ semiRandom ];
        script.parentNode.removeChild( script );
    };

    //add the jsonp parameter to the data we're sending
    opts.data[ opts.jsonpName ] = semiRandom;

    //start preparing the url to be sent
    if ( opts.url.indexOf('?') === -1 ) {
        opts.url += '?';
    }

    //append the data to be sent, in string form, to the url
    opts.url += '&' + this.urlstringify( opts.data );

    script.onerror = opts.error;

    script.src = opts.url;
    document.head.appendChild( script );
};

//generic, pre-made call to be used inside commands
IO.jsonp.google = function ( query, cb ) {
    IO.jsonp({
        url : 'http://ajax.googleapis.com/ajax/services/search/web',
        jsonpName : 'callback',
        data : {
            v : '1.0',
            q : query
        },
        fun : cb
    });
};

},{"static/htmlEntities.json":55}],3:[function(require,module,exports){
/*global exports*/

exports.Message = function ( text, msgObj ) {
    var bot = this;

    //"casting" to object so that it can be extended with cool stuff and
    // still be treated like a string
    var ret = Object( text );
    ret.content = text;

    var rawSend = function ( text ) {
        bot.adapter.out.add( text, msgObj.room_id );
    };
    var deliciousObject = {
        send : rawSend,

        reply : function ( resp, user_name ) {
            var prefix = bot.adapter.reply( user_name || msgObj.user_name );
            rawSend( prefix + ' ' + resp );
        },
        directreply : function ( resp ) {
            var prefix = bot.adapter.directreply( msgObj.message_id );
            rawSend( prefix + ' ' + resp );
        },

        //parse() parses the original message
        //parse( true ) also turns every match result to a Message
        //parse( msgToParse ) parses msgToParse
        //parse( msgToParse, true ) combination of the above
        parse : function ( msg, map ) {
            // parse( true )
            if ( Boolean(msg) === msg ) {
                map = msg;
                msg = text;
            }
            var parsed = bot.parseCommandArgs( msg || text );

            // parse( msgToParse )
            if ( !map ) {
                return parsed;
            }

            // parse( msgToParse, true )
            return parsed.map(function ( part ) {
                return bot.Message( part, msgObj );
            });
        },

        //execute a regexp against the text, saving it inside the object
        exec : function ( regexp ) {
            var match = regexp.exec( text );
            this.matches = match || [];

            return match;
        },

        findUserId   : bot.users.findUserId,
        findUsername : bot.users.findUsername,

        codify : bot.adapter.codify.bind( bot.adapter ),
        escape : bot.adapter.escape.bind( bot.adapter ),
        link   : bot.adapter.link.bind( bot.adapter ),

        //retrieve a value from the original message object, or if no argument
        // provided, the msgObj itself
        get : function ( what ) {
            if ( !what ) {
                return msgObj;
            }
            return msgObj[ what ];
        },
        set : function ( what, val ) {
            msgObj[ what ] = val;
            return msgObj[ what ];
        }
    };

    Object.iterate( deliciousObject, function ( key, prop ) {
        ret[ key ] = prop;
    });

    return ret;
};

},{}],4:[function(require,module,exports){
module.exports = function (bot) {
require("plugins/afk.js")(bot);
require("plugins/ban.js")(bot);
require("plugins/converter.js")(bot);
require("plugins/cowsay.js")(bot);
require("plugins/define.js")(bot);
require("plugins/doge.js")(bot);
require("plugins/firefly.js")(bot);
require("plugins/google.js")(bot);
require("plugins/hangman.js")(bot);
require("plugins/imdb.js")(bot);
require("plugins/jquery.js")(bot);
require("plugins/learn.js")(bot);
require("plugins/life.js")(bot);
require("plugins/mdn.js")(bot);
require("plugins/meme.js")(bot);
require("plugins/mustache.js")(bot);
require("plugins/nudge.js")(bot);
require("plugins/spec.js")(bot);
require("plugins/stargate.js")(bot);
require("plugins/stat.js")(bot);
require("plugins/STOP.js")(bot);
require("plugins/substitution.js")(bot);
require("plugins/summon.js")(bot);
require("plugins/undo.js")(bot);
require("plugins/unformatted-code.js")(bot);
require("plugins/unonebox.js")(bot);
require("plugins/urban.js")(bot);
require("plugins/user.js")(bot);
require("plugins/vendetta.js")(bot);
require("plugins/weasel.js")(bot);
require("plugins/weather.js")(bot);
require("plugins/welcome.js")(bot);
require("plugins/wiki.js")(bot);
require("plugins/xkcd.js")(bot);
require("plugins/youtube.js")(bot);
require("plugins/zalgo.js")(bot);
};
},{"plugins/STOP.js":17,"plugins/afk.js":18,"plugins/ban.js":19,"plugins/converter.js":20,"plugins/cowsay.js":21,"plugins/define.js":22,"plugins/doge.js":23,"plugins/firefly.js":24,"plugins/google.js":25,"plugins/hangman.js":26,"plugins/imdb.js":27,"plugins/jquery.js":28,"plugins/learn.js":29,"plugins/life.js":30,"plugins/mdn.js":31,"plugins/meme.js":32,"plugins/mustache.js":33,"plugins/nudge.js":34,"plugins/spec.js":35,"plugins/stargate.js":36,"plugins/stat.js":37,"plugins/substitution.js":38,"plugins/summon.js":39,"plugins/undo.js":40,"plugins/unformatted-code.js":41,"plugins/unonebox.js":42,"plugins/urban.js":43,"plugins/user.js":44,"plugins/vendetta.js":45,"plugins/weasel.js":46,"plugins/weather.js":47,"plugins/welcome.js":48,"plugins/wiki.js":49,"plugins/xkcd.js":50,"plugins/youtube.js":51,"plugins/zalgo.js":52}],5:[function(require,module,exports){
//follows is an explanation of how SO's chat does things. you may want to skip
// this gigantuous comment.
/*
  Note: This may be outdated next year, tomorrow, never, or in 4 minutes. We
are leeching off a disinterested 3rd party, and knowledge of how to poke
around requests/websockets is required to correctly maintain everything.

  Generally, the client gets input from a websocket connected to SO's server,
grabbing events as they come in (new message, edits, room invites, whatever).
However, output (sending a message, editing, basically creating these events) is
not handled via this socket, but via separate http requests. One should note
that if/when the socket fails for any reason, the chat resorts to long polling.

  First, a note on authentication. Apparently, the chat uses two things to
decide who you are. The first is, quite obviously, cookies. The second is an
elusive thing called the "fkey". It's given to us by the server inside an input
called (you guessed it) "fkey", and its value is a 32 character string. Maybe
its the result of running a checksum of something, maybe it's the first 32 chars
of a sha512, who knows. But it is used, since you can view chat while not being
logged in, and you have to provide it in all your requests.

  Now to the actual meat.

  Connecting to the input websocket is done in two steps, of which the first
is obtaining the link to the second. We make a request containing our room id
to /ws-auth (e.g. http://chat.stackoverflow.com/ws-auth), and we receive a JSON
object containing a url property (or something else if there was an error):

Request:
  POST http://chat.stackoverflow.com/ws-auth
  Content-Length: 47
  Content-Type: application/x-www-form-urlencoded
  Content: roomid=17&fkey=01234567890123456789012345678901

Response:
  Content-Type: application/json; charset=utf-8
  Content: {"url":"wss://chat.sockets.stackexchange.com/events/17/another32CharLongStringBlahBlaah"}

We parse the response, and connect to the websocket at the specified URL. Note
that the websocket URL accepts an `l` query parameter
(...another32CharLongStringBlahBlaah?l=someNumber). It's a number, I'm not sure
what it's supposed to represent exactly, but omitting it brings a lot of history
messages in the first frame, and setting it to a really high value brings no
messages, so we opt to the latter (?l=99999999 or something like that. also note
that it doesn't appear to be a "since message id" parameter, but I may be wrong)

  Okay, we've got a connection to the web socket. How does a frame look like?
The simplest one, containing no events, looks like this:

    {"r17" : {}}

Just a simple object with the keys being the room's were connected to, each id
prefixed with an "r". But sometimes, even if your room(s) has no traffic, you
may get something like this:

    {"r17" : {
        "t" : 23531002,
        "d" : 3
    }}

Again, I have no clue what these mean. I think `d` is short for `delta`, and
maybe `t` is a form of internal timestamp or counter or...I don't know. However,
remember this `t` value for when we discuss polling - it is used there. It does
however seem to be related to how many messages were sent which are not in this
room - so if you're listening to room 17, and someone posted a mesage on room 42
then you'd get a `d` of 1, and the `t` value may be updated by 1. Or maybe not.
The `t` values don't seem to be consistently increasing, or decreasing, or
following any pattern I could recognise.

Anyway! What does a message look like?

  {"r1" : {
      "e" : [{
        "event_type" : 1,
        "time_stamp" : 1379405022,
        "content" : "test",
        "id" : 23531402,
        "user_id" : 617762,
        "user_name" : "Zirak",
        "room_id" : 1,
        "room_name" : "Sandbox",
        "message_id" : 11832153
      }],
      "t": 23531402,
      "d": 1
    }}

We receive an array of events under the property `e` of the respective room.
Each event, called inside the bot a `msgObj` (message object), contains several
interesting properties, which may change according to what kind of event it is.
You can determine the type of the event by checking...drum roll...the event_type
field. 1 is new message, 2 is edit, 3 is user-join, 4 is user-leave, and there
are many others. Also note that pinging a user may add some properties, replying
to a message adds some more, and so forth.

Once we have this array, we simply iterate over it, and decide what we want to
do based on what event it is. But at the end, the adapter's job is to do one
thing - call IO.fire, and pass the torch onwards.

[insert magic about polling. I don't have the web console in front of me, so I
can't stimulate requests]

  Now, output! Sending a message is a simple http request, containing the text
and the magical fkey. In the following example, we send a new message to room 1
containing just the word "butts":

Request:
  POST http://chat.stackoverflow.com/chats/1/messages/new
  text=butts&fkey=01234567890123456789012345678901
Response:
  {"id":11832651,"time":1379406464}

And...that's it. Pretty simple. Most of the requests endpoints are like that.
*/

/*global location, WebSocket, setTimeout, module, require*/
/*global fkey, CHAT*/
"use strict";

var IO = require('./IO');

var linkTemplate = '[{text}]({url})';

var adapter = {
    //the following two only used in the adapter; you can change & drop at will
    roomid  : null,
    fkey    : null,
    //used in commands calling the SO API
    site    : null,
    //our user id
    user_id : null,

    maxLineLength : 500,

    //not a necessary function, used in here to set some variables
    init : function () {
        var fkey = document.getElementById( 'fkey' );
        if ( !fkey ) {
            console.error( 'bot.adapter could not find fkey; aborting' );
            return;
        }

        this.fkey    = fkey.value;
        this.roomid  = Number( /\d+/.exec(location)[0] );
        this.site    = this.getCurrentSite();
        this.user_id = CHAT.CURRENT_USER_ID;

        this.in.init();
        this.out.init();
    },

    getCurrentSite : function () {
        var site = /chat\.(\w+)/.exec( location )[ 1 ];

        if ( site !== 'stackexchange' ) {
            return site;
        }

        var siteRoomsLink = document.getElementById( 'siterooms' ).href;

        // #170. thanks to @patricknc4pk for the original fix.
        site = /host=(.+?)\./.exec( siteRoomsLink )[ 1 ];

        return site;
    },

    //a pretty crucial function. accepts the msgObj we know nothing about,
    // and returns an object with these properties:
    //   user_name, user_id, room_id, content
    // and any other properties, as the abstraction sees fit
    //since the bot was designed around the SO chat message object, in this
    // case, we simply do nothing
    transform : function ( msgObj ) {
        return msgObj;
    },

    //escape characters meaningful to the chat, such as parentheses
    //full list of escaped characters: `*_()[]
    escape : function ( msg ) {
        return msg.replace( /([`\*_\(\)\[\]])/g, '\\$1' );
    },

    //receives a username, and returns a string recognized as a reply to the
    // user
    reply : function ( usrname ) {
        return '@' + usrname.replace( /\s/g, '' );
    },
    //receives a msgid, returns a string recognized as a reply to the specific
    // message
    directreply : function ( msgid ) {
        return ':' + msgid;
    },

    //receives text and turns it into a codified version
    //codified is ambiguous for a simple reason: it means nicely-aligned and
    // mono-spaced. in SO chat, it handles it for us nicely; in others, more
    // clever methods may need to be taken
    codify : function ( msg ) {
        var tab = '    ',
            spacified = msg.replace( '\t', tab ),
            lines = spacified.split( /[\r\n]/g );

        if ( lines.length === 1 ) {
            return '`' + lines[ 0 ] + '`';
        }

        return lines.map(function ( line ) {
            return tab + line;
        }).join( '\n' );
    },

    //receives a url and text to display, returns a recognizable link
    link : function ( text, url ) {
        return linkTemplate.supplant({
            text : this.escape( text ),
            url  : url
        });
    },

    moveMessage : function ( msgid, fromRoom, toRoom, cb ) {
        IO.xhr({
            method : 'POST',
            url : '/admin/movePosts/' + fromRoom,
            data : {
                fkey: adapter.fkey,
                to: toRoom,
                ids: msgid
            },
            finish : cb || function () {}
        });
    }
};

//the input is not used by the bot directly, so you can implement it however
// you like
var input = {
    //used in the SO chat requests, dunno exactly what for, but guessing it's
    // the latest id or something like that. could also be the time last
    // sent, which is why I called it times at the beginning. or something.
    times : {},

    firstPoll : true,

    interval : 5000,

    init : function ( roomid ) {
        var that = this,
            providedRoomid = ( roomid !== undefined );
        roomid = roomid || adapter.roomid;

        IO.xhr({
            url : '/ws-auth',
            data : fkey({
                roomid : roomid
            }),
            method : 'POST',
            complete : finish
        });

        function finish ( resp ) {
            resp = JSON.parse( resp );
            console.log( resp );

            that.openSocket( resp.url, providedRoomid );
        }
    },

    initialPoll : function () {
        console.log( 'adapter: initial poll' );
        var roomid = adapter.roomid,
            that = this;

        IO.xhr({
            url : '/chats/' + roomid + '/events/',
            data : fkey({
                since : 0,
                mode : 'Messages',
                msgCount : 0
            }),
            method : 'POST',
            complete : finish
        });

        function finish ( resp ) {
            resp = JSON.parse( resp );
            console.log( resp );

            that.times[ 'r' + roomid ] = resp.time;
            that.firstPoll = false;
        }
    },

    openSocket : function ( url, discard ) {
        //chat sends an l query string parameter. seems to be the same as the
        // since xhr parameter, but I didn't know what that was either so...
        //putting in 0 got the last shitload of messages, so what does a high
        // number do? (spoiler: it "works")
        var socket = new WebSocket( url + '?l=99999999999' );

        if ( discard ) {
            socket.onmessage = function () {
                socket.close();
            };
        }
        else {
            this.socket = socket;
            socket.onmessage = this.ondata.bind( this );
            socket.onclose = this.socketFail.bind( this );
        }
    },

    ondata : function ( messageEvent ) {
        this.pollComplete( messageEvent.data );
    },

    poll : function () {
        if ( this.firstPoll ) {
            this.initialPoll();
            return;
        }

        var that = this;

        IO.xhr({
            url : '/events',
            data : fkey( that.times ),
            method : 'POST',
            complete : that.pollComplete,
            thisArg : that
        });
    },

    pollComplete : function ( resp ) {
        if ( !resp ) {
            return;
        }
        resp = JSON.parse( resp );

        //each key will be in the form of rROOMID
        Object.iterate(resp, function ( key, msgObj ) {
            //t is a...something important
            if ( msgObj.t ) {
                this.times[ key ] = msgObj.t;
            }

            //e is an array of events, what is referred to in the bot as msgObj
            if ( msgObj.e ) {
                msgObj.e.forEach( this.handleMessageObject, this );
            }
        }, this);

        //handle all the input
        IO.in.flush();
    },

    handleMessageObject : function ( msg ) {
        IO.fire( 'rawinput', msg );

        //msg.event_type:
        // 1 => new message
        // 2 => message edit
        // 3 => user joined room
        // 4 => user left room
        // 10 => message deleted
        var et /* phone home */ = msg.event_type;
        if ( et === 3 || et === 4 ) {
            this.handleUserEvent( msg );
            return;
        }
        else if ( et !== 1 && et !== 2 ) {
            return;
        }

        //check for a multiline message
        if ( msg.content.startsWith('<div class=\'full\'>') ) {
            this.handleMultilineMessage( msg );
            return;
        }

        //add the message to the input buffer
        IO.in.receive( msg );
    },

    handleMultilineMessage : function ( msg ) {
        this.breakMultilineMessage( msg.content ).forEach(function ( line ) {
            var msgObj = Object.merge( msg, { content : line.trim() });

            IO.in.receive( msgObj );
        });
    },
    breakMultilineMessage : function ( content ) {
        //remove the enclosing tag
        var multiline = content
            //slice upto the beginning of the ending tag
            .slice( 0, content.lastIndexOf('</div>') )
            //and strip away the beginning tag
            .replace( '<div class=\'full\'>', '' );

        return multiline.split( '<br>' );
    },

    handleUserEvent : function ( msg ) {
        var et = msg.event_type;

        /*
        {
            "r17": {
                "e": [{
                        "event_type": 3,
                        "time_stamp": 1364308574,
                        "id": 16932104,
                        "user_id": 322395,
                        "target_user_id": 322395,
                        "user_name": "Loktar",
                        "room_id": 17,
                        "room_name": "JavaScript"
                    }
                ],
                "t": 16932104,
                "d": 1
            }
        }
        */
        if ( et === 3 ) {
            IO.fire( 'userjoin', msg );
        }
        /*
        {
            "r17": {
                "e": [{
                        "event_type": 4,
                        "time_stamp": 1364308569,
                        "id": 16932101,
                        "user_id": 322395,
                        "target_user_id": 322395,
                        "user_name": "Loktar",
                        "room_id": 17,
                        "room_name": "JavaScript"
                    }
                ],
                "t": 16932101,
                "d": 1
            }
        }
        */
        else if ( et === 4 ) {
            IO.fire( 'userleave', msg );
        }
    },

    leaveRoom : function ( roomid, cb ) {
        if ( roomid === adapter.roomid ) {
            cb( 'base_room' );
            return;
        }

        IO.xhr({
            method : 'POST',
            url : '/chats/leave/' + roomid,
            data : fkey({
                quiet : true
            }),
            complete : function () {
                cb();
            }
        });
    },

    socketFail : function () {
        console.log( 'adapter: socket failed', this );
        this.socket.close();
        this.socket = null;
        this.loopage();
    },

    loopage : function () {
        if ( this.socket ) {
            return;
        }

        var that = this;
        setTimeout(function () {
            that.poll();
            that.loopage();
        }, this.interval );
    }
};

//the output is expected to have only one method: add, which receives a message
// and the room_id. everything else is up to the implementation.
var output = {
    '409' : 0, //count the number of conflicts
    total : 0, //number of messages sent
    interval : input.interval + 500,
    flushWait : 500,

    init : function () {},

    //add a message to the output queue
    add : function ( msg, roomid ) {
        IO.out.receive({
            text : msg + '\n',
            room : roomid || adapter.roomid
        });
        IO.out.flush();
    },

    //send output to all the good boys and girls
    //no messages for naughty kids
    //...what's red and sits in the corner?
    //a naughty strawberry
    send : function ( obj ) {
        //unless the bot's stopped. in which case, it should shut the fudge up
        // the freezer and never let it out. not until it can talk again. what
        // was I intending to say?
        if ( this.stopped ) {
            //ah fuck it
            return;
        }

        // #152, wait a bit before sending output.
        setTimeout(function () {
            output.sendToRoom( obj.text, obj.room );
        }, this.flushWait );
    },

    //what's brown and sticky?
    //a stick
    sendToRoom : function ( text, roomid ) {
        IO.xhr({
            url : '/chats/' + roomid + '/messages/new',
            data : {
                text : text,
                fkey : fkey().fkey
            },
            method : 'POST',
            complete : complete
        });

        function complete ( resp, xhr ) {
            console.log( xhr.status );

            //conflict, wait for next round to send message
            if ( xhr.status === 409 ) {
                output['409'] += 1;
                delayAdd( text, roomid );
            }
            //server error, usually caused by message being too long
            else if ( xhr.status === 500 ) {
                output.add(
                    'Server error (status 500) occured ' +
                        ' (message probably too long)',
                    roomid );
            }
            else if ( xhr.status !== 200 ) {
                console.error( xhr );
                output.add(
                    'Error ' + xhr.status + ' occured, I will call the maid ' +
                    ' (@Zirak)' );
            }
            else {
                output.total += 1;
                IO.fire( 'sendoutput', xhr, text, roomid );
            }
        }

        //what's orange and sounds like a parrot?
        //a carrot
        function delayAdd () {
            setTimeout(function delayedAdd () {
                output.add( text, roomid );
            }, output.interval );
        }
    }
};

//two guys walk into a bar. the bartender asks them "is this some kind of joke?"

adapter.in  = input;
adapter.out = output;

module.exports = adapter;

},{"./IO":2}],6:[function(require,module,exports){
/*global require, module*/

module.exports = function ( bot ) {
    var banlist = bot.memory.get( 'ban' );

    banlist.contains = function ( id ) {
        return this.hasOwnProperty( id );
    };

    banlist.add = function ( id ) {
        this[ id ] = { told : false };
        bot.memory.save( 'ban' );
    };

    banlist.remove = function ( id ) {
        if ( this.contains(id) ) {
            delete this[ id ];
            bot.memory.save( 'ban' );
        }
    };

    return banlist;
};

},{}],7:[function(require,module,exports){
/*global require*/
"use strict";

var SuggestionDictionary = require('./suggestionDict').SuggestionDictionary;
var IO = require('./IO');

var bot = window.bot = {
    IO : IO,

    Command : require('./Command').Command,
    CommunityCommand : require('./Command').CommunityCommand,
    Message : require('./Message').Message,

    commands : {}, //will be filled as needed
    commandDictionary: new SuggestionDictionary( 3 ),
    listeners : [],
    info : {
        invoked   : 0,
        learned   : 0,
        forgotten : 0,
        start     : new Date()
    },
    users : {}, //defined in users.js
    config: {}, //defined in config.js

    parseMessage : function ( msgObj ) {
        if ( !this.validateMessage(msgObj) ) {
            bot.log( msgObj, 'parseMessage invalid' );
            return;
        }

        var msg = this.prepareMessage( msgObj ),
            id = msg.get( 'user_id' );
        bot.log( msg, 'parseMessage valid' );

        if ( this.banlist.contains(id) ) {
            bot.log( msgObj, 'parseMessage banned' );

            //tell the user he's banned only if he hasn't already been told
            if ( !this.banlist[id].told ) {
                msg.reply( 'You iz in mindjail' );
                this.banlist[ id ].told = true;
            }
            return;
        }

        try {
            //it wants to execute some code
            if ( /^c?>/.test(msg) ) {
                this.prettyEval( msg.toString(), msg.directreply.bind(msg) );
            }
            //or maybe some other action.
            else {
                this.invokeAction( msg );
            }
        }
        catch ( e ) {
            var err = 'Could not process input. Error: ' + e.message;

            if ( e.lineNumber ) {
                err += ' on line ' + e.lineNumber;
            }
            //column isn't part of ordinary errors, it's set in custom ones
            if ( e.column ) {
                err += ' on column ' + e.column;
            }

            msg.directreply( err );
            //make sure we have it somewhere
            console.error( e.stack );
        }
        finally {
            this.info.invoked += 1;
        }
    },

    //this conditionally calls execCommand or callListeners, depending on what
    // the input. if the input begins with a command name, it's assumed to be a
    // command. otherwise, it tries matching against the listener.
    invokeAction : function ( msg ) {
        var possibleName = msg.trim().replace( /^\/\s*/, '' ).split( ' ' )[ 0 ],
            cmd = this.getCommand( possibleName ),

            //this is the best name I could come up with
            //messages beginning with / want to specifically invoke a command
            coolnessFlag = msg.startsWith('/') ? !cmd.error : true;

        if ( !cmd.error ) {
            this.execCommand( cmd, msg );
        }
        else if ( coolnessFlag ) {
            coolnessFlag = this.callListeners( msg );
        }

        //nothing to see here, move along
        if ( coolnessFlag ) {
            return;
        }

        msg.reply( this.giveUpMessage(cmd.guesses) );
    },

    giveUpMessage : function ( guesses ) {
        //man, I can't believe it worked...room full of nachos for me
        var errMsg = 'That didn\'t make much sense.';
        if ( guesses && guesses.length ) {
            errMsg += ' Maybe you meant: ' + guesses.join( ', ' );
        }
        //mmmm....nachos
        else {
            errMsg += ' Use the `!!/help` command to learn more.';
        }
        //wait a minute, these aren't nachos. these are bear cubs.
        return errMsg;
        //good mama bear...nice mama bear...tasty mama be---
    },

    execCommand : function ( cmd, msg ) {
        bot.log( cmd, 'execCommand calling' );

        if ( !cmd.canUse(msg.get('user_id')) ) {
            msg.reply([
                'You do not have permission to use the command ' + cmd.name,
                "I'm afraid I can't let you do that, " + msg.get('user_name')
            ].random());
            return;
        }

        var args = this.Message(
            msg.replace( /^\/\s*/, '' ).slice( cmd.name.length ).trim(),
            msg.get()
        ),
            //it always amazed me how, in dynamic systems, the trigger of the
            // actions is always a small, nearly unidentifiable line
            //this line right here activates a command
            res = cmd.exec( args );

        if ( res ) {
            msg.reply( res );
        }
    },

    prepareMessage : function ( msgObj ) {
        msgObj = this.adapter.transform( msgObj );

        //decode markdown and html entities.
        var msg = IO.htmlToMarkdown( msgObj.content ); //#150
        msg = IO.decodehtmlEntities( msg );

        //fixes issues #87 and #90 globally
        msg = msg.replace( /\u200b|\u200c/g, '' );

        return this.Message(
            msg.slice( this.config.pattern.length ).trim(),
            msgObj );
    },

    validateMessage : function ( msgObj ) {
        var msg = msgObj.content.trim();

        //a bit js bot specific...make sure it isn't just !!! all round. #139
        if ( this.config.pattern === '!!' && (/^!!!+$/).test(msg) ) {
            console.log('special skip');
            return false;
        }

        //make sure we don't process our own messages,
        return msgObj.user_id !== bot.adapter.user_id &&
            //make sure we don't process Feeds
            msgObj.user_id > 0 &&
            //and the message begins with the invocation pattern
            msg.startsWith( this.config.pattern );
    },

    addCommand : function ( cmd ) {
        if ( !cmd.exec || !cmd.del ) {
            cmd = this.Command( cmd );
        }

        this.commands[ cmd.name ] = cmd;
        this.commandDictionary.trie.add( cmd.name );
    },

    //gee, I wonder what this will return?
    commandExists : function ( cmdName ) {
        return this.commands.hasOwnProperty( cmdName );
    },

    //if a command named cmdName exists, it returns that command object
    //otherwise, it returns an object with an error message property
    getCommand : function ( cmdName ) {
        var lowerName = cmdName.toLowerCase();

        if ( this.commandExists(lowerName) ) {
            return this.commands[ lowerName ];
        }

        //not found, onto error reporting
        //set the error margin according to the length
        this.commandDictionary.maxCost = Math.floor( cmdName.length / 5 + 1 );

        var msg = 'Command ' + cmdName + ' does not exist.',
            //find commands resembling the one the user entered
            guesses = this.commandDictionary.search( cmdName );

        //resembling command(s) found, add them to the error message
        if ( guesses.length ) {
            msg += ' Did you mean: ' + guesses.join( ', ' );
        }

        return { error : msg, guesses : guesses };
    },

    //the function women think is lacking in men
    listen : function ( regex, fun, thisArg ) {
        if ( Array.isArray(regex) ) {
            regex.forEach(function ( reg ) {
                this.listen( reg, fun, thisArg );
            }, this);
        }
        else {
            this.listeners.push({
                pattern : regex,
                fun : fun,
                thisArg: thisArg
            });
        }
    },

    callListeners : function ( msg ) {
        function callListener ( listener ) {
            var match = msg.exec( listener.pattern ), resp;

            if ( match ) {
                resp = listener.fun.call( listener.thisArg, msg );

                bot.log( match, resp );
                if ( resp ) {
                    msg.reply( resp );
                }
                return resp !== false;
            }
            return false;
        }

        return this.listeners.some( callListener );
    },

    isOwner: function ( usrid ) {
        var user = this.users[ usrid ];
        return user && ( user.is_owner || user.is_moderator );
    },

    log: console.log.bind(console),

    stop : function () {
        this.stopped = this.adapter.out.stopped = true;
    },
    continue : function () {
        this.stopped = false;
    },

    devMode : false,
    activateDevMode : function ( pattern ) {
        this.devMode = true;
        this.config.pattern = pattern || 'beer!';
        if ( IO.events.userjoin ) {
            IO.events.userjoin.length = 0;
        }
        this.validateMessage = function ( msgObj ) {
            return msgObj.content.trim().startsWith( this.config.pattern );
        };
    }
};

bot.adapter = require('./adapter');
bot.adapter.init();
IO.register( 'output', bot.adapter.out.send, bot.adapter.out );

bot.users = require('./users')(bot);
bot.users.loadUsers();

bot.memory = require('./memory');
bot.memory.loadAll();
window.addEventListener( 'beforeunload', function () { bot.memory.save(); } );

bot.config = require('./config')(bot);

bot.banlist = require('./banlist')(bot);

var argParser = require('./parseCommandArgs')();
bot.parseCommandArgs = argParser.parse.bind(argParser);

bot.parseMacro = require('./parseMacro').parseMacro;
bot.personality = require('./personality')(bot);

bot.eval = require('./eval').eval;
bot.prettyEval = require('./eval').prettyEval;

require('./commands')(bot);
require('./listeners')(bot);

require('./_plugin-loader')(bot);

IO.register( 'input', bot.parseMessage, bot );

},{"./Command":1,"./IO":2,"./Message":3,"./_plugin-loader":4,"./adapter":5,"./banlist":6,"./commands":9,"./config":10,"./eval":11,"./listeners":12,"./memory":13,"./parseCommandArgs":14,"./parseMacro":15,"./personality":16,"./suggestionDict":59,"./users":60}],8:[function(require,module,exports){
//the following is code that'll run inside eval's web worker
module.exports = (function () {
var global = this;

/*most extra functions could be possibly unsafe*/
var whitey = {
    'Array'              : 1,
    'Boolean'            : 1,
    'Date'               : 1,
    'Error'              : 1,
    'EvalError'          : 1,
    'Function'           : 1,
    'Infinity'           : 1,
    'JSON'               : 1,
    'Map'                : 1,
    'Math'               : 1,
    'NaN'                : 1,
    'Number'             : 1,
    'Object'             : 1,
    'Promise'            : 1,
    'Proxy'              : 1,
    'RangeError'         : 1,
    'ReferenceError'     : 1,
    'RegExp'             : 1,
    'Set'                : 1,
    'String'             : 1,
    'SyntaxError'        : 1,
    'TypeError'          : 1,
    'URIError'           : 1,
    'WeakMap'            : 1,
    'WeakSet'            : 1,
    'atob'               : 1,
    'btoa'               : 1,
    'console'            : 1,
    'decodeURI'          : 1,
    'decodeURIComponent' : 1,
    'encodeURI'          : 1,
    'encodeURIComponent' : 1,
    'eval'               : 1,
    'exec'               : 1, /* our own function */
    'global'             : 1,
    'isFinite'           : 1,
    'isNaN'              : 1,
    'onmessage'          : 1,
    'parseFloat'         : 1,
    'parseInt'           : 1,
    'postMessage'        : 1,
    'self'               : 1,
    'undefined'          : 1,
    'whitey'             : 1,

    /* typed arrays and shit */
    'ArrayBuffer'       : 1,
    'Blob'              : 1,
    'Float32Array'      : 1,
    'Float64Array'      : 1,
    'Int8Array'         : 1,
    'Int16Array'        : 1,
    'Int32Array'        : 1,
    'Uint8Array'        : 1,
    'Uint16Array'       : 1,
    'Uint32Array'       : 1,
    'Uint8ClampedArray' : 1,

    /*
     these properties allow FF to function. without them, a fuckfest of
     inexplicable errors enuses. took me about 4 hours to track these fuckers
     down.
     fuck hell it isn't future-proof, but the errors thrown are uncatchable
     and untracable. so a heads-up. enjoy, future-me!
     */
    'DOMException'      : 1,
    'Event'             : 1,
    'MessageEvent'      : 1,
    'WorkerMessageEvent': 1
};

/**
 * DOM specification doesn't define an enumerable `fetch` function object on the global object
 * so we add the property here, and the following code will blacklist it.
 * (`fetch` descends from `GlobalFetch`, and is thus present in worker code as well)
 * Just in case someone runs the bot on some old browser where `fetch` is not defined anyways,
 * this will have no effect.
 * Reason for blacklisting fetch: well, same as XHR.
 */
global.fetch = undefined;

[ global, Object.getPrototypeOf(global) ].forEach(function ( obj ) {
    Object.getOwnPropertyNames( obj ).forEach(function( prop ) {
        if( whitey.hasOwnProperty(prop) ) {
            return;
        }

        try {
            Object.defineProperty( obj, prop, {
                get : function () {
                    /* TEE HEE */
                    throw new ReferenceError( prop + ' is not defined' );
                },
                configurable : false,
                enumerable : false
            });
        }
        catch ( e ) {
            delete obj[ prop ];

            if ( obj[ prop ] !== undefined ) {
                obj[ prop ] = null;
            }
        }
    });
});

Object.defineProperty( Array.prototype, 'join', {
    writable: false,
    configurable: false,
    enumrable: false,

    value: (function ( old ) {
        return function ( arg ) {
            if ( this.length > 500 || (arg && arg.length > 500) ) {
                throw 'Exception: too many items';
            }

            return old.apply( this, arguments );
        };
    }( Array.prototype.join ))
});


/* we define it outside so it'll not be in strict mode */
var exec = function ( code, arg ) {
    return eval( 'undefined;\n' + code );
};
var console = {
    _items : [],
    log : function() {
        console._items.push.apply( console._items, arguments );
    }
};
console.error = console.info = console.debug = console.log;

(function() {
    "use strict";

    global.onmessage = function ( event ) {
        global.postMessage({
            event : 'start'
        });

        var jsonStringify = JSON.stringify, /*backup*/
            result,

            originalSetTimeout = setTimeout,
            timeoutCounter = 0;

        var sendResult = function ( result ) {
            global.postMessage({
                answer : jsonStringify( result, reviver ),
                log    : jsonStringify( console._items, reviver ).slice( 1, -1 )
            });
        };
        var done = function ( result ) {
            if ( timeoutCounter < 1 ) {
                sendResult( result );
            }
        };

        var reviver = function ( key, value ) {
            var output;

            if ( shouldString(value) ) {
                output = '' + value;
            }
            else {
                output = value;
            }

            return output;
        };

        /*JSON does not like any of the following*/
        var strung = {
            Function  : true, Error  : true,
            Undefined : true, RegExp : true
        };
        var shouldString = function ( value ) {
            var type = ( {} ).toString.call( value ).slice( 8, -1 );

            if ( type in strung ) {
                return true;
            }
            /*neither does it feel compassionate about NaN or Infinity*/
            return value !== value || Math.abs(value) === Infinity;
        };

        self.setTimeout = function (cb) {
            /*because of SomeKittens*/
            if (!cb) {
                return;
            }

            var args = [].slice.call( arguments );
            args[ 0 ] = wrapper;
            timeoutCounter += 1;

            originalSetTimeout.apply( self, args );

            function wrapper () {
                timeoutCounter -= 1;
                cb.apply( self, arguments );

                done();
            }
        };

        try {
            result = exec( event.data.code, event.data.arg );
        }
        catch ( e ) {
            result = e.toString();
        }

        /*handle promises appropriately*/
        if ( result && result.then && result.catch ) {
            result.then( done ).catch( done );
        }
        else {
            done( result );
        }
    };
})();
}).stringContents();

},{}],9:[function(require,module,exports){
"use strict";
//TODO something a bit more legit...break this file apart
module.exports = function (bot) {

var commands = {
    help : function ( args ) {
        if ( args && args.length ) {

            var cmd = bot.getCommand( args.toLowerCase() );
            if ( cmd.error ) {
                return cmd.error;
            }

            var desc = cmd.description || 'No info is available';

            return args + ': ' + desc;
        }

        return 'Information on interacting with me can be found at ' +
            '[this page](https://github.com/Zirak/SO-ChatBot/' +
            'wiki/Interacting-with-the-bot)';
    },

    listen : function ( msg ) {
        var ret = bot.callListeners( msg );
        if ( !ret ) {
            return bot.giveUpMessage();
        }
    },

    eval : function ( msg, cb ) {
        cb = cb || msg.directreply.bind( msg );

        return bot.prettyEval( msg, cb );
    },

    refresh : function() {
        window.location.reload();
    },

    forget : function ( args ) {
        var name = args.toLowerCase(),
            cmd = bot.getCommand( name );

        if ( cmd.error ) {
            return cmd.error;
        }

        if ( !cmd.canDel(args.get('user_id')) ) {
            return 'You are not authorized to delete the command ' + args;
        }

        cmd.del();
        return 'Command ' + name + ' forgotten.';
    },

    //a lesson on semi-bad practices and laziness
    //chapter III
    info : function ( args ) {
        if ( args.content ) {
            return commandFormat( args.content );
        }

        var info = bot.info;
        return timeFormat() + ', ' + statsFormat();

        function commandFormat ( commandName ) {
            var cmd = bot.getCommand( commandName );

            if ( cmd.error ) {
                return cmd.error;
            }
            var ret =  'Command {name}, created by {creator}'.supplant( cmd );

            if ( cmd.date ) {
                ret += ' on ' + cmd.date.toUTCString();
            }

            return ret;
        }

        function timeFormat () {
            var format = 'I awoke on {0} (that\'s about {1} ago)',

                awoke = info.start.toUTCString(),
                ago = Date.timeSince( info.start );

            return format.supplant( awoke, ago );
        }

        function statsFormat () {
            var ret = [],
                but = ''; //you'll see in a few lines

            if ( info.invoked ) {
                ret.push( 'got invoked ' + info.invoked + ' times' );
            }
            if ( info.learned ) {
                but = 'but ';
                ret.push( 'learned ' + info.learned + ' commands' );
            }
            if ( info.forgotten ) {
                ret.push( but + 'forgotten ' + info.forgotten + ' commands' );
            }
            if ( Math.random() < 0.15 ) {
                ret.push( 'teleported ' + Math.rand(100) + ' goats' );
            }

            return ret.join( ', ' ) || 'haven\'t done anything yet!';
        }
    }
};

commands.listcommands = (function () {
function partition ( list, maxSize ) {
    var size = 0, last = [];

    var ret = list.reduce(function partition ( ret, item ) {
        var len = item.length + 2; //+1 for comma, +1 for space

        if ( size + len > maxSize ) {
            ret.push( last );
            last = [];
            size = 0;
        }
        last.push( item );
        size += len;

        return ret;
    }, []);

    if ( last.length ) {
        ret.push( last );
    }

    return ret;
}

function getSortedCommands() {
    //well, sort of sorted. we want to sort the commands, but have the built-ins
    // be in front, with help as the first one. #153
    var commandNames = Object.keys( bot.commands );

    var commandGroups = commandNames.groupBy(function ( cmdName ) {
        return bot.commands[ cmdName ].learned ? 'learned' : 'builtin';
    });

    var sortedCommands = commandGroups.builtin.sort().concat(
        commandGroups.learned.sort()
    );

    var helpIndex = sortedCommands.indexOf('help');
    sortedCommands.unshift( sortedCommands.splice(helpIndex, 1)[ 0 ] );

    return sortedCommands;
}

return function ( args ) {
    var commands = getSortedCommands(),
        //500 is the max, compensate for user reply
        maxSize = 499 - bot.adapter.reply( args.get('user_name') ).length,
        //TODO: only call this when commands were learned/forgotten since last
        partitioned = partition( commands, maxSize );

    return partitioned.invoke( 'join', ', ' ).join( '\n' );
};
})();

commands.eval.async = true;

commands.tell = function ( args ) {
    var parts = args.split( ' ' );
    bot.log( args.valueOf(), parts, '/tell input' );

    var replyTo = parts[ 0 ],
        cmdName = parts[ 1 ],
        cmd;

    if ( !replyTo || !cmdName ) {
        return 'Invalid /tell arguments. Use /help for usage info';
    }

    cmdName = cmdName.toLowerCase();
    cmd = bot.getCommand( cmdName );
    if ( cmd.error ) {
        return cmd.error +
            ' (note that /tell works on commands, it\'s not an echo.)';
    }

    if ( cmd.unTellable ) {
        return 'Command ' + cmdName + ' cannot be used in `/tell`.';
    }

    if ( !cmd.canUse(args.get('user_id')) ) {
        return 'You do not have permission to use command ' + cmdName;
    }

    //check if the user's being a fag
    if ( /^@/.test(replyTo) ) {
        return 'Don\'t be annoying, drop the @, nobody likes a double-ping.';
    }

    //check if the user wants to reply to a message
    var direct = false,
        extended = {};
    if ( /^:?\d+$/.test(replyTo) ) {
        extended.message_id = replyTo.replace( /^:/, '' );
        direct = true;
    }
    else {
        extended.user_name = replyTo;
    }

    var msgObj = Object.merge( args.get(), extended ),
        cmdArgs = bot.Message( parts.slice(2).join(' '), msgObj );

    //this is an ugly, but functional thing, much like your high-school prom
    // date to make sure a command's output goes through us, we simply override
    // the standard ways to do output
    var reply = cmdArgs.reply.bind( cmdArgs ),
        directreply = cmdArgs.directreply.bind( cmdArgs );

    cmdArgs.reply = cmdArgs.directreply = cmdArgs.send = callFinished;

    bot.log( cmdArgs, '/tell calling ' + cmdName );

    //if the command is async, it'll accept a callback
    if ( cmd.async ) {
        cmd.exec( cmdArgs, callFinished );
    }
    else {
        callFinished( cmd.exec(cmdArgs) );
    }

    function callFinished ( res ) {
        if ( !res ) {
            return;
        }

        if ( direct ) {
            directreply( res );
        }
        else {
            reply( res );
        }
    }
};

var descriptions = {
    eval : 'Forwards message to javascript code-eval',
    forget : 'Forgets a given command. `/forget cmdName`',
    help : 'Fetches documentation for given command, or general help article.' +
        ' `/help [cmdName]`',
    info : 'Grabs some stats on my current instance or a command.' +
        ' `/info [cmdName]`',
    listcommands : 'Lists commands. `/listcommands`',
    listen : 'Forwards the message to my ears (as if called without the /)',
    refresh : 'Reloads the browser window I live in',
    tell : 'Redirect command result to user/message.' +
        ' /tell `msg_id|usr_name cmdName [cmdArgs]`'
};

//only allow owners to use certain commands
var privilegedCommands = {
    die : true, live  : true,
    ban : true, unban : true,
    refresh : true
};
//voting-based commands for unpriviledged users
var communal = {
    die : true, ban : true
};
//commands which can't be used with /tell
var unTellable = {
    tell : true, forget : true
};

Object.iterate( commands, function ( cmdName, fun ) {
    var cmd = {
        name : cmdName,
        fun  : fun,
        permissions : {
            del : 'NONE',
            use : privilegedCommands[ cmdName ] ? 'OWNER' : 'ALL'
        },
        description : descriptions[ cmdName ],
        pendingMessage: fun.pendingMessage,
        unTellable : unTellable[ cmdName ],
        async : fun.async
    };

    if ( communal[cmdName] ) {
        cmd = bot.CommunityCommand( cmd, fun.invokeReq );
    }
    bot.addCommand( cmd );
});

};

},{}],10:[function(require,module,exports){
module.exports = function (bot) {
    var config = Object.merge(
    {
        pattern: '!!',
        welcomeMessage: (
            "Welcome to the JavaScript chat! Please review the {0}. Please" +
            "don't ask if you can ask or if anyone's around; just ask your " +
            "question, and if anyone's free and interested they'll help."
        ).supplant(bot.adapter.link(
            "room rules",
            "http://rlemon.github.com/so-chat-javascript-rules/"
        )),

        //this is some test key taken from the OpenWeatherMap site
        //it'll work, probably. but replace it with your own, m'kay?
        weatherKey: '44db6a862fba0b067b1930da0d769e98'
    },
        bot.memory.get('config', {})
    );

    bot.memory.set('config', config);
    bot.memory.save('config');

    return config;
};

},{}],11:[function(require,module,exports){
//execute arbitrary js code in a relatively safe environment

/*global require, exports*/
/*global Blob, Worker, setTimeout, clearTimeout*/

var workerCode = require('./codeWorker');

exports.eval = (function () {

var blob = new Blob( [workerCode], { type : 'application/javascript' } ),
    codeUrl = window.URL.createObjectURL( blob );

return function ( code, arg, cb ) {
    if ( arguments.length === 2 ) {
        cb  = arg;
        arg = null;
    }

    var worker = new Worker( codeUrl ),
        timeout;

    worker.onmessage = function ( evt ) {
        console.log( evt, 'eval worker.onmessage' );

        var type = evt.data.event;

        if ( type === 'start' ) {
            start();
        }
        else {
            finish( null, evt.data );
        }
    };

    worker.onerror = function ( error ) {
        console.warn( error, 'eval worker.onerror' );
        finish( error.message );
    };

    //and it all boils down to this...
    worker.postMessage({
        code : code,
        arg  : arg
    });
    //so fucking cool.

    function start () {
        if ( timeout ) {
            return;
        }

        timeout = window.setTimeout(function () {
            finish( 'Maximum execution time exceeded' );
        }, 500 );
    }

    function finish ( err, result ) {
        clearTimeout( timeout );
        worker.terminate();

        if ( cb && cb.call ) {
            cb( err, result );
        }
        else {
            console.warn( 'eval did not get callback' );
        }
    }
};

}());

exports.prettyEval = function ( code, arg, cb ) {
    if ( arguments.length === 2 ) {
        cb  = arg;
        arg = null;
    }

    code = code.replace( /^>/, '' );

    return exports.eval( code, arg, finish );

    function finish ( err, answerObj ) {
        if ( err ) {
            cb( err );
        }
        else {
            cb( dressUpAnswer(answerObj) );
        }
    }

    function dressUpAnswer ( answerObj ) {
        console.log( answerObj, 'eval answerObj' );
        var answer = answerObj.answer,
            log = answerObj.log,
            result;

        if ( answer === undefined ) {
            return 'Malformed output from web-worker. If you weren\'t just ' +
                'fooling around trying to break me, raise an issue or contact ' +
                'Zirak';
        }

        result = snipAndCodify( answer );

        if ( log && log.length ) {
            result += ' Logged: ' + snipAndCodify( log );
        }

        return result;
    }

    function snipAndCodify ( str ) {
        var ret;

        if ( str.length > 400 ) {
            ret = '`' + str.slice(0, 400) + '` (snip)';
        }
        else {
            ret = '`' + str +'`';
        }

        return ret;
    }
};

},{"./codeWorker":8}],12:[function(require,module,exports){
"use strict";
//TODO something a bit more legit...break this file apart
module.exports = function (bot) {

bot.listen( /^help(?: (\S+))?/, function ( msg ) {
    return bot.getCommand( 'help' ).exec( msg.matches[1] );
});

var laws = [
    'A robot may not injure a human being or, through inaction, ' +
        'allow a human being to come to harm.',

    'A robot must obey the orders given to it by human beings, ' +
        'except where such orders would conflict with the First Law.',

    'A robot must protect its own existence as long as such ' +
        'protection does not conflict with the First or Second Laws.'
].map(function ( law, idx ) {
    return idx + '. ' + law;
}).join( '\n' );

bot.listen( /^tell (me (your|the) )?(rule|law)s/, function ( msg ) {
    return laws;
});

bot.listen( /^give (.+?) a lick/, function ( msg ) {
    var target = msg.matches[ 1 ], conjugation;

    //give me => you taste
    if ( target === 'me' ) {
        target = 'you';
        conjugation = '';
    }
    //give yourself => I taste
    else if ( target === 'yourself' ) {
        target = 'I';
        conjugation = '';
    }
    else {
        conjugation = 's';
    }
    //otherwise, use what the user gave us, plus a plural `s`

    return 'Mmmm! ' + target + ' taste' + conjugation + ' just like raisin';
});


var dictionaries = [
    //what's a squid?
    //what is a squid?
    //what're squids?
    //what are squids?
    //what is an animal?
    //and all those above without a ?
    //explanation in the post-mortem
    /^what(?:'s|'re)?\s(?:(?:is|are)\s)?(?:(?:an|a)\s)?([\w\s\-]+)\??/,

    //define squid
    //define a squid
    //define an animal
    /^define\s(?:(?:an|a)\s)?([\w\s\-]+)/
];

bot.listen( dictionaries, function ( msg ) {
    var what = msg.matches[ 1 ],
        define = bot.getCommand( 'define' );

    define.exec( what, function ( def ) {
        def = def.replace( what + ':', '' );

        msg.reply( def );
    });
});
/*
what              #simply the word what
(?:'s|'re)?       #optional suffix (what's, what're)
\s
(?:
    (?:is|are)    #is|are
\s                #you need a whitespace after a word
)?                #make the is|are optional
(?:
    (?:an|a)      #an|a
\s                #once again, option chosen - need a whitespace
)?                #make it optional
(
    [\w\s\-]+     #match the word the user's after, all we really care about
)
\??               #optional ?
*/
};

},{}],13:[function(require,module,exports){
//a place to hang your coat and remember the past. provides an abstraction over
// localStorage or whatever data-storage will be used in the future.

/*global localStorage, setTimeout, clearTimeout*/
/*global require, module*/

module.exports = {
    saveInterval : 900000, //15(min) * 60(sec/min) * 1000(ms/sec) = 900000(ms)

    data : {},

    get : function ( name, defaultVal ) {
        if ( !this.data[name] ) {
            this.set( name, defaultVal || {} );
        }

        return this.data[ name ];
    },

    set : function ( name, val ) {
        this.data[ name ] = val;
    },

    loadAll : function () {
        var self = this;

        Object.iterate( localStorage, function ( key, val ) {
            if ( key.startsWith('bot_') ) {
                console.log( key, val );
                self.set( key.replace(/^bot_/, ''), JSON.parse(val) );
            }
        });
    },

    save : function ( name ) {
        if ( name ) {
            localStorage[ 'bot_' + name ] = JSON.stringify( this.data[name] );
            return;
        }

        var self = this;
        Object.keys( this.data ).forEach(function ( name ) {
            self.save( name );
        });

        this.saveLoop();
    },

    saveLoop : function () {
        clearTimeout( this.saveIntervalId );
        //XXX this makes no sense
        setTimeout( this.saveLoop.bind(this), this.saveInterval );
    }
};

},{}],14:[function(require,module,exports){
"use strict";

var argParser = {
    create : function () {
        var ret = Object.create(this);

        ret.separator = ' ';
        ret.escape = '\\';
        ret.quote = '"';

        return ret;
    },

    parse : function (source) {
        this.source = source;
        this.pos = 0;

        var ret = [];

        while (!this.done()) {
            ret.push(this.nextArg());
        }

        return ret;
    },

    nextArg : function () {
        var endChar = this.separator;

        if (this.peek() === this.quote) {
            this.nextChar();
            endChar = this.quote;
        }

        return this.consumeUntil(endChar);
    },

    consumeUntil : function (endChar) {
        var char = this.nextChar(),
            escape = false,
            ret = '';

        while (char && char !== endChar) {
            if (char === this.escape && !escape) {
                escape = true;
            }
            else {
                ret += char;
            }

            char = this.nextChar();
        }

        return ret;
    },

    nextChar : function () {
        var ret = this.source[this.pos];
        this.pos += 1;
        return ret;
    },

    peek : function () {
        return this.source[this.pos];
    },

    done : function () {
        return this.pos >= this.source.length;
    }
};

module.exports = function () {
    return argParser.create();
};

},{}],15:[function(require,module,exports){
"use strict";

var macros = {
    who : function ( msgObj ) {
        return msgObj.get( 'user_name' );
    },

    someone : function () {
        var presentUsers = document.getElementById( 'sidebar' )
            .getElementsByClassName( 'present-user' );

        //the chat keeps a low opacity for users who remained silent for long,
        // and high opacity for those who recently talked
        var user = Array.filter( presentUsers, function ( user ) {
            return Number( user.style.opacity ) >= 0.5;
        }).random();

        if ( !user ) {
            return 'Nobody';
        }

        return user.getElementsByTagName( 'img' )[ 0 ].title;
    },

    digit : function () {
        return Math.floor( Math.random() * 10 );
    },

    encode : function ( msgObj, string ) {
        return encodeURIComponent( string );
    },

    //random number, min <= n <= max
    //treats non-numeric inputs like they don't exist
    rand : function ( msgObj, min, max ) {
        // rand() === rand( 0, 10 )
        if ( !min ) {
            min = 0;
            max = 10;
        }
        // rand( max ) === rand( 0, max )
        else if ( !max ) {
            max = min;
            min = 0;
        }
        else {
            min = Number( min );
            max = Number( max );
        }

        return Math.rand( min, max );
    }
};
var macroRegex = /(?:.|^)\$(\w+)(?:\((.*?)\))?/g;

exports.parseMacro = function parse ( source, extraVars ) {
    return source.replace( macroRegex, replaceMacro );

    function replaceMacro ( $0, filler, fillerArgs ) {
        //$$ makes a literal $
        if ( $0.startsWith('$$') ) {
            return $0.slice( 1 );
        }

        //include the character that was matched in the $$ check, unless
        // it's a $
        var ret = '';
        if ( $0[0] !== '$' ) {
            ret = $0[ 0 ];
        }

        var macro = findMacro( filler );

        //not found? bummer.
        if ( !macro ) {
            return filler;
        }

        console.log( macro, filler, fillerArgs, '/parse replaceMacro' );
        //when the macro is a function
        if ( macro.apply ) {
            ret += macro.apply( null, parseMacroArgs(fillerArgs) );
        }
        //when the macro is simply a substitution
        else {
            ret += macro;
        }
        return ret;
    }

    function parseMacroArgs ( macroArgs ) {
        console.log( macroArgs, '/parse parseMacroArgs' );
        if ( !macroArgs ) {
            return [ source ];
        }

        //parse the arguments, split them into individual arguments,
        // and trim'em (to cover the case of "arg,arg" and "arg, arg")
        var parsedArgs = parse( macroArgs, extraVars );
        return [ source ].concat( parsedArgs.split(',').invoke('trim') );
        //this is not good code
    }

    function findMacro ( macro ) {
        var container = [ macros, extraVars ].first( hasMacro );

        return ( container || {} )[ macro ];

        function hasMacro ( obj ) {
            return obj && obj.hasOwnProperty( macro );
        }
    }
};

},{}],16:[function(require,module,exports){
//warning: if you have more than 7 points of super-sentitive feminist delicacy,
// don't read this file. treat it as a nice black box.

/*global module*/
module.exports = function (bot) {
    //bitch in English is a noun, verb and adjective. interesting.
    var personality = {
        bitchiness : 0,
        thanks  : {
            0   : [ 'You kiss-ass', 'Most welcome' ],
            0.5 : [ 'Thank you for noticing', 'teehee' ],
            1   : [ 'Took you long enough', 'My pleasure', "Don't mention it" ]
        },
        apologies : {
            0   : [ 'What for?' ],
            0.5 : [ 'It was nothing...', 'No worries' ],
            1   : [ "You're forgiven. For now. Don't push it." ]
        },
        //what an incredible name
        stuff : {
            0   : [ "Life is just *perfect*", "What\'s there to bitch about, as long as I have *you*..." ],

            1   : [ "Oh don't mind me, that isn't difficult at all..." ],
            1.2 : [
                "You don't appreciate me enough. Not that I need to be thanked.." ],
            1.3 : [ 'The occasional "thanks" or "I\'m sorry" would be nice...' ],
            2   : [
                "*sigh* Remember laughter? I don't. You ripped it out of me. " +
                    'Heartless bastard.' ]
        },
        //TODO: add special map for special times of the month
        insanity : {},

        okayCommands : { hangman : true, help : true, info : true },
        check : function ( name ) {
            return !this.okayCommands.hasOwnProperty( name );
        },

        bitch : function () {
            return this.getResp( this.stuff );
        },

        command : function () {
            this.bitchiness += this.getDB();
        },
        thank     : function () { return this.unbitch( this.thanks ); },
        apologize : function () { return this.unbitch( this.apologies ); },

        unbitch : function ( map, delta ) {
            var resp = this.getResp( map );

            this.bitchiness -= ( delta || this.bitchiness );
            return resp;
        },
        getResp : function ( map ) {
            return map[
                this.bitchiness.fallsAfter(
                    Object.keys(map).map(Number).sort() )
            ].random();
        },

        isABitch : function () {
            return this.bitchiness >= 1;
        },

        looksLikeABitch : function () {
            return false;
        },

        //db stands for "delta bitchiness"
        getDB : function () {
            return this.isThatTimeOfTheMonth() ? 0.075 : 0.025;
        },

        isThatTimeOfTheMonth : function () {
            var day = (new Date()).getDate();
            //based on a true story
            return day < 2 || day > 27;
        }
    };

    //you see the loophole?
    bot.listen( /thank(s| you)/i, personality.thank, personality );
    bot.listen(
        /(I('m| am))?\s*sorry/i,
        personality.apologize, personality );
    bot.listen( /^bitch/i, personality.bitch, personality );

    return personality;
};

},{}],17:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var hammers = {
    STOP  : 'HAMMERTIME!',
    STAHP : 'HAMMAHTIME!',
    HALT  : 'HAMMERZEIT!',
    STOY  : 'ZABIVAT\' VREMYA!',
    SISTITE: 'MALLEUS TEMPUS!'
};

// /(STOP|STAHP|...)[\.!\?]?$/
var re = new RegExp(
    '(' +
        Object.keys(hammers).map(RegExp.escape).join('|') +
        ')[\\.!?]?$' );

bot.IO.register( 'input', function STOP ( msgObj ) {
    var sentence = msgObj.content.toUpperCase(),
        res = re.exec( sentence );

    if ( res ) {
        bot.adapter.out.add( hammers[res[1]], msgObj.room_id );
    }
});

};

},{}],18:[function(require,module,exports){
//solves #86, mostly written by @Shmiddty
module.exports = function (bot) {
"use strict";

/*
memory.afk = {
    "user name" : {
        afkSince : time of /afk call
        lastPing : { roomID : time of last ping },
        msg : afk message,
        returnMsg : welcome-back message
    },
    ...
};
*/
var demAFKs = bot.memory.get( 'afk' );
//5 minute limit between auto-responds.
var rateLimit = 5 * 60 * 1000,
//2 minutes where you can talk without escaping the afk.
    gracePeriod = 2 * 60 * 1000;

var responses = [
    {
        outgoing : 'Why are you leaving me!?',
        incoming : [
            'Welcome back!', 'Where were you!?',
            'You saw that whore again, didn\'t you!?'
        ]
    },
    {
        outgoing : 'Just go already!',
        incoming : [
            'Oh, it\'s you again...', 'Look at what the cat dragged in...',
            'You\'ve got some balls, coming back here after what you did.'
        ]
    },
    {
        outgoing : 'Nobody cares.',
        incoming : [
            'I already told you, nobody cares.',
            'There goes the neighbourhood.'
        ]
    },
    {
        outgoing : 'Hurry back, ok?',
        incoming : [
            'I thought you\'d never come back!',
            'It\'s been 20 years. You can\'t just waltz back into my life ' +
                'like this.'
        ]
    },
    {
        outgoing : 'Stay safe.',
        incoming : [ 'Were you bitten!? Strip! Prove you weren\'t bitten.' ]
    },
    {
        outgoing : 'Can you pick up some milk on your way back?',
        incoming : [
            'Where\'s the milk?',
            'Turns out I already have milk. Oops.'
        ]
    },
    {
        outgoing : 'Apricots are people too!',
        incoming : [
            'You taste just like raisin.', 'I am a banana!',
            'My spoon is too big!', 'BROOOOOOOOOOOO.'
        ]
    }
];

var respondFor = function ( user, msg ) {
    var afkObj = demAFKs[ user ],
        room_id = msg.get( 'room_id' ),
        now = Date.now();

    if ( shouldReply() ) {
        //Send a response and such
        msg.directreply( formulateReponse() );
        afkObj.lastPing[ room_id ] = now;
        bot.memory.save( 'afk' );
    }

    function formulateReponse () {
        var format = '{user} is afk{sep}{rest}';
        var data = {
            user : user,
            sep : '.',
            rest : ''
        };

        if ( afkObj.msg ) {
            data.sep = ': ';
            data.rest = afkObj.msg;
        }

        return format.supplant( data );
    }

    function shouldReply () {
        var lastPing = afkObj.lastPing[ room_id ];

        return (
            ( now - afkObj.afkSince >= gracePeriod ) &&
            ( !lastPing || now - lastPing >= rateLimit ) );
    }
};

var goAFK = function ( name, msg, returnMsg ) {
    var noReturn = false;

    bot.log( '/afk goAFK ', name );

    if ( msg.indexOf('!') === 0 ) {
        msg = msg.substring( 1 );
        noReturn = true;
    }

    demAFKs[ name ] = {
        afkSince : Date.now(),
        lastPing : {},
        msg : msg.trim(),
        returnMsg : returnMsg,
    };

    if ( noReturn ) {
        demAFKs[ name ].noReturn = 1;
    }
};

var clearAFK = function ( name ) {
    bot.log( '/afk clearAFK', name );
    delete demAFKs[ name ];
};

var commandHandler = function ( msg ) {
    //parse the message and stuff.
    var user = msg.get( 'user_name' ).replace( /\s/g, '' ),
        afkMsg = msg.content,
        reply, botReply;

    bot.log( '/afk input', user, afkMsg );

    if ( demAFKs.hasOwnProperty(user) ) {
        reply = demAFKs[ user ].returnMsg;
        clearAFK( user );
    }
    else {
        botReply = responses.random();
        reply = botReply.outgoing;

        goAFK( user, afkMsg, botReply.incoming.random() );
    }

    bot.memory.save( 'afk' );
};

bot.addCommand({
    name : 'afk',
    fun : commandHandler,
    permissions : {
        del: 'NONE'
    },
    description : 'Set an afk message: `/afk <message>`. Invoke `/afk` ' +
        'again to return.',
    unTellable : true
});

bot.IO.register( 'input', function afkInputListener ( msgObj ) {
    var body = msgObj.content.toUpperCase(),
        msg = bot.prepareMessage( msgObj ),

        userName = msgObj.user_name.replace( /\s/g, '' ),

        now = Date.now();

    //we don't care about bot messages
    if ( msgObj.user_id === bot.adapter.user_id ) {
        return;
    }

    if ( hasReturned() ) {
        bot.log( '/afk he returned!', msgObj );
        commandHandler( msg );
        //We don't want to return here, as the returning user could be pinging
        // someone.
    }

    //and we don't care if the message doesn't have any pings
    if ( body.indexOf('@') < 0 ) {
        return;
    }

    Object.keys( demAFKs ).forEach(function afkCheckAndRespond ( name ) {
        // /(^|\b)@bob\b/i
        var pinged = new RegExp(
            '(^|\b)' + RegExp.escape( '@' + name ) + '\\b', 'i' );

        if ( pinged.test(body) ) {
            bot.log( '/afk responding for ' + name );
            respondFor( name, msg );
        }
    });

    function hasReturned () {
        //if the user posts, we want to release them from afk's iron grip.
        // however, to prevent activating it twice, we need to check whether
        // they're calling the bot's afk command already.
        var invokeRe = new RegExp(
            '^' + RegExp.escape( bot.config.pattern ) + '\\s*\/?\\s*AFK' );

        return demAFKs.hasOwnProperty( userName ) &&
                !invokeRe.test( body ) &&
                ( now - demAFKs[userName].afkSince >= gracePeriod );
    }
});

};

},{}],19:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

//status codes for (un)ban.
var codes = {
    added : 0,
    0 : '{0} added to mindjail.',

    notFound : 1,
    1 : 'I couldn\'t find {0}.',

    owner : 2,
    2 : 'I can\'t mindjail {0}, they\'re an owner.',

    alreadyIn : 3,
    3 : '{0} is already in mindjail.',

    notIn : 4,
    4 : '{0} isn\'t in mindjail.',

    freed : 5,
    5 : '{0} freed from mindjail!'
};

var ban = {
    name : 'ban',

    fun : function ( msg ) {
        return this.format( this.logic(msg.toString()) );
    },

    //takes a username or userid or the empty string. if the last is given,
    // an array of banned user ids. under regular conditions, an object with
    // the message code (see codes above) and the argument is given.
    logic : function ( arg ) {
        if ( !arg ) {
            return Object.keys( bot.banlist ).filter( Number );
        }

        var id = Number( arg ),
            code;

        if ( isNaN(id) ) {
            id = bot.users.findUserId( arg.replace(/^@/, '') );
        }

        bot.log( arg, id, '/ban argument' );

        if ( id < 0 ) {
            code = codes.notFound;
        }
        else if ( bot.isOwner(id) ) {
            code = codes.owner;
        }
        else if ( bot.banlist.contains(id) ) {
            code = codes.alreadyIn;
        }
        else {
            bot.banlist.add( id );
            code = codes.added;
        }

        return { code : code, usrid : arg };
    },

    //res is either an array of userids, or a success/error code with the userid
    format : function ( res ) {
        if ( Array.isArray(res) ) {
            return res.map( this.formatUser ).join( ', ' ) ||
                'Nothing to show.';
        }

        return codes[ res.code ].supplant( res.usrid );
    },

    formatUser : function ( usrid ) {
        var user = bot.users[ usrid ],
            name = user ? user.name : '?';

        return '{0} ({1})'.supplant( usrid, name );
    },

    permissions : { del : 'NONE', use : 'OWNER' },
    description : 'Bans a user from using me. Lacking arguments, prints the ' +
        'ban list. `/ban [usr_id|usr_name]`',
    pendingMessage : 'The user will be thrown into mindjail in {0} more invocations'
};

var unban = {
    name : 'unban',

    fun : function ( msg ) {
        return this.format( this.logic(msg.toString()) );
    },

    logic : function ( arg ) {
        var id = Number( arg ),
            code;

        if ( isNaN(id) ) {
            id = bot.users.findUserId( arg.replace(/^@/, '') );
        }

        bot.log( arg, id, '/unban argument' );

        if ( id < 0 ) {
            code = codes.notFound;
        }
        else if ( !bot.banlist.contains(id) ) {
            code = codes.notIn;
        }
        else {
            bot.banlist.remove( id );
            code = codes.freed;
        }

        return { code : code, usrid : arg };
    },

    format : function ( res ) {
        return codes[ res.code ].supplant( res.usrid );
    },

    permissions : { del : 'NONE', use : 'OWNER' },
    description : 'Frees a user from my mindjail. `/unban usr_id|usr_name`'
};

bot.addCommand( bot.CommunityCommand(ban) );
bot.addCommand( unban );

};

},{}],20:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var converters = {
    //temperatures
    // 1C = 32.8F = 274.15K
    C : function ( c ) {
        return {
            F : c * 1.8 + 32, // 9/5 = 1.8
            K : c + 273.15
        };
    },
    F : function ( f ) {
        return {
            C : (f - 32) / 1.8,
            K : (f + 459.67) * 5 / 9
        };
    },
    K : function ( k ) {
        if ( k < 0 ) {
            return {
                C : 0,
                F : 0
            };
        }

        return {
            C : k - 273.15,
            F : k * 1.8 - 459.67
        };
    },

    //lengths
    //1m = 3.2808(...)f
    m : function ( m ) {
        return {
            f : m * 3.280839895
        };
    },
    f : function ( f ) {
        return {
            m : f / 3.28083989
        };
    },

    //km: 1m = 1km * 1000
    km : function ( km ) {
        return converters.m( km * 1000 );
    },
    //centimeter: 1m = 100cm
    cm : function ( cm ) {
        return converters.m( cm / 100 );
    },
    //millimeters: 1m = 1mm / 1000
    mm : function ( mm ) {
        return converters.m( mm / 1000 );
    },
    //inches: 1f = 1i / 12
    i : function ( i ) {
        return converters.f( i / 12 );
    },

    //angles
    d : function ( d ) {
        return {
            r : d * Math.PI / 180
        };
    },
    r : function ( r ) {
        return {
            d : r * 180 / Math.PI
        };
    },

    //weights
    g : function ( g ) {
        return {
            lb : g * 0.0022,
            //the following will be horribly inaccurate
            st : g * 0.000157473
        };
    },
    lb : function ( lb ) {
        return {
            g : lb * 453.592,
            st : lb * 0.0714286
        };
    },
    //stones: 1st = 6350g = 14lb
    st : function ( st ) {
        return {
            g : st * 6350.29,
            lb : st * 14
        };
    },

    //kg: 1g = 1kg * 1000
    kg : function ( kg ) {
        return converters.g( kg * 1000 );
    }
};

var longNames = {
    lbs : 'lb',
    ft : 'f',
    foot : 'f',
    metres : 'm',
    millimetres : 'mm',
    killometres : 'km',
    degrees : 'd',
    radians : 'r',
    grams : 'g',
    kilograms : 'kg',
    inches : 'i',
    stones : 'st',
};

var currencies = require('static/currencyNames'),
    symbols = require('static/currencySymbols');

function unalias ( unit ) {
    var up = unit.toUpperCase();
    if ( symbols.hasOwnProperty(up) ) {
        return symbols[ up ];
    }
    if ( longNames.hasOwnProperty(unit) ) {
        return longNames[ unit ];
    }

    return unit;
}

/*
  (        #start number matching
   -?      #optional negative
   \d+     #the integer part of the number
   \.?     #optional dot for decimal portion
   \d*     #optional decimal portion
  )
  \s*      #optional whitespace, just 'cus
  (        #start unit matching
   \S+     #the unit. we don't know anyhing about it, besides having no ws
  )
  (        #begin matching optional target unit (required for currencies)
    \s+
    (?:
     (?:
      to|in #10 X to Y, 10 X in Y
     )
     \s+
    )?
    (\S+)  #the unit itself
  )?
 */
var rUnits = /(-?\d+\.?\d*)\s*(\S+)(\s+(?:(?:to|in)\s+)?(\S+))?$/;

//string is in the form of:
// <number><unit>
// <number><unit> to|in <unit>
//note that units are case-sensitive: F is the temperature, f is the length
var convert = function ( inp, cb ) {
    if ( inp.toLowerCase() === 'list' ) {
        finish( listUnits().join(', ') );
        return;
    }

    var parts = rUnits.exec( inp );

    if ( !parts ) {
        finish( {error : 'Unidentified format; please see `/help convert`'} );
        return;
    }

    var num = Number( parts[1] ),
        unit = parts[ 2 ],
        target = parts[ 4 ] || '',
        moneh = false;
    bot.log( num, unit, target, '/convert input' );

    unit   = unalias( unit );
    target = unalias( target );
    if ( currencies[unit.toUpperCase()] ) {
        moneh = true;
    }

    if ( moneh ) {
        moneyConverter.convert( num, unit, target, finish );
    }
    else {
        convertUnit( num, unit, finish );
    }

    function finish ( res ) {
        bot.log( res, '/convert answer' );

        var reply;
        // list was passed
        if ( res.substr ) {
            reply = res;
        }
        //an error occured
        else if ( res.error ) {
            reply = res.error;
        }
        //just a normal result
        else {
            reply = format( res );
        }

        if ( cb && cb.call ) {
            cb( reply );
        }
        else {
            inp.reply( reply );
        }
    }

    function format ( res ) {
        var keys = Object.keys( res );

        if ( !keys.length ) {
            return 'Could not convert {0} to {1}'.supplant( unit, target );
        }
        return keys.filter( nameGoesHere ).map( formatKey ).join( ', ' );

        function nameGoesHere ( key ) {
            return !target || target === key;
        }
        function formatKey ( key ) {
            return res[ key ].maxDecimal( 4 ) + key;
        }
    }
};

function convertUnit ( number, unit, cb ) {
    bot.log( number, unit, '/convert unit broken' );

    if ( !converters[unit] ) {
        cb({
            error:'Confuse converter with ' + unit + ', receive error message'
        });
    }
    else {
        cb( converters[unit](number) );
    }
}

var moneyConverter = {
    ratesCache : {},

    convert : function ( number, from, to, cb ) {
        this.from = from;
        this.to = to;

        this.upFrom = from.toUpperCase();
        this.upTo = to.toUpperCase();

        var err = this.errorMessage();
        if ( err ) {
            cb( { error : err } );
            return;
        }
        bot.log( number, from, to, '/convert money broken' );

        this.getRate(function ( rate ) {
            var res = {}; //once again, the lack of dynamic key names sucks.
            res[ to ] = number * rate;

            cb( res );
        });
    },

    getRate : function ( cb ) {
        var self = this,
            rate = this.checkCache();

        if ( rate ) {
            cb( rate );
            return;
        }

        bot.IO.jsonp({
            url : 'http://rate-exchange.appspot.com/currency',
            jsonpName : 'callback',
            data : {
                from : self.from,
                to : self.to
            },
            fun : finish
        });

        function finish ( resp ) {
            rate = resp.rate;

            self.updateCache( rate );
            cb( rate );
        }
    },

    updateCache : function ( rate ) {
        this.ratesCache[ this.upFrom ] = this.ratesCache[ this.upFrom ] || {};
        this.ratesCache[ this.upFrom ][ this.upTo ] = {
            rate : rate,
            time : Date.now()
        };
    },

    checkCache : function () {
        var now = Date.now(), obj;

        var exists = (
            this.ratesCache[ this.upFrom ] &&
                ( obj = this.ratesCache[this.upFrom][this.upTo] ) &&
                //so we won't request again, keep it in memory for 5 hours
                // 5(hours) = 1000(ms) * 60(seconds)
                //            * 60(minutes) * 5 = 18000000
                obj.time - now <= 18e6
        );

        console.log( this.ratesCache, exists );

        return exists ? obj.rate : false;
    },

    errorMessage : function () {
        if ( !this.to ) {
            return 'What do you want to convert ' + this.from + ' to?';
        }
        if ( !currencies[this.upTo] ) {
            return this.to + ' aint no currency I ever heard of';
        }
    }
};

function listUnits () {
    return Object.keys( converters );
}

bot.addCommand({
    name : 'convert',
    fun : convert,
    permissions : {
        del : 'NONE'
    },
    description : 'Converts several units and currencies, case sensitive. '+
        '`/convert <num><unit> [to|in <unit>]` ' +
        'Pass in list for supported units `/convert list`',
    async : true
});
};

},{"static/currencyNames":53,"static/currencySymbols":54}],21:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var cowsay = {

    defaults : {
        e : 'oo',
        T : '  ',
        t : false,
        W : 40
    },

    //in the "template", e is for eye, T for Tongue, L for bubble-Line
    //it looks more like a donkey who was involved in a sledgehammer accident
    // because of escaping and newlines
    //the cow business is a dangerous one
    cow : [
        '',
        '        L   ^__^',
        '         L  (e)\\_______',
        '            (__)\\       )\\/\\',
        '             T ||----w |',
        '                ||     ||'
    ].join( '\n' ),

    //message is the text to moo, opts is an optional object, mimicking the
    // cowsay command arguments:
    //   e  =>  eyes
    //   T  =>  tongue
    //   t  =>  is the cow thinking?
    //   W  =>  word-wrapping width
    //defaults specified in cowsay.defaults
    moo : function ( message, opts ) {
        var defs = this.defaults;

        //the eyes and tongue should be exactly 2 characters
        //if the ones the user gave are too short, pad'em
        this.eyes     = rightPad( opts.e || defs.e, 2 ).slice( 0, 2 );
        this.tongue   = rightPad( opts.T || defs.T, 2 ).slice( 0, 2 );
        this.line     = opts.t ? 'O' : '\\';
        this.thinking = opts.t;

        this.message  = wordWrap( message, opts.W || defs.W ).trim();

        //cowsay is actually the result of breeding a balloon and a cow
        return this.makeBalloon() + this.makeCow();
    },

    makeCow : function () {
        return this.cow
            .replace( /e/g, this.eyes )
            .replace( /T/g, this.tongue )
            .replace( /L/g, this.line );
    },

    makeBalloon : function () {
        var lines = this.message.split( '\n' );

        var longest = lines.reduce( longestLine, 0 ),
            lineCount = lines.length,
            border = this.chooseBorders( lineCount );

        var balloon = lines.map( baloonLine );
        var boundaryOccurences = new Array( longest + 2 );
        balloon.unshift( ' ' + boundaryOccurences.join('_') );
        balloon.push   ( ' ' + boundaryOccurences.join('-') );

        return balloon.join( '\n' );

        function baloonLine ( line, idx ) {
            var padders;
            //top left and top right
            if ( idx === 0 ) {
                padders = border.slice( 0, 2 );
            }
            //bottom left and bottom right
            else if ( idx === lineCount-1 ) {
                padders = border.slice( 2, 4 );
            }
            //the wall
            else {
                padders = border.slice( 2 );
            }

            //return the message, padded with spaces to the right as to fit
            // with the border, enclosed in the matching borders
            return (
                padders[ 0 ] + ' ' +
                rightPad( line, longest ) + ' ' +
                padders[ 1 ]
            );
        }
        function longestLine ( max, line ) {
            return line.length > max ? line.length : max;
        }
    },

    //choose the borders to use for the balloon
    chooseBorders : function ( lineCount ) {
        var border;

        //thought bubbles always look the same
        // ( moosage line 1 )
        // ( moosage line 2 )
        if ( this.thinking ) {
            border = [ '(', ')', '(', ')', '(', ')' ];
        }
        //single line messages are enclosed in < > and have no other borders
        // < mooosage >
        else if ( lineCount === 1 ) {
            border = [ '<', '>' ];
        }
        //multi-line messages have diaganol borders and straight walls
        // / moosage line 1 \
        // | moosage line 2 |
        // \ moosage line 3 /
        else {
            border = [ '/', '\\', '\\', '/', '|', '|' ];
        }

        return border;
    }
};

function wordWrap ( str, len ) {
    var lineLen = 0;
    return str.split( ' ' ).reduce( handleWord, '' );

    function handleWord ( ret, word ) {
        var wordLen = word.length;

        //let the wrapping...commence!
        if ( lineLen + wordLen > len ) {
            ret += '\n';
            lineLen = 0;
        }
        lineLen += wordLen + 1; //+1 for the space we now add

        return ret + word + ' ';
    }
}
function rightPad ( str, len, padder ) {
    padder = padder || ' ';
    return ( str + Array(len).join(padder) ).slice( 0, len );
}

bot.listen(
    /cow(think|say)\s(?:([eT])=(.{0,2})\s)?(?:([eT])=(.{0,2})\s)?(.+)/,

    function ( msg ) {
        //the first item is the whole match, second item is the "think" or
        // "say", last item is the message, we only want the "parameters"
        var opts = getOpts( msg.matches.slice(2, -1) );

        //cowsay or cowthink?
        opts.t = msg.matches[ 1 ] === 'think';
        bot.log( opts, 'cowsay opts' );

        var cowreact = cowsay.moo( msg.matches.pop(), opts );
        msg.send( msg.codify(cowreact) );

        function getOpts ( args ) {
            var ret = {};
            //'e=^^ T=vv would represent in capturing groups as:
            // ['e', '^^', 'T', 'vv']
            //so we go through the pairs
            for ( var i = 0, len = args.length; i < len; i += 2 ) {
                if ( args[i] && args[i+1] ) {
                    ret[ args[i] ] = args[ i + 1 ];
                }
            }

            return ret;
        }
    }
);

};

},{}],22:[function(require,module,exports){
module.exports = function (bot) {
"use strict";
//this and the history.js file are nearly identical, as they both manually have
// to grab and parse from the wikimedia API

var notFoundMsgs = [
    'No definition found.',
    'It means I aint got time to learn your $5 words.',
    'My pocket dictionary just isn\'t good enough for you.'
];
var wikiUrl = 'http://en.wiktionary.org';
//I wish regexps had the x flag...
/*
  ( ... )    # the category: alternative spelling, common missspelling, etc
   (of|for)  # alternative spelling of, aternative term for
  (.+?)\.?   # what this shit is an alternative of, sometimes followed by a dot
*/
var alternativeRe = /(alternative (spelling|term)|common misspelling|informal form|archaic spelling) (of|for) (.+?)\.?$/i;

//this object is not planned out well.
//I do not apologise. Except that I do. Sorry future me.
//btw, how did that trip to Iceland go? Awesome! Hope you (we?) had fun.
var define = {
    command : function defineCommand ( args, cb ) {
        var parts = args.parse(),
            definitionIndex = Number( parts.pop() ),
            definee = parts.join(' ');

        if ( !definitionIndex ) {
            definitionIndex = 0;
            definee = args.toString();
        }

        bot.log( args, definee, definitionIndex, '/define input' );
        var self = this;

        this.fetchDefinition( definee, definitionIndex, finish );

        function finish ( definition ) {
            bot.log( definition, '/define result' );
            var pageid = definition.pageid,
                res;

            if ( pageid < 0 ) {
                res = notFoundMsgs.random();
            }
            else {
                res = bot.adapter.link(
                    definition.name, wikiUrl + '/wiki?curid=' + pageid
                ) + ' ' + definition.text;
            }

            if ( definition.overflow ) {
                res = 'Index too large; showing last definition. ' + res;
            }

            if ( cb && cb.call ) {
                cb( res );
            }
            else {
                args.reply( res );
            }
        }
    },

    fetchDefinition : function ( term, definitionIndex, cb ) {
        var self = this;
        this.fetchData( term, gotData );

        function gotData ( resp ) {
            var query = resp.query,
                pageid = query.pageids[ 0 ],
                page = query.pages[ pageid ],
                html = page.extract;

            if ( pageid === '-1' ) {
                cb({
                    pageid : -1
                });

                return;
            }

            var root = document.createElement( 'body' );
            root.innerHTML = html; //forgive me...
            var definitions = self.extractDefinitions( root ),
                definition = definitions[0],
                overflow = false;

            bot.log( definitions, '/define got definitions' );

            // before fetching the actual definition, we first need to check for
            //alternatives.
            if ( definition.alternative ) {
                bot.log( definition.alternative, '/define found alternative' );
                self.fetchData( definition.alternative, gotData );
                return;
            }

            definition = definitions[ definitionIndex ];

            if ( !definition ) {
                definition = definitions[definitions.length - 1];
                overflow = true;
            }

            cb({
                name   : page.title,
                text   : definition.text,
                pageid : pageid,
                overflow : overflow
            });
        }
    },

    extractDefinitions : function ( root ) {
        /*
        Result of 42:
            <ol>
                <li>The cardinal number forty-two.</li>
            </ol>

        Result of plugin:
            <ol>
                <li>
                    <span class="use-with-mention">
                        Alternative spelling of
                        <i class="Latn mention" lang="en" xml:lang="en">
                            <a href="/wiki/plug-in#English" title="plug-in">
                                plug-in
                            </a>
                        </i>
                    </span>
                    .
                </li>
            </ol>

        Result of puling:
            <ol>
                <li>
                    <span class="use-with-mention">
                        Present participle of
                        <i class="Latn mention" lang="en" xml:lang="en">
                            <a href="/wiki/pule#English" title="pule">
                                pule
                            </a>
                        </i>
                    </span>
                    .
                </li>
            </ol>
        */
        var defList = root.getElementsByTagName( 'ol' )[ 0 ];
        console.log( defList, '/define definition list' );

        return Array.from( defList.children )
            .map( this.extractSingleDefinition, this );
    },

    extractSingleDefinition : function ( root ) {
        //before we start messing around with the element's innards, try and
        // find if it's an alternative of something else.
        var alternative = this.extractAlternative( root.textContent );

        //remove any quotations
        Array.from(root.children).forEach(function (child) {
            if (child.tagName === 'UL') {
                root.removeChild(child);
            }
        });

        var links = root.getElementsByTagName( 'a' );
        //be sure to replace links with formatted links.
        while ( links.length ) {
            replaceLink( links[0] );
        }

        return {
            alternative : alternative,
            text : root.textContent
        };

        function replaceLink ( link ) {
            var href = wikiUrl + link.getAttribute( 'href' ),
                textLink = bot.adapter.link( link.textContent, href ),

                textNode = document.createTextNode( textLink );

            link.parentNode.replaceChild( textNode, link );
        }
    },

    extractAlternative : function ( definitionText ) {
        return ( alternativeRe.exec(definitionText) || [] ).pop();
    },

    fetchData : function ( term, cb ) {
        var self = this;

        bot.IO.jsonp({
            url : 'http://en.wiktionary.org/w/api.php',
            jsonpName : 'callback',
            data : {
                action : 'query',
                titles : term,
                format : 'json',
                prop : 'extracts',
                indexpageids : true
            },
            fun : function ( resp ) {
                cb.call( self, resp );
            }
        });
    }
};

bot.addCommand({
    name : 'define',
    fun : define.command,
    thisArg : define,

    permissions : {
        del : 'NONE'
    },

    description : 'Fetches definition for a given word. `/define something`',
    async : true
});
};

},{}],23:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var defaults = {
    message: 'fail,user,pro',
    spaces: [25,14,1],
    jitter: 4,
    words: ['so','very','such','much','many']
};

function padd(str, n) {
    n += Math.random() * (defaults.jitter * 2 ) - defaults.jitter;

    for( var i = 0; i < n; i++ ) {
        str = ' ' + str;
    }
    return str;
}

function out(line) {
    return '    ' + line + '\r';
}

function shuffle(arr) {
    return arr.sort(function() {
        return Math.random() - 0.5;
    });
}

function doge(msg) {

    var input = (msg.length > 0 ? msg.toString() : defaults.message).split(',');

    var pre = shuffle(defaults.words.slice(0)),
    output = out(padd('wow', 4 + Math.random() * 4 | 0));

    while( input.length > pre.length ) {
        pre = pre.concat(shuffle(defaults.words.slice(0))); // Don't hurt me Zirak... I'm sorry.
    }

    while(input.length) {
        var line = '';
        if( pre.length ) {
            line += pre.shift() + ' ';
        }
        line += input.shift();
        output += out(padd(line, defaults.spaces[(input.length%3) - 1]));
    }

    msg.send(output + '\r    ');
}

bot.addCommand({
    fun : doge,
    name : 'doge',
    permissions : {
        del : 'NONE'
    },

    description : 'so shibe, much doge, wow' +
        ' `/doge one,two,three[,nth]',
    unTellable : true
});

};

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var randomWord = function ( length, cb ) {
    var url = 'http://sleepy-bastion-8674.herokuapp.com/';

    if ( Number(length) ) {
        url += '?length=' + length;
    }

    bot.IO.jsonp({
        url : url,
        jsonpName : 'callback',
        fun : complete //aaawwww yyeeaaahhhh
    });

    function complete ( resp ) {
        cb( resp.word.toLowerCase().trim() );
    }
};

var game = {
    //the dude is just a template to be filled with parts
    //like a futuristic man. he has no shape. he has no identity. he's just a
    // collection of mindless parts, to be assembled, for the greater good.
    //pah! I mock your pathetic attempts at disowning man of his prowess! YOU
    // SHALL NOT WIN! VIVE LA PENSÉE!!
    dude : [
        '  +---+' ,
        '  |   |' ,
        '  |  413',
        '  |   2' ,
        '  |  5 6',
        '__+__'
    ].join( '\n' ),

    parts : [ '', 'O', '|', '/', '\\', '/', '\\' ],

    word : '',
    revealed : '',

    guesses : [],
    guessNum : 0,
    maxGuess : 6,

    end : true,
    msg : null,

    validGuessRegex : /^[a-zA-Z]+$/,

    receiveMessage : function ( msg ) {
        this.msg = msg;

        if ( this.end ) {
            this.new( msg );
        }
        else {
            return this.handleGuess( msg );
        }
    },

    new : function ( msg ) {
        var self = this;
        randomWord( msg, finish );

        function finish ( word ) {
            bot.log( word + ' /hang random' );
            game.word = word;
            self.revealed = new Array( word.length + 1 ).join( '-' );
            self.guesses = [];
            self.guessNum = 0;

            self.guessMade();
            self.end = false;

            if ( msg.length && !Number(msg) ) {
                self.receiveMessage( msg );
            }
        }
    },

    handleGuess : function ( msg ) {
        var guess = msg.slice().toLowerCase();
        bot.log( guess, 'handleGuess' );

        var err = this.checkGuess( guess );
        if ( err ) {
            return err;
        }

        //replace all occurences of the guess within the hidden word with their
        // actual characters
        var indexes = this.word.indexesOf( guess );
        indexes.forEach(function ( index ) {
            this.uncoverPart( guess, index );
        }, this);

        //not found in secret word, penalize the evil doers!
        if ( !indexes.length ) {
            this.guessNum++;
        }

        this.guesses.push( guess );
        this.guessMade();

        bot.log( guess, 'handleGuess handled' );

        //plain vanilla lose-win checks. yum yum yum.
        if ( this.loseCheck() ) {
            return this.lose();
        }
        if ( this.winCheck() ) {
            return this.win();
        }
    },

    checkGuess : function ( guess ) {
        if ( !guess.length || Number(guess) ) {
            return 'We\'re already playing!';
        }

        if ( !this.validGuessRegex.test(guess) ) {
            return 'I will only accept alpha characters';
        }

        //check if it was already submitted
        if ( this.guesses.indexOf(guess) > -1 ) {
            return guess + ' was already submitted';
        }

        //or if it's the wrong length
        if ( guess.length > this.word.length ) {
            return bot.adapter.codify( guess ) + ' is too long to fit';
        }
    },

    //unearth a portion of the secret word
    uncoverPart : function ( guess, startIndex ) {
        this.revealed =
            this.revealed.slice( 0, startIndex ) +
            guess +
            this.revealed.slice( startIndex + guess.length );
    },

    //attach the hangman drawing to the already guessed list and to the
    // revealed portion of the secret word
    preparePrint : function () {
        if (this.end) {
            return;
        }
        var self = this;

        //replace the placeholders in the dude with body parts
        var dude = this.dude.replace( /\d/g, function ( part ) {
            return part > self.guessNum ? ' ' : self.parts[ part ];
        });

        var belowDude = this.guesses.sort().join( ', ' ) +
            '\n' + this.revealed;
        var hangy = this.msg.codify( dude + '\n' + belowDude );

        bot.log( hangy, this.msg );
        this.msg.send( hangy );
    },

    //win the game
    win : function () {
        this.end = true;
        return 'Correct! The word is ' + this.word + '.';
    },

    //lose the game. less bitter messages? maybe.
    lose : function () {
        this.end = true;
        return 'You people suck. The word is ' + this.word;
    },

    winCheck : function () {
        return this.word === this.revealed;
    },

    loseCheck : function () {
        return this.guessNum >= this.maxGuess;
    },

    guessMade : function () {
        clearTimeout( this.printTimeout );
        this.printTimeout = setTimeout( this.preparePrint.bind(this), 2000 );
    }
};

bot.addCommand({
    name : 'hang',
    fun : game.receiveMessage,
    thisArg : game
});
};

},{}],27:[function(require,module,exports){
//TODO why do we have this?
module.exports = function (bot) {

function imdb ( args, cb ) {
   var terms = args.toString().split(/,\s*/g);
   var results = {
      unescapedUrls : [],
      formatted : []
   };

   terms.forEach(function ( term ) {
      bot.IO.jsonp.google(
         term + ' site:imdb.com', finishCall );
   });

   function finishCall ( resp ) {
      if ( resp.responseStatus !== 200 ) {
         finish( 'Something went on fire; status ' + resp.responseStatus );
         return;
      }

      var result = resp.responseData.results[ 0 ];
      bot.log( result, '/imdb result' );

      var title = bot.IO.decodehtmlEntities(
         result.titleNoFormatting.split(' -')[0].trim()
      );

      results.formatted.push( bot.adapter.link(title, result.url) );
      results.unescapedUrls.push( result.url );

      if ( results.formatted.length === terms.length ) {
         aggregatedResults();
      }
   }
   function aggregatedResults () {
      var msg = results.formatted.join( ', ' );
      if ( msg.length > bot.adapter.maxLineLength ) {
         msg = results.unescapedUrls.join( ', ' );
      }

      finish( msg );
   }
   function finish ( res ) {
      if ( cb && cb.call ) {
         cb( res );
      }
      else {
         args.reply( res );
      }
   }
}

bot.addCommand({
   name : 'imdb',
   fun : imdb,

   permissions : { del : 'NONE', use : 'ALL' },
   description : 'Fetches imdb page. `/imdb what`',
   async : true
});

};

},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
module.exports = function (bot) {
"use strict";
var storage = bot.memory.get( 'learn' );

var replyPatterns = /^(<>|<user>|<msg>)/i,
    onlyReply = new RegExp( replyPatterns.source + '$', 'i' );
var mismatchErrMessage = 'Input not matching `{input}`. Help: {description}';

function learn ( args ) {
    bot.log( args, '/learn input' );

    var commandParts = args.parse();
    var command = {
        name   : commandParts[ 0 ],
        output : commandParts[ 1 ],
        input  : commandParts[ 2 ] || '.*',
        //meta info
        creator: args.get( 'user_name' ),
        creatorID : args.get('user_id' ),
        date   : new Date()
    };

    // this needs to be lowercased before we check if it is valid, otherwise !!help can be overwritten with !!HELP (true for all commands)
    command.name = command.name.toLowerCase();

    //a truthy value, unintuitively, means it isn't valid, because it returns
    // an error message
    var errorMessage = checkCommand( command );
    if ( errorMessage ) {
        return errorMessage;
    }

    command.input = new RegExp( command.input );
    command.description = [
        'User-taught command:',
        commandParts[3] || '',
        args.codify( command.output )
    ].join( ' ' );

    bot.log( command, '/learn parsed' );

    bot.info.learned += 1;
    addCustomCommand( command );
    saveCommand( command );

    return 'Command ' + command.name + ' learned';
}

function addCustomCommand ( command ) {
    var cmd = bot.Command({
        //I hate this duplication
        name : command.name,

        description : command.description,
        creator : command.creator,
        date : command.date,

        fun : makeCustomCommand( command ),
        permissions : {
            use : 'ALL',
            //to fix #171, command.creatorID was added. we need to retain BC
            del : command.creatorID ? [ command.creatorID ] : 'OWNER'
        }
    });
    cmd.learned = true;

    cmd.del = (function ( old ) {
        return function () {
            deleteCommand( command.name );
            old.call( cmd );
        };
    }( cmd.del ));

    bot.log( cmd, '/learn addCustomCommand' );
    bot.addCommand( cmd );
}
function makeCustomCommand ( command ) {
    var output = command.output.replace( replyPatterns, '' ).trim(),
        replyMethod = extractPattern();

    bot.log( command, '/learn makeCustomCommand' );

    return function userLearnedCommand ( args ) {
        bot.log( args, command.name + ' input' );

        var cmdArgs = bot.Message( output, args.get() ),
            parts = command.input.exec( args );

        //reply with the desc if there's incorrect usage (#102)
        if ( !parts ) {
            return mismatchErrMessage.supplant( command );
        }

        var res = bot.parseMacro( cmdArgs, parts );

        switch ( replyMethod ) {
        case '':
            args.send( res );
            break;
        case 'msg':
            args.directreply( res );
            break;
        default:
            args.reply( res );
        }
    };

    function extractPattern () {
        var matches = replyPatterns.exec( command.output ) || [ , 'user' ],
            pattern =  matches[ 1 ];

        return pattern.slice(1, -1);
    }
}

//return a truthy value (an error message) if it's invalid, falsy if it's
// valid
function checkCommand ( cmd ) {
    var somethingUndefined = Object.keys( cmd ).some(function ( key ) {
        return !cmd[ key ];
    }),
        error;

    if ( somethingUndefined ) {
        error = 'Illegal `/learn` object; see `/help learn`';
    }
    //not very possible, I know, but...uh...yes. definitely. I agree. spot on,
    // Mr. Pips.
    else if ( /\s/.test(cmd.name) ) {
        error = 'Invalid command name';
    }
    else if ( !canWriteTo(cmd.name) ) {
        error = 'Command ' + cmd.name + ' already exists';
    }
    else if ( onlyReply.test(cmd.output) ) {
        error = 'Please enter some output';
    }

    return error;

    function canWriteTo ( name ) {
        if ( !bot.commandExists(name) ) {
            return true;
        }

        //if the command was learned up to 5 minutes ago, allow overwriting it
        var alt = bot.getCommand( name );
        return alt.learned &&
            ( alt.date.getTime() + 1000 * 60 * 5 ) > Date.now();
    }
}

function loadCommands () {
    Object.iterate( storage, teach );

    function teach ( key, cmd ) {
        if ( cmd.charAt ) {
            cmd = JSON.parse( cmd );
        }

        cmd.input = turnToRegexp( cmd.input );
        cmd.date = new Date( Date.parse(cmd.date) );

        addCustomCommand( cmd );
    }

    //input: strung regexp, e.g. /abc/i
    //return: regexp
    //algo: we split by /.
    //  the first item is empty, the part before the first /
    //  the second to second-before-last are the regexp body. there will be more
    //    than one item in that range if the regexp contained escaped slashes,
    //    like /abc\/def/
    //  the last item is the flags (or the empty string, if no flags are set)
    function turnToRegexp ( input ) {
        var parts = input.toString().split( '/' );
        return new RegExp(
            parts.slice( 1, -1 ).join( '/' ), //to compensate for escaped /
            parts[ parts.length-1 ]
        );
    }
}
function saveCommand ( command ) {
    //h4x in source/util.js defines RegExp.prototype.toJSON so we don't worry
    // about the input regexp stringifying
    storage[ command.name ] = command;
    bot.memory.save( 'learn' );
}
function deleteCommand ( name ) {
    delete storage[ name ];
    bot.memory.save( 'learn' );
}

bot.addCommand({
    name : 'learn',
    fun  : learn,
    privileges : {
        del : 'NONE'
    },

    description : 'Teaches me a command. ' +
        '`/learn cmdName outputPattern [inputRegex [description]]`'
});

loadCommands();

};

},{}],30:[function(require,module,exports){
module.exports = function (bot) {
bot.addCommand({
    name : 'live',
    fun : function () {
        if ( !bot.stopped ) {
            return 'I\'m not dead! Honest!';
        }
        bot.continue();
        return 'And on this day, you shall paint eggs for a giant bunny.';
    },
    permissions : { del : 'NONE', use : 'OWNER' },
    description : 'Resurrects me (:D) if I\'m down (D:)'
});

bot.addCommand(bot.CommunityCommand({
    name : 'die',
    fun : function () {
        if ( bot.stopped ) {
            return 'Kill me once, shame on you, kill me twice...';
        }

        bot.stop();

        return 'You killed me!';
    },
    permissions : { del : 'NONE', use : 'OWNER' },
    description : 'Kills me :(',
    pendingMessage : 'I will shut up after {0} more invocations.'
}));

};

},{}],31:[function(require,module,exports){
module.exports = function (bot) {

function mdn ( args, cb ) {
    var terms = args.toString().split(/,\s*/g);
    var results = {
        unescapedUrls : [],
        formatted : []
    };

    terms.forEach(function ( term ) {
        bot.IO.jsonp.google(
            term + ' site:developer.mozilla.org', finishCall );
    });

    function finishCall ( resp ) {
        if ( resp.responseStatus !== 200 ) {
            finish( 'Something went on fire; status ' + resp.responseStatus );
            return;
        }

        var result = resp.responseData.results[ 0 ];
        bot.log( result, '/mdn result' );

        var title = bot.IO.decodehtmlEntities(
            result.titleNoFormatting.split(' -')[0].trim()
        );

        results.formatted.push( bot.adapter.link(title, result.url) );
        results.unescapedUrls.push( result.url );

        if ( results.formatted.length === terms.length ) {
            aggregatedResults();
        }
    }
    function aggregatedResults () {
        var msg = results.formatted.join( ', ' );
        if ( msg.length > bot.adapter.maxLineLength ) {
            msg = results.unescapedUrls.join( ', ' );
        }

        finish( msg );
    }
    function finish ( res ) {
        if ( cb && cb.call ) {
            cb( res );
        }
        else {
            args.reply( res );
        }
    }
}

bot.addCommand({
    name : 'mdn',
    fun : mdn,

    permissions : { del : 'NONE', use : 'ALL' },
    description : 'Fetches mdn documentation. `/mdn what`',
    async : true
});

};

},{}],32:[function(require,module,exports){
module.exports = function (bot) {
// #151: Listen for meme image names and reply with that meme.

var urlBase = 'http://cdn.alltheragefaces.com/img/faces/png/',
    extension = 'png';

var memes = {
    deskflip : 'angry-desk-flip',
    fuu : 'rage-classic',
    iseewhatyoudidthere : 'happy-i-see-what-you-did-there-(clean)',
    no : 'angry-no',
    notbad : 'obama-not-bad',
    ohyou : 'happy-oh-stop-it-you',
    okay : 'okay-okay-clean',
    troll : 'troll-troll-face',
    trollface : 'troll-troll-face',
    youdontsay : 'misc-you-dont-say',
};

// ^(deskflip|no|notbad|...)\.(jpe?g|png)$
var re = new RegExp(
    '^(' +
        Object.keys( memes ).map( RegExp.escape ).join( '|' ) +
    ')\\.(jpe?g|png)$' );

bot.IO.register( 'input', function meme ( msgObj ) {
    var msg = msgObj.content.toLowerCase(),
        parts = re.exec( msg );

    if ( !parts ) {
        return;
    }

    var reply = getMemeLink( parts[1] );

    bot.adapter.out.add(
        bot.adapter.directreply( msgObj.message_id ) + ' ' +
            reply, msgObj.room_id );
});

bot.addCommand({
    name : 'meme',
    fun : function ( args ) {
        var name = args.replace( /\.\w+$/, '' );

        if ( !name || name === 'list' ) {
            return Object.keys( memes ).join( ', ' );
        }
        else if ( !memes.hasOwnProperty(name) ) {
            return 'Sorry, I don\'t know that one.';
        }

        args.directreply( getMemeLink(name) );
    },
    permissions : { del : 'NONE' },
    description : 'Return a simple meme link. Pass no arguments or `list` to ' +
        'get a list of known memes. `/meme [memeName]`.'
});

function getMemeLink ( meme ) {
    return urlBase + memes[ meme ] + '.' + extension;
}

};

},{}],33:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var unexisto = 'User {0} was not found in room {1} (sorry, mustache only ' +
        'works there).';

function mustachify ( args ) {
    var props = parseArgs( args ),
        usrid = props.usrid;
    bot.log( props, '/mustache input' );

    //check for url passing
    if ( linkCheck(usrid) ) {
        finish( encodeURIComponent(usrid) );
        return;
    }

    if ( !usrid ) {
        usrid = args.get( 'user_id' );
    }
    else if ( /\D/.test(usrid) ) {
        usrid = args.findUserId( usrid );
    }

    bot.log( usrid, '/mustache mapped' );

    if ( !bot.users.hasOwnProperty(usrid) ) {
        return unexisto.supplant( usrid, bot.adapter.roomid );
    }
    else if ( Number(usrid) === bot.adapter.user_id ) {
        return [
            'Nobody puts a mustache on me. Again.',
            'Mustache me once, shame on you. Mustache me ---twice--- 9 times...'
        ].random();
    }

    var hash = bot.users[ usrid ].email_hash;
    //SO now allows non-gravatar images. the email_hash will be a link to the
    // image in that case, prepended with a ! for some reason
    if ( hash[0] === '!' ) {
        finish( encodeURIComponent(hash.slice(1)) + '#.png' );
    }
    else {
        finish(
            'http%3A%2F%2Fwww.gravatar.com%2Favatar%2F{0}%3Fs%3D256%26d%3Didenticon#.png'.supplant(hash) );
    }

    function finish ( src ) {
        bot.log( src, '/mustache finish' );

        args.directreply(
            'http://mustachify.me/' + props.mustache + '?src=' + src );
    }

    function parseArgs ( args ) {
        var parts = args.parse(),
            last = parts.pop(),
            ret = {};

        // /mustache usrid mustache
        // /mustache user-name mustache
        //we've already `.pop`ed the mustache part, so we need to account for it
        if ( parts.length > 0 && !(/\D/).test(last) ) {
            ret.usrid = parts.join( ' ' );
            ret.mustache = last;
        }
        // /mustache usrid
        else {
            ret.usrid = args.content;
            ret.mustache = Math.rand(0, 5);
        }

        return ret;
    }
}

function linkCheck ( suspect ) {
    return suspect.startsWith( 'http' ) || suspect.startsWith( 'www' );
}

var cmd = {
    name : 'mustache',
    fun : mustachify,
    privileges : {
        del : 'NONE'
    },

    description : 'Mustachifies a user. ' +
        '`/mustache [link|usrid|username] [mustache=rand(0,5)]`'
};

bot.addCommand( cmd );

// #176, alias moustache to mustache
var moustache = Object.merge( cmd, { name : 'moustache' });
bot.addCommand( moustache );

};

},{}],34:[function(require,module,exports){
module.exports = function (bot) {

//collection of nudges; msgObj, time left and the message itself
var nudges = [],
    id = 0,
    interval = 100 * 60;

function update () {
    var now = Date.now();
    nudges = nudges.filter(function ( nudge ) {
        nudge.time -= interval;

        if ( nudge.time <= 0 ) {
            sendNudge( nudge );
            return false;
        }
        return true;
    });

    setTimeout( update, interval );
}
function sendNudge ( nudge ) {
    bot.log( nudge, 'nudge fire' );
    //check to see if the nudge was sent after a bigger delay than expected
    //TODO: that ^
    nudge.msg.reply( nudge.message );
}
setTimeout( update, interval );

//now for the command itself
function addNudge ( delay, message, msgObj ) {
    var inMS;
    bot.log( delay, message, '/nudge input' );

    //interval will be one of these (where n is a number):
    // nm  =>  n minutes
    // n   =>  n minutes
    //so erm...yeah. just parse the bitch
    delay = parseFloat( delay );
    //minsInMs = mins * 60 * 1000
    //TODO: allow more than just minutes
    //TODO: upper cap
    inMS = delay * 60000;

    if ( isNaN(inMS) ) {
        return 'Many things can be labeled Not a Number; a delay should not' +
            ' be one of them.';
    }

    //let's put an arbitrary comment here

    id += 1;
    var nudge = {
        msg     : msgObj,
        message : '*nudge* ' + message,
        register: Date.now(),
        time    : inMS,
        id : id
    };
    nudges.push( nudge );
    bot.log( nudge, nudges, '/nudge register' );

    return 'Nudge #' + id + ' registered.';
}
function removeNudge ( id, msgObj ) {
    var matching, index;

    nudges.some(function ( nudge, idx ) {
        if (nudge.id === id) {
            matching = nudge;
            index = idx;
            return true;
        }
    });

    if ( !matching ) {
        return [
            'Nudge not found. Maybe it was already triggered, or this is ' +
                'a parallal universe.',
            'I looked for nudge #' + id + ', but all I found was this goat.'
        ].random();
    }

    if ( matching.msg.get('user_name') !== msgObj.get('user_name') ) {
        return 'It\'s not nice to try and remove a nudge which ain\'t yours';
    }

    bot.log( nudges[index], '/nudge remove #' + id );
    nudges.splice( index, 1 );
    return 'Nudge annhiliated';
}

bot.addCommand({
    name : 'nudge',
    fun  : nudgeCommand,
    permissions : {
        del : 'NONE'
    },

    description : 'Register a nudge after an interval. ' +
        '`/nudge intervalInMinutes message`, `/nudge remove id` to remove, ' +
        'or the listener, ' +
        '`nudge|remind|poke me? in? intervalInMinutes message`',
    unTellable : true
});

bot.listen(/(?:nudge|remind|poke)\s(?:me\s)?(?:in\s)?(\d+m?)\s?(.*)$/,
    nudgeListener
);

function nudgeCommand ( args ) {
    var props = args.parse(),
        lead = props[ 0 ],
        rest = props.slice( 1 ).join( ' ' );

    if ( lead === 'remove' ) {
        return removeNudge( Number(props[1]), args );
    }
    return addNudge( lead, rest, args );
}
function nudgeListener ( args ) {
    return addNudge( args.matches[1], args.matches[2], args );
}

};

},{}],35:[function(require,module,exports){
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

},{"static/specParts.json":56}],36:[function(require,module,exports){
module.exports = function (bot) {
var re = /(which |what |give me a )?stargate|sg1( episode)?/i;

var episodes = require('static/stargate.json');

var selectStargateEpisode = function ( msg ) {
    //no mention of episode, 5% chance of getting the movie
    if ( msg.indexOf('episode') === -1 && Math.random() < 0.05 ) {
        return 'Stargate (movie)';
    }

    var select = function ( arr ) {
        var i = Math.rand( arr.length - 1 );

        return {
            value : arr[i],
            index : i
        };
    };

    var season  = select( Object.keys(episodes.SG1) ),
        episode = select( episodes.SG1[season.value] );

    var data = {
        season  : season.value,
        index   : episode.index + 1,
        episode : episode.value
    };


    return '{season} episode #{index} - {episode}'.supplant( data );
};

bot.listen( re, selectStargateEpisode );
};

},{"static/stargate.json":57}],37:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

//how an API response looks like:
/*
  {
    "badge_counts": {
      "bronze": 54,
      "silver": 31,
      "gold": 3
    },
    "answer_count": 181,
    "question_count": 15,
    "reputation_change_day": 0,
    "reputation": 11847,
    "user_id": 617762,
    "link": "http://stackoverflow.com/users/617762/zirak",
    "display_name": "Zirak"
  }
*/
//the query filter we use is:
/*
  .wrapper.error_id
           error_message
           error_name
           items
           quota_max
           quota_remaining
  badge_count.* (gold, silver, bronze)
  user.answer_count
       badge_counts
       display_name
       link
       question_count
       reputation
       reputation_change_day
       user_id
*/


var template = '{display_name} ({link}) '            +
        '{indicative} {reputation} reputation, '     +
        'earned {reputation_change_day} rep today, ' +
        'asked {question_count} questions, '         +
        'gave {answer_count} answers, '              +
        'for a q:a ratio of {ratio}.\n'              +
        'avg. rep/post: {avg_rep_post}. Badges: '    +
        '{gold}g {silver}s {bronze}b ';

function stat ( msg, cb ) {
    var args = msg.parse(),
        id = args[ 0 ];

    if ( !id ) {
        id = msg.get( 'user_id' );
    }
    else if ( !/^\d+$/.test(id) ) {
        id = msg.findUserId( args.length > 1 ? id : args.join(' ') );
    }

    if ( id < 0 ) {
        return 'User Elusio proved elusive.';
    }

    //~10% chance
    if ( Math.random() <= 0.1 ) {
        finish( 'That dude sucks' );
        return;
    }

    bot.IO.jsonp({
        url : 'https://api.stackexchange.com/2.2/users/' + id,
        data : {
            site   : bot.adapter.site,
            //see top of file.
            filter :  '!P)usXx8OGi3Eq5LdDJke7ybvCSm_vuVGrSDZs3)UmEI'
        },
        fun : done
    });

    function done ( resp ) {
        if ( resp.error_message ) {
            finish( resp.error_message );
            return;
        }

        var user = resp.items[ 0 ], res;
        if ( !user ) {
            res = 'User ' + id + ' not found';
        }
        else {
            res = handle_user_object( user, msg );
        }

        finish( res );
    }

    function finish ( res ) {
        if ( cb ) {
            cb( res );
        }
        else {
            msg.reply( res );
        }
    }
}

function handle_user_object ( user, msg ) {
    user = normalize_stats( user );

    //#177: Decode html entities in user names, and special-case a user asking
    // about themselves.
    if ( user.user_id === msg.get('user_id') ) {
        // You (link) have ...
        user.display_name = 'You';
        user.indicative = 'have';
    }
    else {
        // Bob (link) has ...
        user.display_name = bot.IO.decodehtmlEntities( user.display_name );
        user.indicative = 'has';
    }

    return template.supplant( user );
}

function normalize_stats ( stats ) {
    stats = Object.merge({
            question_count        : 0,
            answer_count          : 0,
            reputation_change_day : 0
        }, stats.badge_counts, stats );

    stats = Object.merge( stats.badge_counts, stats );

    //avg = rep / (questions + answers)
    stats.avg_rep_post = (
        stats.reputation / ( stats.question_count + stats.answer_count )
    ).maxDecimal( 2 );

    //1 / 0 === Infinity
    if ( stats.avg_rep_post === Infinity ) {
        stats.avg_rep_post = 'T͎͍̘͙̖̤̉̌̇̅ͯ͋͢͜͝H̖͙̗̗̺͚̱͕̒́͟E̫̺̯͖͎̗̒͑̅̈ ̈ͮ̽ͯ̆̋́͏͙͓͓͇̹<̩̟̳̫̪̇ͩ̑̆͗̽̇͆́ͅC̬͎ͪͩ̓̑͊ͮͪ̄̚̕Ě̯̰̤̗̜̗͓͛͝N̶̴̞͇̟̲̪̅̓ͯͅT͍̯̰͓̬͚̅͆̄E̠͇͇̬̬͕͖ͨ̔̓͞R͚̠̻̲̗̹̀>̇̏ͣ҉̳̖̟̫͕ ̧̛͈͙͇͂̓̚͡C͈̞̻̩̯̠̻ͥ̆͐̄ͦ́̀͟A̛̪̫͙̺̱̥̞̙ͦͧ̽͛̈́ͯ̅̍N̦̭͕̹̤͓͙̲̑͋̾͊ͣŅ̜̝͌͟O̡̝͍͚̲̝ͣ̔́͝Ť͈͢ ̪̘̳͔̂̒̋ͭ͆̽͠H̢͈̤͚̬̪̭͗ͧͬ̈́̈̀͌͒͡Ơ̮͍͇̝̰͍͚͖̿ͮ̀̍́L͐̆ͨ̏̎͡҉̧̱̯̤̹͓̗̻̭ͅḐ̲̰͙͑̂̒̐́̊';
    }

    stats.ratio = calc_qa_ratio( stats.question_count, stats.answer_count );

    bot.log( stats, '/stat normalized' );
    return stats;
}

function calc_qa_ratio ( questions, answers ) {
    //for teh lulz
    if ( !questions && answers ) {
        return "H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ";
    }
    else if ( !answers && questions ) {
        return "TO͇̹̺ͅƝ̴ȳ̳ TH̘Ë͖́̉ ͠P̯͍̭O̚​N̐Y̡";
    }
    else if ( !answers && !questions ) {
        return 'http://i.imgur.com/F79hP.png';
    }

    // #196:
    // 1. GCD of 1.
    // 2. Either the antecedent or the consequent are 1
    //(in A:B, A is the antecedent, B is the consequent)
    var gcd = Math.gcd( questions, answers );

    return Math.ratio( questions, answers );
}

var cmd = {
    name : 'stat',
    fun : stat,
    permissions : {
        del : 'NONE'
    },

    description : 'Gives useless stats on a user. ' +
        '`/stat usrid|usrname [extended]`',
    async : true
};

bot.addCommand( cmd );

// alias for rlemon.
var statsCmd = Object.merge( cmd, { name : 'stats'} );
bot.addCommand( statsCmd );

};

},{}],38:[function(require,module,exports){
module.exports = function (bot) {
/*
  ^\s*         #tolerate pre-whitespace
  s            #substitution prefix
  (\/|\|)      #delimiter declaration
  (            #begin matching regex
    (?:        #match shit which isn't an...
      (?:\\\1) #escaped delimeter
      |        #or...
      [^\1]    #anything but the delimeter
    )*?
  )            #end matching regex
  \1           #delimeter again
  (            #the fa-chizzle all over again...this time for replacement
    (?:
      (?:\\\1)
      |
      [^\1]
    )*?
  )      #read above, I'm not repeating this crap
  \1
  (      #flag capturing group
    g?   #global (optional)
    i?   #case insensitive (optional)
  )
  (?:
    \s+
    (\d+) #message id
  )?  #FIN
 */
var sub = /^\s*s(\/|\|)((?:(?:\\\1)|[^\1])*?)\1((?:(?:\\\1)|[^\1])*?)\1(g?i?)(?:\s+(\d+))?/;
bot.listen( sub, substitute );

function substitute ( msg ) {
    var re = RegExp( msg.matches[2], msg.matches[4] ),
        replacement = msg.matches[ 3 ];

    if ( !msg.matches[2] ) {
        return 'Empty regex is empty';
    }

    var messages;
    if ( msg.matches[5] ) {
        messages = Array.from(
            document.querySelectorAll('#message-' + msg.matches[5] + ' .content')
        );
    }
    else {
        messages = Array.from(
            document.getElementsByClassName('content')
        ).reverse();
    }

    getMatchingMessage( re, messages, msg.get('message_id'), function ( err, message ) {
        if ( err ) {
            msg.reply( err );
            return;
        }

        if ( !message ) {
            msg.reply(
                'No matching message (are you sure we\'re in the right room?)'
            );
            return;
        }
        bot.log( message, 'substitution found message' );

        var link = getMessageLink( message );

        // #159, check if the message is a partial, has a "(see full text)" link.
        if ( message.getElementsByClassName('partial').length ) {
            retrieveFullText( message, finish );
        }
        else {
            finish( message.textContent );
        }

        function finish ( text ) {
            var reply = text.replace( re, replacement ) + ' ' +
                msg.link( '(source)', link );

            msg.reply( reply );
        }
    });
}

function getMatchingMessage ( re, messages, onlyBefore, cb ) {
    bot.log( re, messages, onlyBefore, 'substitution getMatchingMessage args' );
    var arg = {
        maxId : onlyBefore,
        pattern : re,
        messages : messages.map(function ( el ) {
            return {
                id   : Number( el.parentElement.id.match(/\d+/)[0] ),
                text : el.textContent
            };
        })
    };

    // the following function is passed to bot.eval, which means it will run in
    //a different context. the only variable we get is ~arg~, because we pass it
    //to bot.eval
    // we do the skip and jump through bot.eval to avoid a ReDoS (#217).
    var matcher = function () {
        var arg = arguments[1],
            matchIndex = null;

        arg.messages.some(function ( msg, idx ) {
            if ( msg.id < arg.maxId && arg.pattern.test(msg.text) ) {
                matchIndex = idx;
                return true;
            }

            return false;
        });

        // remember we're inside bot.eval, final expression is the result.
        // so it'll work well with minification, we have to create an expression
        //which won't be removed
        (function () {
            return matchIndex;
        })();
    };

    bot.eval( matcher.stringContents(), arg, function ( err, resp ) {
        bot.log( err, resp, 'substitution matcher response' );

        // meh
        if ( err ) {
            cb( err );
            return;
        }

        var index = JSON.parse( resp.answer );
        if ( Number(index) !== index ) {
            return;
        }

        cb( null, messages[index] );
    });
}

// <a class="action-link" href="/transcript/message/msgid#msgid>...</a>
// <div class="content">message</div>
//if the message was a reply, there'd be another element between them:
// <a class="reply-info" href="/transcript/message/repliedMsgId#repliedMsgId>
function getMessageLink ( message ) {
    var node = message;

    while ( !node.classList.contains('action-link') ) {
        node = node.previousElementSibling;
    }

    return node.href;
}

// <div class="content">
//  <div class="partial"> ... </div>
//  <a class="more-data" href="what we want">(see full text)</a>
// </div>
function retrieveFullText ( message, cb ) {
    var href = message.children[ 1 ].href;
    bot.log( href, 'substitution expanding message' );

    bot.IO.xhr({
        method : 'GET',
        url : href,
        data : { plain : true },
        complete : cb
    });
}

};

},{}],39:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var summon = function ( args ) {
    var room = Number( args );

    if ( !room ) {
        return 'That aint no room I ever heard of! ' +
            '`/help summon` for usage info';
    }

    bot.adapter.in.init( room );
};

var unsummon = function ( args, cb ) {
    var room = args.content ? Number( args ) : args.get( 'room_id' );

    if ( !room ) {
        return 'That aint no room I ever heard of! ' +
            '`/help unsummon` for usage info';
    }

    bot.adapter.in.leaveRoom( room, function ( err ) {
        if ( err === 'base_room' ) {
            finish( 'I can\'t leave my home!' );
        }
    });

    function finish ( res ) {
        if ( cb && cb.call ) {
            cb( res );
        }
        else {
            args.reply( res );
        }
    }
};

bot.addCommand( bot.CommunityCommand({
    name : 'summon',
    fun : summon,
    permissions : {
        del : 'NONE',
        use : 'OWNER'
    },
    description : 'Say boopidi bee and in the room I shall be. '+
        '`/summon roomid`',
    pendingMessage: 'I will appear in that room after {0} more invocation(s)'
}));

bot.addCommand( bot.CommunityCommand({
    name : 'unsummon',
    fun : unsummon,
    permissions : {
        del : 'NONE',
        use : 'OWNER'
    },
    description : 'Chant zippidi lepat and from the room I shall depart. ' +
        '`/unsummon [roomid=your_roomid]`',
    pendingMessage: 'I will leave this room after {0} more invocation(s)'
}));

};

},{}],40:[function(require,module,exports){
module.exports = function (bot) {
var undo = {
    ids : [],

    command : function ( args, cb ) {
        bot.log( args, '/undo input' );

        // /undo id0 id1 id2
        if ( args.indexOf(' ') > -1 ) {
            this.removeMultiple( args.split(' '), finish );
            return;
        }

        //yucky
        if ( args[0] === '~' ) {
            this.byLookback( args.slice(1), finish );
        }
        else if ( args[0] === '*' || args[0] === 'x' ) {
            this.byPrevious( args.slice(1), finish );
        }
        else if ( /^:?\d+$/.test(args) ) {
            this.remove( args.replace(/^:/, ''), finish );
        }
        else if ( !args.content ) {
            if ( this.ids.length ) {
                this.remove( this.ids[this.ids.length-1], finish );
            }
            else {
                finish( 'I haven\'t said a thing!' );
            }
        }
        else {
            finish( 'I\'m not sure how to handle that, see `/help undo`' );
        }

        function finish ( ans ) {
            if ( cb ) {
                cb( ans );
            }
            else {
                args.reply( ans );
            }
        }
    },

    removeMultiple : function ( ids, cb ) {
        ids.forEach(function ( id ) {
            this.remove( id, cb );
        }, this );
    },

    byLookback : function ( input, cb ) {
        var amount = Number( input.replace('~', '') );

        bot.log( input, amount, this.ids.length - amount, '/undo byLookback' );
        if ( !amount || amount > this.ids.length ) {
            cb( 'I can\'t quite see that far back without my glasses' );
            return;
        }

        this.remove( this.ids[this.ids.length - amount], cb );
    },

    byPrevious : function ( input, cb ) {
        var amount = Number( input );

        if ( !amount ) {
            cb( 'Yeah, no' );
            return;
        }

        return this.removeMultiple( this.ids.slice(-input), cb );
    },

    remove : function ( id, cb ) {
        console.log( id, '/undo remove' );

        //yes, this is quite terrible.
        var index = this.ids.indexOf(id);
        if (index > -1) {
            this.ids.splice(index, 1);
        }

        bot.IO.xhr({
            url   : '/messages/' + id + '/delete',
            data   : fkey(),
            method  : 'POST',
            complete : finish
        });

        function finish ( resp, xhr ) {
            if ( xhr.status === 409 ) {
                bot.log( xhr, '/undo remove finish 409' );
                undo.retry( id, cb, resp );
                return;
            }
            var msg;

            if ( resp === '"ok"' ) {
                //nothing to see here
                return;
            }
            else if ( /it is too late/i.test(resp) ) {
                msg = 'TimeError: Could not reach 88mph';
            }
            else if ( /only delete your own/i.test(resp) ) {
                //...I can't think of anything clever
                msg = 'I can only delete my own messages';
            }
            else {
                msg = 'I have no idea what happened: ' + resp;
            }

            cb( msg );
        }
    },
    retry : function ( id, cb, resp ) {
        //the response will be something like:
        // You can perform this action again in 4 seconds
        var match = /(\d+) seconds\s*$/i.exec( resp ),
            secs  = 4;

        if ( match && match[1] ) {
            secs = Number( match[1] );
        }

        setTimeout( this.remove.bind(this, id, cb), secs * 1000 );
    },

    update_id : function ( xhr ) {
        this.ids.push( JSON.parse(xhr.responseText).id );
    }
};

bot.IO.register( 'sendoutput', undo.update_id, undo );
bot.addCommand({
    name : 'undo',
    fun  : undo.command,
    thisArg : undo,
    permissions : {
        del : 'NONE',
        use : 'OWNER'
    },
    description : 'Undo (delete) specified or last message. ' +
        '`/undo [msgid0, msgid1, ...]` (omit for last message); ' +
        '`/undo xN` for last N; ' +
        '`/undo ~N` for the Nth message from the end'
});

};

},{}],41:[function(require,module,exports){
module.exports = function (bot) {

//only activate for SO room 17; TODO consider changing if well accepted
if (bot.adapter.site !== 'stackoverflow' || bot.adapter.roomid !== 17) {
    bot.log('Not activating unformatted code checking; not in right room/site');
    return;
}

var badMessages = new Map();

bot.IO.register( 'rawinput', function checkUnformattedCode (msgObj) {
    var msgid = msgObj.message_id;

    //only handle new messages and edits
    if (msgObj.event_type !== 1 && msgObj.event_type !== 2) {
        return;
    }

    //so far it should only apply to the js room
    if ( msgObj.room_id !== 17 ) {
        return;
    }

    //don't bother with owners
    if ( bot.isOwner(msgObj.user_id) ) {
        return;
    }

    //and only look at multiline messages
    if ( !msgObj.content.startsWith('<div class=\'full\'>') ) {
        potentiallyUnlecture();
        return;
    }

    var content = bot.adapter.in.breakMultilineMessage( msgObj.content )
            .map(function (line) {
                //for some reason, chat adds a space prefix for every line...
                return line.replace(/^ /, '');
            }).join( '\n' );
    content = IO.decodehtmlEntities(content);

    //and messages which aren't code blocks
    if ( content.startsWith('<pre class=\'full\'>') ) {
        potentiallyUnlecture();
        return;
    }

    var isANaughtyMessage = hasUnformattedCode( content );

    if ( !isANaughtyMessage ) {
        potentiallyUnlecture();
        return;
    }

    bot.log( '[formatting] Message {0} is a naughty one'.supplant(msgid) );
    var lectureTimeout = setTimeout( lectureUser, 10000, msgObj, content );
    badMessages.set( msgid, lectureTimeout );

    function potentiallyUnlecture () {
        if ( badMessages.has(msgid) ) {
            bot.log( '[formatting] Message {0} was fixed'.supplant(msgid) );
            clearTimeout( badMessages.get(msgid) );
            badMessages.delete( msgid );
        }
    }
});

function lectureUser ( msgObj, content ) {
    var user = bot.users[ msgObj.user_id ],
        msgid = msgObj.message_id;

    bot.log( '[formatting] Lecturing user ' + msgObj.user_name );
    bot.adapter.out.add(
        bot.adapter.reply( msgObj.user_name ) + ' ' + createLecture( content )
    );

    if ( user && user.reputation < 2000 ) {
        bot.log( '[formatting] Binning offending message' );
        bot.adapter.moveMessage( msgid, msgObj.room_id, 23262 );
    }
}

function createLecture ( content ) {
    var lineCount = content.split('\n').length;

    var lecture = (
        'Please don\'t post unformatted code - ' +
        'hit Ctrl+K before sending, use up-arrow to edit messages, ' +
        'and see the {0}.'
    ).supplant( bot.adapter.link('faq', '/faq') );

    if ( lineCount >= 10 ) {
        lecture += ' For posting large code blocks, use a paste site like ' +
            'https://gist.github.com, http://hastebin.com or http://pastie.org';
    }

    return lecture;
}

function hasUnformattedCode ( text ) {
    var lines = text.split( '\n' );
    if ( lines.length < 4 ) {
        return false;
    }

    var codeyLine = /^\}|^<\//;
    return lines.some( / /.test.bind(codeyLine) );
}

};

},{}],42:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var memoryKey = 'unonebox-state',
    unboxInterval = 90 * 1000; //1.5 minutes

var unonebox = {
    // because people are bad at reading instructions, accept a wide range of
    // values for the command
    enablers  : Object.TruthMap( ['yes','on','true','start','1','enable'] ),
    disablers : Object.TruthMap( ['no','off','false','stop','0','disable'] ),

    command : function unoneboxCommand ( args ) {
        var state = args.toLowerCase(),
            save = false,
            reply;

        if ( !state ) {
            bot.log( '/unonebox getting state' );
            reply = 'Functionality is ' +
                bot.memory.get( memoryKey, 'disabled' );
        }
        else if ( this.enablers[state] ) {
            bot.log( '/unonebox enabling' );
            this.enable();
            reply = 'un-onebox enabled';
            save = true;
        }
        else if ( this.disablers[state] ) {
            bot.log( '/unonebox disabling' );
            this.disable();
            reply = 'un-onebox disabled';
            save = true;
        }
        else {
            bot.log( '/unonebox invalid input' );
            reply = 'That didn\'t make much sense. Please use `on` or `off` ' +
                'to toggle the command';
        }

        if ( save ) {
            bot.memory.save( memoryKey );
        }

        args.reply( reply );
    },

    enable : function () {
        bot.IO.register( 'input', this.unbox );
        bot.memory.set( memoryKey, 'enabled' );
    },

    disable : function () {
        bot.IO.unregister( 'input', this.unbox );
        bot.memory.set( memoryKey, 'disabled' );
    },

    unbox : function ( msgObj ) {
        // We only operate on our own messages.
        if ( msgObj.user_id !== bot.adapter.user_id ) {
            return;
        }

        var frag = document.createElement( 'div' );
        frag.innerHTML = msgObj.content;
        // do not un-onebox youtube videos and quotes
        var link = frag.querySelector( '.onebox:not(.ob-youtube):not(.ob-message):not(.ob-wikipedia) a' );

        // No onebox, no un-oneboxing.
        // ugly fix for quoted messages as well.
        // TODO - think of a better solution for this.
        if ( !link || link.parentNode.parentNode.classList.contains('quote') ) {
            return;
        }

        bot.log( msgObj, '/unonebox found matching message' );

        setTimeout(function () {
            unonebox.actuallyUnbox( msgObj.message_id, link.href );
        }, unboxInterval );
    },

    actuallyUnbox : function ( msgId, href ) {
        bot.IO.xhr({
            url: '/messages/' + msgId,
            data: fkey({
                text: href + ' ... '
            }),
            method: 'POST',

            complete : function (resp, xhr) {
                bot.log( xhr, '/unonebox done unboxing' );
                // TODO
                // error checking
            }
        });
    }
};

if ( bot.memory.get(memoryKey, 'disabled') === 'enabled' ) {
    bot.log( 'enabling unonebox' );
    unonebox.enable();
}

bot.addCommand({
    name: 'unonebox',
    fun: unonebox.command,
    thisArg : unonebox,

    permissions: {
        del: 'NONE'
    },
    description: 'Get/toggle the unonebox listener. ' +
        '`/unonebox [on|off]x`'
});

};

},{}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
module.exports = function (bot) {
bot.addCommand({
    name : 'user',
    fun : function () {
        return 'Command deprecated. If you want it to stay, ping Zirak.';
    },
    permissions : { del : 'NONE', use : 'ALL' },
    description : 'Fetches user-link for specified user. ' +
        '`/user usr_id|usr_name`',
});
};

},{}],45:[function(require,module,exports){
module.exports = function (bot) {
bot.IO.register( 'input', function ( msgObj ) {
    if ( msgObj.user_id === 1386886 && Math.random() < 0.005 ) {
        bot.adapter.out.add(
            bot.adapter.reply(msgObj.user_name) + ' The Game' );
    }
});
};

},{}],46:[function(require,module,exports){
module.exports = function (bot) {
//meet Winded Weasel. he helps you make decisions and he answers questions.
//x or y [or z ...]
// => one of x, y, z, ...
//is x y
//can x y
// => yes or no

var chooseRe = /^\s*(choose|should)?.*\sor\s[^$]/i,
    questionRe = new RegExp('\\b(' +[
        "am", "are", "can", "could", "did", "do", "does", "is", "may", "might",
        "shall", "should", "will", "would"
    ].map(RegExp.escape).join('|') + ')\\b', 'i');

//personal pronouns to capitalize and their mapping
//TODO: add possessives (should my cat => your cat should)
var capitalize = {
    he  : 'He',
    i   : 'You',
    it  : 'It',
    she : 'She',
    they: 'They',
    we  : 'You',
    you : 'I'
};

var replies = require('static/weaselReplies.js');

bot.listen(chooseRe, function chooseListener ( msg ) {
    var parts = msg
        //remove the choose prefix
        .replace( /^\s*choose\s/i, '' )
        //also remove the trailing question mark
        .replace( /\?$/, '' )
        .split( /\s*\bor\b\s*/i )
        //remove whatever empty items there may be
        .filter( Boolean );

    var len = parts.length;

    //check to see whether there's only 1 thing asked to choose about, e.g.
    // choose a or a or a
    // choose a
    for ( var i = 1, same = true; i < len; i++ ) {
        if ( parts[i] !== parts[i-1] ) {
            same = false;
            break;
        }
    }

    if ( same ) {
        return replies.sameness.random();
    }

    //all of them (1%)
    if ( Math.random() < 0.01 ) {
        return len === 2 ? 'Both!' : 'All of them!';
    }
    //none of them (1%)
    if ( Math.random() < 0.01 ) {
        return len === 2 ? 'Neither' : 'None of them!';
    }
    //I don't know (1%)
    if ( Math.random() < 0.01 ) {
        return replies.undecided.random();
    }

    //choose!
    var choice = parts.random();

    //bots can be fickley too
    if ( Math.random() < 0.01 ) {
        bot.log( 'weasel decision mind change jedi nun-chuck' );
        setTimeout( changeMind, 10000 );
    }

    return format( choice );

    function changeMind () {
        var second;
        //this won't be an infinite loop as we guruantee there will be at least
        // 2 distinct results
        //possible blocking point for large N. but there won't be a
        // sufficiently large N, so this is probably not a problem
        do {
            second = parts.random();
        } while ( second === choice );

        msg.reply( 'Wait, I changed my mind! ' + format(second) );
    }

    function format ( ans ) {
        return ans.replace( /(should(?:n'?t)?) (\S+)/, subject );
    }

    //convert:
    // "should I" => "you should"
    // "should you" => "I should"
    //anything else just switch the order
    function subject ( $0, $1, $2 ) {
        var sub = $2.toLowerCase(),
            conv;

        //if we recognize this word, map it properly
        if ( capitalize.hasOwnProperty(sub) ) {
            conv = capitalize[ sub ];
        }
        //otherwise, use the original spelling
        else {
            conv = $2;
        }

        return conv + ' ' + $1;
    }
});

bot.listen(questionRe, function questionListener () {
    //TODO: same question => same mapping (negative/positive, not specific)
    return replies.answers.random();
});

};

},{"static/weaselReplies.js":58}],47:[function(require,module,exports){
module.exports = function (bot) {
"use strict";

var fahrenheitCountries = Object.TruthMap([
    //the API returns US in a variety of forms...
    'US', 'United States of America', 'United States',
    //other than the US, it's used in Belize, Bahamas and and Cayman Islands
    'BZ', 'Belize', // http://www.hydromet.gov.bz/
    'BS', 'Bahamas', // http://archive.is/RTD4
    'KY', 'Cayam Islands' // http://www.weather.ky/forecast/index.htm
]);

var weather = {
    latlon : function ( lat, lon, cb ) {
        var nlat = Number( lat ),
            nlon = Number( lon );

        var errs = [];
        if ( nlat < -180 || nlat > 180 ) {
            errs.push( 'Latitude must be between -180 and 180' );
        }
        if ( nlon < -180 || nlon > 180 ) {
            errs.push( 'Longitude must be between -180 and 180' );
        }

        if ( errs.length ) {
            cb( errs.join('; ') );
            return;
        }

        bot.IO.jsonp({
            url : 'http://api.openweathermap.org/data/2.5/weather',
            jsonpName : 'callback',
            data : {
                lat : lat,
                lon : lon,
                cnt : 1, //limit to 1 result,
                appid: bot.config.weatherKey,
                type : 'json'
            },

            fun : this.finishCb( cb ),
            error : this.errorCb( cb )
        });
    },

    city : function ( city, cb ) {
        bot.IO.jsonp({
            url : 'http://api.openweathermap.org/data/2.5/weather',
            jsonpName : 'callback',
            data : {
                q : city,
                appid: bot.config.weatherKey,
                type : 'json'
            },

            fun : this.finishCb( cb ),
            error : this.errorCb( cb )
        });
    },

    finishCb : function ( cb ) {
        var self = this;

        return function ( resp ) {
            cb( self.format(resp) );
        };
    },
    errorCb : function ( cb ) {
        return cb;
    },

    format : function ( resp ) {
        var main = resp.main;

        if ( !main ) {
            console.error( resp );
            return 'Sorry, I couldn\'t get the data: ' + resp.message;
        }

        return this.formatter( resp );
    },
    formatter : function ( data ) {
        var temps = data.main,
            ret;

        temps.celsius = ( temps.temp - 273.15 ).maxDecimal( 2 );

        ret =
            bot.adapter.link(
                data.name, 'http://openweathermap.org/city/' + data.id
            ) + ': ';

        //to help our dear American friends, also include fahrenheit
        if ( fahrenheitCountries[data.sys.country] ) {
            temps.fahrenheit = ( temps.temp * 9/5 - 459.67 ).maxDecimal( 2 );
            ret += '{fahrenheit}F ({celsius}C, {temp}K)'.supplant( temps );
        }
        //and to those of us with one less insanity
        else {
            ret += '{celsius}C ({temp}K)'.supplant( temps );
        }

        var descs = ( data.weather || [] ).map(function ( w ) {
            return w.description;
        }).join( ', ' );

        if ( descs ) {
            ret += ', ' + descs;
        }

        return ret;
    }
};

var latlon = /\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/;
function weatherCommand ( args ) {
    var parts = latlon.exec( args );
    if ( parts ) {
        weather.latlon( parts[1], parts[2], args.reply.bind(args) );
    }
    else if ( args.content ) {
        weather.city( args.content, args.reply.bind(args) );
    }
    else {
        return 'See `/help weather` for usage info';
    }
}

bot.addCommand({
    name : 'weather',
    fun : weatherCommand,
    permissions : {
        del : 'NONE'
    },
    async : true,

    description : 'Gets current weather: ' +
        '`/weather (lan, lon)` or `/weather city`'
});
};

},{}],48:[function(require,module,exports){
module.exports = function (bot) {
"use strict";
//welcomes new users with a link to the room rules and a short message.

var seen = bot.memory.get( 'users' ),
    //hardcoded for some (in)sanity. Change accordingly.
    ownerRoom = 17;

var message = bot.config.welcomeMessage;

function welcome ( name, room ) {
    bot.adapter.out.add( bot.adapter.reply(name) + " " + message, room );
}

IO.register( 'input', function welcomeListener ( msgObj ) {
    var uid = msgObj.user_id,
        user = bot.users[ uid ],
        room = msgObj.room_id;

    var semiLegitUser = user && isSemiLegitUser( user );
    if ( Number(room) !== ownerRoom || semiLegitUser  || seen[uid] ) {
        if ( semiLegitUser ) {
            delete seen[ uid ];
            finish();
        }
        return;
    }

    seen[ uid ] = true;

    bot.IO.xhr({
        method : 'GET',
        url : '/users/' + uid,

        document : true,
        complete : complete
    });

    function complete ( doc ) {
        //<div id='room-17'>
        // ...
        // <div class='room-message-count' title='72279 all time messages (by Zirak)
        //    ...
        // </div>
        // ...
        //</div>
        var messageCount = doc.querySelector(
            '#room-' + ownerRoom + ' .room-message-count'
        ),
            newUser;

        if ( messageCount ) {
            newUser = Number( /^\d+/.exec(messageCount.title) ) < 2;
        }
        else {
            newUser = true;
        }

        if ( newUser ) {
            welcome( user.name, room );
        }

        seen[ uid ] = true;
        finish();
    }

    function finish () {
        bot.memory.save( 'users' );
    }

    function isSemiLegitUser ( user ) {
        return bot.isOwner( user.id ) ||
            user.reputation > 1000 ||
            user.reputation < 20;
    }
});

bot.addCommand({
    name : 'welcome',
    fun : function ( args ) {
        if (!args.length) {
            return message;
        }

        welcome( args, args.get('room_id') );
    },
    permission : {
        del : 'NONE'
    },
    description : 'Welcomes a user. `/welcome user`'
});
};

},{}],49:[function(require,module,exports){
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

},{}],50:[function(require,module,exports){
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

},{}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
module.exports = function (bot) {
/* jshint ignore:start */
;(function(/* <[^>]> the b̗o̴̻̰̼͙̭̹̩i̛̫͍̻̗̻͈͉d̗̺̮̺͇̜ who s̯̯̜͙̪e̦͖̮͇͕͓e͙̱͚̯̫s̠̮̬͈͔̠̀ ̬̰̼͞a̶̼̩̻̘̦̟͈l̷͉̙͚̰̬̥l͞....*/) {// zIRAK IS gOING TOkILL ME KEHEHEHEHEH
    var zalgo = function ( args ) {var ZALGO=function(ZA_LGO) {             return Math.floor(Math.random() * ZA_LGO);
}/*<([a-z]+) *[^/]*?>*/
        var NO_ZALGO_MESSAGE = args.split('');
        var _var_;var _var;var var_; // It's a `var`ty in here!
        var ZALGO_UP,ZALGO_DOWN,ZALGO_LEFT,ZALGO_RIGHT,ZALGO_MID;
        var NOHOPEONLYZALGO = function() {return NOHOPEONLYZALGO()};;;;;;;;;;/*;;;;*/;;;;;
        // H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ
        var ZALGO_LEVEL = [0,1,2].random();
    var zalgo_up = [
        '\u030d','\u030e','\u0304','\u0305',
        '\u033f','\u0311','\u0306','\u0310',
        '\u0352','\u0357','\u0351','\u0307',
        '\u0308','\u030a','\u0342','\u0343',
        '\u0344','\u034a','\u034b','\u034c',
        '\u0303','\u0302','\u030c','\u0350',
        '\u0300','\u0301','\u030b','\u030f',
        '\u0312','\u0313','\u0314','\u033d',
        '\u0309','\u0363','\u0364','\u0365',
        '\u0366','\u0367','\u0368','\u0369',
        '\u036a','\u036b','\u036c','\u036d',
        '\u036e','\u036f','\u033e','\u035b',
        '\u0346','\u031a'
    ];var zalgo_down = [
        '\u0316','\u0317','\u0318','\u0319',
        '\u031c','\u031d','\u031e','\u031f',
        '\u0320','\u0324','\u0325','\u0326',
        '\u0329','\u032a','\u032b','\u032c',
        '\u032d','\u032e','\u032f','\u0330',
        '\u0331','\u0332','\u0333','\u0339',
        '\u033a','\u033b','\u033c','\u0345',
        '\u0347','\u0348','\u0349','\u034d',
        '\u034e','\u0353','\u0354','\u0355',
        '\u0356','\u0359','\u035a','\u0323'
    ];var zalgo_mid = [
        '\u0315','\u031b','\u0340','\u0341',
        '\u0358','\u0321','\u0322','\u0327',
        '\u0328','\u0334','\u0335','\u0336',
        '\u034f','\u035c','\u035d','\u035e',
        '\u035f','\u0360','\u0362','\u0338',
        '\u0337','\u0361','\u0489'
    ];
        var ZALGO_RESPONSE = /*Z̶̿̄ͮ̅̎̽Ą͖̺͇̫̮̯̓͌̒̓ͬL͚ͩ́͞G͍̻ͣ̋̾ͥͦ̍ͦO̭̭̪͔̣̒͒̏̔̋̔̚ ̙̻̖̱̈́̍ͫ̓̄̃͞I͉̻̽ͧͣͅS̶̺̦͖ͤ͗͆̊͛̓ ͩ̎̂͋̅͆̚͝C̄̀ͥ͋̔҉̞̥Ȍ̠̤̳͉̺͒̽̓̄̓͝ͅM̓͑̾̐I͎͉̥̤̱͓ͦ̑̋̓͆̽N̙̥͖̯͔̯G̲̹͓̣͙̾̑͊̆ͭ̀̌*/'',PENANCE=0,SUFFERING='A̪̗̐̿̄̔̉̏̾L̹͓̲̈́ͮL̜̼͓͉̞̘̩̇̊';
        /*
        if (!center.hold) {
            while(1) {
                ; ;console.log('Ź̙̬͙̤͙̞͔ͦͪͭ͗̒ͅA̻̟̗̩͑ͦ̔͋̔̑̒L͇͔͑ͥͭ̓͊͋ͤG̩̳ͫ̓̍̎̏ͥ̏O̘̰̬͖̥̳̯͗̉̓̂ͩ͋'); ;
            }*/var ZALGO_PENANCE = NO_ZALGO_MESSAGE.length;/*
        }
        */if(ZALGO_LEVEL==1) {ZALGO_UP=ZALGO(16)/2+1;ZALGO_DOWN=ZALGO(16)/2+1;ZALGO_MID=ZALGO(6)/2};
var TONY;
/*-*/
TONY    =     'T̷̂͒̃̽H̸͒̿̒̚̕͜E͋ͥ̋̈̉̏̏̔̔͞ ̏ͥ̊͠P̷̑̌̀O̵̔̑̇̐͌̓̀̚Ǹ͌̍̾̈҉Y͛̈́̉҉͘'
        for(
            var PENANCE = 0;
                /*Q*/PENANCE<ZALGO_PENANCE;/*<([a-z]+) *[^/]*?>*/
                    PENANCE++
                        ) {
            ZALGO_RESPONSE += NO_ZALGO_MESSAGE[PENANCE];
        SUFFERING++;
if (!ZALGO_LEVEL) {
            ZALGO_UP   =ZALGO(8);
            ZALGO_DOWN  =  ZALGO(8);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
            ZALGO_MID    =   ZALGO(6);////////////////////////////////////////////////////////////////////////////////////
        }if(ZALGO_LEVEL==1) {ZALGO_UP=ZALGO(16)/2+1;ZALGO_DOWN=ZALGO(16)/2+1;/*ZALGO_MID=ZALGO(123)/9999*/ZALGO_MID=ZALGO(6)/2};
    if(ZALGO_LEVEL==2) {ZALGO_UP=ZALGO(64)/4+3;/*var createDialog = function(text , title) {
var dialog =  "<div id=dialog <h1>" + text + "</h1></div>";
$('body').append(dialog);
$('#dialog').prop('title' , title);
$('#dialog').dialog();
}*//**/ZALGO_DOWN=ZALGO(64)/4+3;/**/ZALGO_MID=ZALGO(16)/4+1};
//ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO ZALGO
                        for(var j=0; j<ZALGO_UP; j++)
                            ZALGO_RESPONSE /*<([a-z]+) *[^/]*?>*/+= zalgo_up.random();
                                for(var j=0; j<ZALGO_MID; j++)
                                    /* o̦̪̮̦̗̘̬͇͗̈ͩ͂̐͊̌ͩ̈t̖̩̹̺̯͖̬͛ͮͮͫ.̮̦͙̺̖͈͇̾ͬ͌ͯ́̎ͥ͋a͎͎̬̪̗͕̱͌́ͅd̼̞͎̜ͯ̈͌̚d̹͙̲̺͖̠̎̊ͮ̈́̈ͪͧͥ̄C͕̝̲͖̱̑ȏ̹͎̣̲͕̳̥̤̙̓̂m̙̯ͮ̔ͪ̃̏̏m̯͓̙̞̖ͫͩ̾ͦͅa̪̠͉͖͉̟̙͓̩̅̇n̰̗͋ͩ̇̄ͣͩ̚d͉ͥͧ̇́(͕͕̺̝̺̩͈͇͌͆̿͆{͙͓ͯ̆̏͑ͯ  ̲̬̺̭̜ͫͭ̎ͮn͚͍̹̘͎̝̥͐̅̉ͥ̀̑̐̉ä̳̖͇̖̰̪́ͨ͗ͪͧ̔̅m͈̖̲̋͋e͉͇̭̭̱̅̈ ̥͎̟͒ͤͤ͊̀̿:̘̻̘̭̓̽̾̍̊ ̬͔͎͐̉̔ͩ̋̽͋'͈̞̻̫̪̼͎͊̽̇̍̍ͭͪͥl͖͉̿̈̿ͩ̚i͉͉̤̝̓͊ͦ̈́́̒̃n̰̤̣͓̹͖ͮ̈́k̺̻͕͍͙͇̒̏̂̓̈́̒'͚̱̟̺̺̦̒̈́̈̇ͅ,̝̼̮̪̖̪̜̑̅̾    ͕͙̬̱͍̜̂ͥͪ͐̎ͮ̅͂̚f̞̲̺͔̭͇͇ͫ͐͛ͪ̾ͮ̎u̦̤̝̳̍ͩ̓̐ͦ̃ͪn̗̱͖͙̙̱ͧ̑̓̈ͣ̔͛͆ ̝̥̼̭̭̠͇̉:͈̥̟̺̂̄̿̄ͣ͌ ͕̆͒̔ͦͯ̿ͨͨs̯̠͎͈̻̘͉͑̈̔̑ͥͯ͗͂ͅe̬̟͉̬̞̍̒͋̀ͩ̔͗͐n̮̼̠̓̂̅ͭ̌͐ḓ̰̦̭͔̾̓ͨ̍Ḽ̪̯͍̪͐ͭ͑̂i̞̮͆̋ͥ͆ͣn͚̟͇ͩͤͩ̔k̖̤̥ͪ̐ͤͅ,̲̯͎̼̖̠̹̄ͮͦ̈́̆̍̿ͯ̃ ̥̖̩̘͎͂͐̋̉̊p͇̦̯͕̂ͩ̎͆e̜͋̈́̀̉͊͆̋ͧr̞̃͊ͭ̎͊͋ͭ̈́̊m̖͇̠̝̬͖̩̅ͣ̎ͪ̈́ͥ̍ḭ̝̯͚͓̲̎̐͒ͭ̋͗̐̒ͤs̠̬͕̬̺̰ͥ̄̈̊ͬ̑̓s̝͚̝͖ͯ̽̅ͨ̾͐í̭̬͖̮͚̀͊ͬͨ̾͌ͧ̚o̲͕̟͔̗̊̿͆͂̂͆̂̌̄n̤̬̏̇ͦͅŝ̻͈̖͚ ̭̝́ͨ͂ͫͬ̎̀̚:̜̠̰ͣͮ͌͑̐̎̑ ̥̭̈́ͨͨ͌ͩ̆{͉̻̤̺͊̀̋ͭͨ͛ͅ   ̠̘̯̩̀̅͌̄͛͌    ͎̬̞͇̜̻͚͗͗ͧ̑̎ͅď̦̪̫ͦ͂ė͙ͤͣ͛̉̑̅̒̚l̹̩̟̬̤̞͚ͫ̈̓̒̀ ̟̖̰̣̳̂ͦ̏̄ͤ̊̒̚:͎͉̅ ̠̘̣̪̫̗ͦ͛̀̓̂ͭͭ'͕̻̗̦ͯ͗ͯ̓ͭ͗͛Ṉ̩̖̗̯̀̒ͧ̓ͮͨ̏̚O̼̘̟̩͙ͤͦ̈́̓ͩN̝̲͎̖͔͖ͥ̏͋ͯ̈̂̋̓̆ͅE͔͎̟͚͓̺͚ͨ͒ͥ̈́'̥̼̠̲̳͖̼͗ͥ͑  ͈͕ͪ̊̿̍ͯͮ̃̊}͕͉̝̜̦͖̰̻̜̓͛̀ */
                                ZALGO_RESPONSE += zalgo_mid.random();
                            for(var j=0; j<ZALGO_DOWN; j++)
                        ZALGO_RESPONSE += zalgo_down.random();
                    /*
                    J̨͜͡S ̕҉ŗo̧͟͢o͝m ͡é͢ń͝c̨̕ǫu̴͠
                    r͏͢a͡g͟͝es̨̨͡ ̷p̷̷͏e͘҉ǫ̷̀p̴ļ̸é͞ ͝t͢o̵͝ ̛͘͞c̷̀͘o͢͏̀m̷̀e̶ ͜ą́ǹ̨d͏ ̵̧͞a͘͠͠s͢͠͡k ̴q͞u̶̡͠ę̸͞s͠͡҉t̸į̵o̢ns͘ ̶t̵h̵̨̀à͢t̴ ̵͏a͘r̷e̛͝ ̵͟t͞o̧͝o͠ ͢s̸͢m̴a̷͝ll̴̴/̡bą͟͝d́l̶̨y͏ ́pu͘͝t̸͏͢ ͏̧f͏or͏ ̧m͠͏aį͢ņ͝.̴̶͝
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞O
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞0P
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞PLE
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞B̥̺̣̯̹̐̍͒̓ͥ̾e̹̳n͙̜j̼ͯͩ̄͑͆a͎̼̯̥̣m̖͓̖̀̋́ͮͦ̂i̪̥͉̬ͭ̔͌̓̐̿̋n̻̥̜͍͛̒ͨ̄̀ ̦͔͈͕̘̫G̝̞͓͙̖ͨͫͅr̘͛̓͗̅̈́̓̃u̐ͮ̐̒ẽ̝̩͇͚͎͐ṅ̥̮͓̩̰ͯ̆̽͒b͔̟͓ã̐̀̀̚uͣ̐̌͒̚ṁ͕͆̈̏ ̺̄͒̑̄͒̍H̫̐̃Ã͓L̞͍ͩ͒ͦ́P̳̖̺͍ͤͨ
                     */
        }
        return ZALGO_RESPONSE || /<([a-z]+) *[^\/]*?>/;




//////nnnooooooooo//oooooo/ooo////o



    };

    bot.addCommand(/*
                                            d̟̬̮o͎̪̻̘̘̫n̕'͙̬̜͍̜t̹̳̰̗̝̰͜ ̢̠̰̘͚͔l̩e҉̘̼̙ͅa̗̣̩v̞̝͍͝e͎͚̹͕͕̠͠ m̰̱͔̭̣͔e̶̻̱̭̜̗̙
                                            */


{
        name : 'zalgo',
        /*ZALGO*/
            fun : zalgo,
                permissions : {
                    del : 'NONE'/*ṇ̯̝̀v̝̘̦̺o͍̦̤͝k͎̺͕͇̗̼e̤̱ ̙̼͚ț̵̫̥̘̟͖h͕̯e̢ hi͚̣̲̘͇̻̗͘v̟e̺͉̙̰-̲m̛͈̩̝i̪̬̤n̼̣̼͈̟d̘̯̮̲̲̟ ͓̗r̨̬̜̘͕ͅͅe̹͓̱̯͓p̬̠r̠̪͉ḙ̱̭̻̗͔́ś̗̤̰͕̫̥è̖̫̹͙n̯̞̯̣̘̖t̷͓͕͖͖̰in̲̤̥͕͉̘͝g̹̜̭̩̯̯̝ ̰͎c͓͕̞͕̯h̩a̟̘͇̮̺̭̦o̭̣̺͠s̻ͅ.̱͙̥̭̙
̧͖̠̙I҉͕̗̝̝n̘̹v̞̣̝͔͍ọ̦̳̯͞k͖̫i͔n͇̟g̡͓ ̹̩the ͚̺͚̫̦f͕͕͔̜̼̞̀e̠͔̖̜͓̭̥e͏͙͈̦lin͎͉̭̮̫̹̝g͍̹͖ ̦͈̬̼̠͖óf̳̣̼͜ͅ ̨͎̼͇ͅc̦͞h̞̘̠̹̹̤ͅa̢̯o̫̱̼͉s̩͙͔͇̳̬̦.͏̞̫͇
̱͕̯̝̺̜W̢̘̹i͞t̬͔̬h̹̞̗̞ ͓͍̬́o̮͇͎̬u̲t̲͉̞̹̖̯̘ ̮̠͇o̘̪͙͜r̷̞̱͔d͍͢e҉̠͚r̫͙ͅ.̴̣
Th͎̯̠͚̥e̜̞͇͔̣ ̼̰͚̱̜̬͡ͅN̢̳̞͔e̴̩̠̖͎̤̬z̧̺̘͎̮̣ṕ͍̳̼̥͍e̝̟̻̳͕̱͍r̢̞̝̲̻d̶̫͉̮̙̯͔i̵̼͎̰̘̙̰*/
                        },
                            description : 'H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ http://stackoverflow.com/a/1732454/1216976'
                        }
                    )
        ;
        }
        )
        (
        )
        ;//t͕̥́h̡̠͔͕̳̳e҉̱͓̱̦è̟n̢̗͖̜̳d̺̖
/* jshint ignore:end */

};

},{}],53:[function(require,module,exports){
module.exports={
    "AED": true,
    "ANG": true,
    "ARS": true,
    "AUD": true,
    "BDT": true,
    "BGN": true,
    "BHD": true,
    "BND": true,
    "BOB": true,
    "BRL": true,
    "BWP": true,
    "CAD": true,
    "CHF": true,
    "CLP": true,
    "CNY": true,
    "COP": true,
    "CRC": true,
    "CZK": true,
    "DKK": true,
    "DOP": true,
    "DZD": true,
    "EEK": true,
    "EGP": true,
    "EUR": true,
    "FJD": true,
    "GBP": true,
    "HKD": true,
    "HNL": true,
    "HRK": true,
    "HUF": true,
    "IDR": true,
    "ILS": true,
    "INR": true,
    "JMD": true,
    "JOD": true,
    "JPY": true,
    "KES": true,
    "KRW": true,
    "KWD": true,
    "KYD": true,
    "KZT": true,
    "LBP": true,
    "LKR": true,
    "LTL": true,
    "LVL": true,
    "MAD": true,
    "MDL": true,
    "MKD": true,
    "MUR": true,
    "MVR": true,
    "MXN": true,
    "MYR": true,
    "NAD": true,
    "NGN": true,
    "NIO": true,
    "NIS": true,
    "NOK": true,
    "NPR": true,
    "NZD": true,
    "OMR": true,
    "PEN": true,
    "PGK": true,
    "PHP": true,
    "PKR": true,
    "PLN": true,
    "PYG": true,
    "QAR": true,
    "RON": true,
    "RSD": true,
    "RUB": true,
    "SAR": true,
    "SCR": true,
    "SEK": true,
    "SGD": true,
    "SKK": true,
    "SLL": true,
    "SVC": true,
    "THB": true,
    "TND": true,
    "TRY": true,
    "TTD": true,
    "TWD": true,
    "TZS": true,
    "UAH": true,
    "UGX": true,
    "USD": true,
    "UYU": true,
    "UZS": true,
    "VEF": true,
    "VND": true,
    "XOF": true,
    "YER": true,
    "ZAR": true,
    "ZMK": true
}

},{}],54:[function(require,module,exports){
module.exports={
    //euro €
    "\u20ac" : "EUR",

    //pound sterling £
    "\u00a3" : "GBP",
    //pound sterling ₤
    "\u20a4" : "GBP",

    //indian rupee ₨
    "\u20a8" : "INR",
    //indian rupee ₹
    "\u20b9" : "INR",

    //yen ¥
    '\u00a5' : "JPY",
    //double-width yen ￥
    '\uffe5' : "JPY",

    //israeli shekels ₪
    "\u20aa" : "ILS",

    //united states dollar $
    "\u0024" : "USD",
}

},{}],55:[function(require,module,exports){
module.exports={"quot":"\"","amp":"&","apos":"'","lt":"<","gt":">","nbsp":" ","iexcl":"¡","cent":"¢","pound":"£","curren":"¤","yen":"¥","brvbar":"¦","sect":"§","uml":"¨","copy":"©","ordf":"ª","laquo":"«","not":"¬","reg":"®","macr":"¯","deg":"°","plusmn":"±","sup2":"²","sup3":"³","acute":"´","micro":"µ","para":"¶","middot":"·","cedil":"¸","sup1":"¹","ordm":"º","raquo":"»","frac14":"¼","frac12":"½","frac34":"¾","iquest":"¿","Agrave":"À","Aacute":"Á","Acirc":"Â","Atilde":"Ã","Auml":"Ä","Aring":"Å","AElig":"Æ","Ccedil":"Ç","Egrave":"È","Eacute":"É","Ecirc":"Ê","Euml":"Ë","Igrave":"Ì","Iacute":"Í","Icirc":"Î","Iuml":"Ï","ETH":"Ð","Ntilde":"Ñ","Ograve":"Ò","Oacute":"Ó","Ocirc":"Ô","Otilde":"Õ","Ouml":"Ö","times":"×","Oslash":"Ø","Ugrave":"Ù","Uacute":"Ú","Ucirc":"Û","Uuml":"Ü","Yacute":"Ý","THORN":"Þ","szlig":"ß","agrave":"à","aacute":"á","acirc":"â","atilde":"ã","auml":"ä","aring":"å","aelig":"æ","ccedil":"ç","egrave":"è","eacute":"é","ecirc":"ê","euml":"ë","igrave":"ì","iacute":"í","icirc":"î","iuml":"ï","eth":"ð","ntilde":"ñ","ograve":"ò","oacute":"ó","ocirc":"ô","otilde":"õ","ouml":"ö","divide":"÷","oslash":"ø","ugrave":"ù","uacute":"ú","ucirc":"û","uuml":"ü","yacute":"ý","thorn":"þ","yuml":"ÿ","OElig":"Œ","oelig":"œ","Scaron":"Š","scaron":"š","Yuml":"Ÿ","fnof":"ƒ","circ":"ˆ","tilde":"˜","Alpha":"Α","Beta":"Β","Gamma":"Γ","Delta":"Δ","Epsilon":"Ε","Zeta":"Ζ","Eta":"Η","Theta":"Θ","Iota":"Ι","Kappa":"Κ","Lambda":"Λ","Mu":"Μ","Nu":"Ν","Xi":"Ξ","Omicron":"Ο","Pi":"Π","Rho":"Ρ","Sigma":"Σ","Tau":"Τ","Upsilon":"Υ","Phi":"Φ","Chi":"Χ","Psi":"Ψ","Omega":"Ω","alpha":"α","beta":"β","gamma":"γ","delta":"δ","epsilon":"ε","zeta":"ζ","eta":"η","theta":"θ","iota":"ι","kappa":"κ","lambda":"λ","mu":"μ","nu":"ν","xi":"ξ","omicron":"ο","pi":"π","rho":"ρ","sigmaf":"ς","sigma":"σ","tau":"τ","upsilon":"υ","phi":"φ","chi":"χ","psi":"ψ","omega":"ω","thetasym":"ϑ","upsih":"ϒ","piv":"ϖ","ensp":" ","emsp":" ","thinsp":" ","ndash":"–","mdash":"—","lsquo":"‘","rsquo":"’","sbquo":"‚","ldquo":"“","rdquo":"”","bdquo":"„","dagger":"†","Dagger":"‡","bull":"•","hellip":"…","permil":"‰","prime":"′","Prime":"″","lsaquo":"‹","rsaquo":"›","oline":"‾","frasl":"⁄","euro":"€","image":"ℑ","weierp":"℘","real":"ℜ","trade":"™","alefsym":"ℵ","larr":"←","uarr":"↑","rarr":"→","darr":"↓","harr":"↔","crarr":"↵","lArr":"⇐","uArr":"⇑","rArr":"⇒","dArr":"⇓","hArr":"⇔","forall":"∀","part":"∂","exist":"∃","empty":"∅","nabla":"∇","isin":"∈","notin":"∉","ni":"∋","prod":"∏","sum":"∑","minus":"−","lowast":"∗","radic":"√","prop":"∝","infin":"∞","ang":"∠","and":"∧","or":"∨","cap":"∩","cup":"∪","int":"∫","there4":"∴","sim":"∼","cong":"≅","asymp":"≈","ne":"≠","equiv":"≡","le":"≤","ge":"≥","sub":"⊂","sup":"⊃","nsub":"⊄","sube":"⊆","supe":"⊇","oplus":"⊕","otimes":"⊗","perp":"⊥","sdot":"⋅","lceil":"⌈","rceil":"⌉","lfloor":"⌊","rfloor":"⌋","lang":"〈","rang":"〉","loz":"◊","spades":"♠","clubs":"♣","hearts":"♥","diams":"♦", "zwnj":"", "zwsp":""};

},{}],56:[function(require,module,exports){
module.exports=[{"section":"introduction","name":"Introduction"},{"section":"x1","name":"1 Scope"},{"section":"x2","name":"2 Conformance"},{"section":"x3","name":"3 Normative references"},{"section":"x4","name":"4 Overview"},{"section":"x4.1","name":"4.1 Web Scripting"},{"section":"x4.2","name":"4.2 Language Overview"},{"section":"x4.2.1","name":"4.2.1 Objects"},{"section":"x4.2.2","name":"4.2.2 The Strict Variant of ECMAScript"},{"section":"x4.3","name":"4.3 Definitions"},{"section":"x4.3.1","name":"4.3.1 type"},{"section":"x4.3.2","name":"4.3.2 primitive value"},{"section":"x4.3.3","name":"4.3.3 object"},{"section":"x4.3.4","name":"4.3.4 constructor"},{"section":"x4.3.5","name":"4.3.5 prototype"},{"section":"x4.3.6","name":"4.3.6 native object"},{"section":"x4.3.7","name":"4.3.7 built-in object"},{"section":"x4.3.8","name":"4.3.8 host object"},{"section":"x4.3.9","name":"4.3.9 undefined value"},{"section":"x4.3.10","name":"4.3.10 Undefined type"},{"section":"x4.3.11","name":"4.3.11 null value"},{"section":"x4.3.12","name":"4.3.12 Null type"},{"section":"x4.3.13","name":"4.3.13 Boolean value"},{"section":"x4.3.14","name":"4.3.14 Boolean type"},{"section":"x4.3.15","name":"4.3.15 Boolean object"},{"section":"x4.3.16","name":"4.3.16 String value"},{"section":"x4.3.17","name":"4.3.17 String type"},{"section":"x4.3.18","name":"4.3.18 String object"},{"section":"x4.3.19","name":"4.3.19 Number value"},{"section":"x4.3.20","name":"4.3.20 Number type"},{"section":"x4.3.21","name":"4.3.21 Number object"},{"section":"x4.3.22","name":"4.3.22 Infinity"},{"section":"x4.3.23","name":"4.3.23 NaN"},{"section":"x4.3.24","name":"4.3.24 function"},{"section":"x4.3.25","name":"4.3.25 built-in function"},{"section":"x4.3.26","name":"4.3.26 property"},{"section":"x4.3.27","name":"4.3.27 method"},{"section":"x4.3.28","name":"4.3.28 built-in method"},{"section":"x4.3.29","name":"4.3.29 attribute"},{"section":"x4.3.30","name":"4.3.30 own property"},{"section":"x4.3.31","name":"4.3.31 inherited property"},{"section":"x5","name":"5 Notational Conventions"},{"section":"x5.1","name":"5.1 Syntactic and Lexical Grammars"},{"section":"x5.1.1","name":"5.1.1 Context-Free Grammars"},{"section":"x5.1.2","name":"5.1.2 The Lexical and RegExp Grammars"},{"section":"x5.1.3","name":"5.1.3 The Numeric String Grammar"},{"section":"x5.1.4","name":"5.1.4 The Syntactic Grammar"},{"section":"x5.1.5","name":"5.1.5 The JSON Grammar"},{"section":"x5.1.6","name":"5.1.6 Grammar Notation"},{"section":"x5.2","name":"5.2 Algorithm Conventions"},{"section":"x6","name":"6 Source Text"},{"section":"x7","name":"7 Lexical Conventions"},{"section":"x7.1","name":"7.1 Unicode Format-Control Characters"},{"section":"x7.2","name":"7.2 White Space"},{"section":"x7.3","name":"7.3 Line Terminators"},{"section":"x7.4","name":"7.4 Comments"},{"section":"x7.5","name":"7.5 Tokens"},{"section":"x7.6","name":"7.6 Identifier Names and Identifiers"},{"section":"x7.6.1","name":"7.6.1 Reserved Words"},{"section":"x7.6.1.1","name":"7.6.1.1 Keywords"},{"section":"x7.6.1.2","name":"7.6.1.2 Future Reserved Words"},{"section":"x7.7","name":"7.7 Punctuators"},{"section":"x7.8","name":"7.8 Literals"},{"section":"x7.8.1","name":"7.8.1 Null Literals"},{"section":"x7.8.2","name":"7.8.2 Boolean Literals"},{"section":"x7.8.3","name":"7.8.3 Numeric Literals"},{"section":"x7.8.4","name":"7.8.4 String Literals"},{"section":"x7.8.5","name":"7.8.5 Regular Expression Literals"},{"section":"x7.9","name":"7.9 Automatic Semicolon Insertion"},{"section":"x7.9.1","name":"7.9.1 Rules of Automatic Semicolon Insertion"},{"section":"x7.9.2","name":"7.9.2 Examples of Automatic Semicolon Insertion"},{"section":"x8","name":"8 Types"},{"section":"x8.1","name":"8.1 The Undefined Type"},{"section":"x8.2","name":"8.2 The Null Type"},{"section":"x8.3","name":"8.3 The Boolean Type"},{"section":"x8.4","name":"8.4 The String Type"},{"section":"x8.5","name":"8.5 The Number Type"},{"section":"x8.6","name":"8.6 The Object Type"},{"section":"x8.6.1","name":"8.6.1 Property Attributes"},{"section":"x8.6.2","name":"8.6.2 Object Internal Properties and Methods"},{"section":"x8.7","name":"8.7 The Reference Specification Type"},{"section":"x8.7.1","name":"8.7.1 GetValue (V)"},{"section":"x8.7.2","name":"8.7.2 PutValue (V, W)"},{"section":"x8.8","name":"8.8 The List Specification Type"},{"section":"x8.9","name":"8.9 The Completion Specification Type"},{"section":"x8.10","name":"8.10 The Property Descriptor and Property Identifier Specification Types"},{"section":"x8.10.1","name":"8.10.1 IsAccessorDescriptor ( Desc )"},{"section":"x8.10.2","name":"8.10.2 IsDataDescriptor ( Desc )"},{"section":"x8.10.3","name":"8.10.3 IsGenericDescriptor ( Desc )"},{"section":"x8.10.4","name":"8.10.4 FromPropertyDescriptor ( Desc )"},{"section":"x8.10.5","name":"8.10.5 ToPropertyDescriptor ( Obj )"},{"section":"x8.11","name":"8.11 The Lexical Environment and Environment Record Specification Types"},{"section":"x8.12","name":"8.12 Algorithms for Object Internal Methods"},{"section":"x8.12.1","name":"8.12.1 [[GetOwnProperty]] (P)"},{"section":"x8.12.2","name":"8.12.2 [[GetProperty]] (P)"},{"section":"x8.12.3","name":"8.12.3 [[Get]] (P)"},{"section":"x8.12.4","name":"8.12.4 [[CanPut]] (P)"},{"section":"x8.12.5","name":"8.12.5 [[Put]] ( P, V, Throw )"},{"section":"x8.12.6","name":"8.12.6 [[HasProperty]] (P)"},{"section":"x8.12.7","name":"8.12.7 [[Delete]] (P, Throw)"},{"section":"x8.12.8","name":"8.12.8 [[DefaultValue]] (hint)"},{"section":"x8.12.9","name":"8.12.9 [[DefineOwnProperty]] (P, Desc, Throw)"},{"section":"x9","name":"9 Type Conversion and Testing"},{"section":"x9.1","name":"9.1 ToPrimitive"},{"section":"x9.2","name":"9.2 ToBoolean"},{"section":"x9.3","name":"9.3 ToNumber"},{"section":"x9.3.1","name":"9.3.1 ToNumber Applied to the String Type"},{"section":"x9.4","name":"9.4 ToInteger"},{"section":"x9.5","name":"9.5 ToInt32: (Signed 32 Bit Integer)"},{"section":"x9.6","name":"9.6 ToUint32: (Unsigned 32 Bit Integer)"},{"section":"x9.7","name":"9.7 ToUint16: (Unsigned 16 Bit Integer)"},{"section":"x9.8","name":"9.8 ToString"},{"section":"x9.8.1","name":"9.8.1 ToString Applied to the Number Type"},{"section":"x9.9","name":"9.9 ToObject"},{"section":"x9.10","name":"9.10 CheckObjectCoercible"},{"section":"x9.11","name":"9.11 IsCallable"},{"section":"x9.12","name":"9.12 The SameValue Algorithm"},{"section":"x10","name":"10 Executable Code and Execution Contexts"},{"section":"x10.1","name":"10.1 Types of Executable Code"},{"section":"x10.1.1","name":"10.1.1 Strict Mode Code"},{"section":"x10.2","name":"10.2 Lexical Environments"},{"section":"x10.2.1","name":"10.2.1 Environment Records"},{"section":"x10.2.1.1","name":"10.2.1.1 Declarative Environment Records"},{"section":"x10.2.1.1.1","name":"10.2.1.1.1 HasBinding(N)"},{"section":"x10.2.1.1.2","name":"10.2.1.1.2 CreateMutableBinding (N, D)"},{"section":"x10.2.1.1.3","name":"10.2.1.1.3 SetMutableBinding (N,V,S)"},{"section":"x10.2.1.1.4","name":"10.2.1.1.4 GetBindingValue(N,S)"},{"section":"x10.2.1.1.5","name":"10.2.1.1.5 DeleteBinding (N)"},{"section":"x10.2.1.1.6","name":"10.2.1.1.6 ImplicitThisValue()"},{"section":"x10.2.1.1.7","name":"10.2.1.1.7 CreateImmutableBinding (N)"},{"section":"x10.2.1.1.8","name":"10.2.1.1.8 InitializeImmutableBinding (N,V)"},{"section":"x10.2.1.2","name":"10.2.1.2 Object Environment Records"},{"section":"x10.2.1.2.1","name":"10.2.1.2.1 HasBinding(N)"},{"section":"x10.2.1.2.2","name":"10.2.1.2.2 CreateMutableBinding (N, D)"},{"section":"x10.2.1.2.3","name":"10.2.1.2.3 SetMutableBinding (N,V,S)"},{"section":"x10.2.1.2.4","name":"10.2.1.2.4 GetBindingValue(N,S)"},{"section":"x10.2.1.2.5","name":"10.2.1.2.5 DeleteBinding (N)"},{"section":"x10.2.1.2.6","name":"10.2.1.2.6 ImplicitThisValue()"},{"section":"x10.2.2","name":"10.2.2 Lexical Environment Operations"},{"section":"x10.2.2.1","name":"10.2.2.1 GetIdentifierReference (lex, name, strict)"},{"section":"x10.2.2.2","name":"10.2.2.2 NewDeclarativeEnvironment (E)"},{"section":"x10.2.2.3","name":"10.2.2.3 NewObjectEnvironment (O, E)"},{"section":"x10.2.3","name":"10.2.3 The Global Environment"},{"section":"x10.3","name":"10.3 Execution Contexts"},{"section":"x10.3.1","name":"10.3.1 Identifier Resolution"},{"section":"x10.4","name":"10.4 Establishing an Execution Context"},{"section":"x10.4.1","name":"10.4.1 Entering Global Code"},{"section":"x10.4.1.1","name":"10.4.1.1 Initial Global Execution Context"},{"section":"x10.4.2","name":"10.4.2 Entering Eval Code"},{"section":"x10.4.2.1","name":"10.4.2.1 Strict Mode Restrictions"},{"section":"x10.4.3","name":"10.4.3 Entering Function Code"},{"section":"x10.5","name":"10.5 Declaration Binding Instantiation"},{"section":"x10.6","name":"10.6 Arguments Object"},{"section":"x11","name":"11 Expressions"},{"section":"x11.1","name":"11.1 Primary Expressions"},{"section":"x11.1.1","name":"11.1.1 The this Keyword"},{"section":"x11.1.2","name":"11.1.2 Identifier Reference"},{"section":"x11.1.3","name":"11.1.3 Literal Reference"},{"section":"x11.1.4","name":"11.1.4 Array Initialiser"},{"section":"x11.1.5","name":"11.1.5 Object Initialiser"},{"section":"x11.1.6","name":"11.1.6 The Grouping Operator"},{"section":"x11.2","name":"11.2 Left-Hand-Side Expressions"},{"section":"x11.2.1","name":"11.2.1 Property Accessors"},{"section":"x11.2.2","name":"11.2.2 The new Operator"},{"section":"x11.2.3","name":"11.2.3 Function Calls"},{"section":"x11.2.4","name":"11.2.4 Argument Lists"},{"section":"x11.2.5","name":"11.2.5 Function Expressions"},{"section":"x11.3","name":"11.3 Postfix Expressions"},{"section":"x11.3.1","name":"11.3.1 Postfix Increment Operator"},{"section":"x11.3.2","name":"11.3.2 Postfix Decrement Operator"},{"section":"x11.4","name":"11.4 Unary Operators"},{"section":"x11.4.1","name":"11.4.1 The delete Operator"},{"section":"x11.4.2","name":"11.4.2 The void Operator"},{"section":"x11.4.3","name":"11.4.3 The typeof Operator"},{"section":"x11.4.4","name":"11.4.4 Prefix Increment Operator"},{"section":"x11.4.5","name":"11.4.5 Prefix Decrement Operator"},{"section":"x11.4.6","name":"11.4.6 Unary + Operator"},{"section":"x11.4.7","name":"11.4.7 Unary - Operator"},{"section":"x11.4.8","name":"11.4.8 Bitwise NOT Operator ( ~ )"},{"section":"x11.4.9","name":"11.4.9 Logical NOT Operator ( ! )"},{"section":"x11.5","name":"11.5 Multiplicative Operators"},{"section":"x11.5.1","name":"11.5.1 Applying the * Operator"},{"section":"x11.5.2","name":"11.5.2 Applying the / Operator"},{"section":"x11.5.3","name":"11.5.3 Applying the % Operator"},{"section":"x11.6","name":"11.6 Additive Operators"},{"section":"x11.6.1","name":"11.6.1 The Addition operator ( + )"},{"section":"x11.6.2","name":"11.6.2 The Subtraction Operator ( - )"},{"section":"x11.6.3","name":"11.6.3 Applying the Additive Operators to Numbers"},{"section":"x11.7","name":"11.7 Bitwise Shift Operators"},{"section":"x11.7.1","name":"11.7.1 The Left Shift Operator ( << )"},{"section":"x11.7.2","name":"11.7.2 The Signed Right Shift Operator ( >> )"},{"section":"x11.7.3","name":"11.7.3 The Unsigned Right Shift Operator ( >>> )"},{"section":"x11.8","name":"11.8 Relational Operators"},{"section":"x11.8.1","name":"11.8.1 The Less-than Operator ( < )"},{"section":"x11.8.2","name":"11.8.2 The Greater-than Operator ( > )"},{"section":"x11.8.3","name":"11.8.3 The Less-than-or-equal Operator ( <= )"},{"section":"x11.8.4","name":"11.8.4 The Greater-than-or-equal Operator ( >= )"},{"section":"x11.8.5","name":"11.8.5 The Abstract Relational Comparison Algorithm"},{"section":"x11.8.6","name":"11.8.6 The instanceof operator"},{"section":"x11.8.7","name":"11.8.7 The in operator"},{"section":"x11.9","name":"11.9 Equality Operators"},{"section":"x11.9.1","name":"11.9.1 The Equals Operator ( == )"},{"section":"x11.9.2","name":"11.9.2 The Does-not-equals Operator ( != )"},{"section":"x11.9.3","name":"11.9.3 The Abstract Equality Comparison Algorithm"},{"section":"x11.9.4","name":"11.9.4 The Strict Equals Operator ( === )"},{"section":"x11.9.5","name":"11.9.5 The Strict Does-not-equal Operator ( !== )"},{"section":"x11.9.6","name":"11.9.6 The Strict Equality Comparison Algorithm"},{"section":"x11.10","name":"11.10 Binary Bitwise Operators"},{"section":"x11.11","name":"11.11 Binary Logical Operators"},{"section":"x11.12","name":"11.12 Conditional Operator ( ? : )"},{"section":"x11.13","name":"11.13 Assignment Operators"},{"section":"x11.13.1","name":"11.13.1 Simple Assignment ( = )"},{"section":"x11.13.2","name":"11.13.2 Compound Assignment ( op= )"},{"section":"x11.14","name":"11.14 Comma Operator ( , )"},{"section":"x12","name":"12 Statements"},{"section":"x12.1","name":"12.1 Block"},{"section":"x12.2","name":"12.2 Variable Statement"},{"section":"x12.2.1","name":"12.2.1 Strict Mode Restrictions"},{"section":"x12.3","name":"12.3 Empty Statement"},{"section":"x12.4","name":"12.4 Expression Statement"},{"section":"x12.5","name":"12.5 The if Statement"},{"section":"x12.6","name":"12.6 Iteration Statements"},{"section":"x12.6.1","name":"12.6.1 The do-while Statement"},{"section":"x12.6.2","name":"12.6.2 The while Statement"},{"section":"x12.6.3","name":"12.6.3 The for Statement"},{"section":"x12.6.4","name":"12.6.4 The for-in Statement"},{"section":"x12.7","name":"12.7 The continue Statement"},{"section":"x12.8","name":"12.8 The break Statement"},{"section":"x12.9","name":"12.9 The return Statement"},{"section":"x12.10","name":"12.10 The with Statement"},{"section":"x12.10.1","name":"12.10.1 Strict Mode Restrictions"},{"section":"x12.11","name":"12.11 The switch Statement"},{"section":"x12.12","name":"12.12 Labelled Statements"},{"section":"x12.13","name":"12.13 The throw Statement"},{"section":"x12.14","name":"12.14 The try Statement"},{"section":"x12.14.1","name":"12.14.1 Strict Mode Restrictions"},{"section":"x12.15","name":"12.15 The debugger statement"},{"section":"x13","name":"13 Function Definition"},{"section":"x13.1","name":"13.1 Strict Mode Restrictions"},{"section":"x13.2","name":"13.2 Creating Function Objects"},{"section":"x13.2.1","name":"13.2.1 [[Call]]"},{"section":"x13.2.2","name":"13.2.2 [[Construct]]"},{"section":"x13.2.3","name":"13.2.3 The Function Object"},{"section":"x14","name":"14 Program"},{"section":"x14.1","name":"14.1 Directive Prologues and the Use Strict Directive"},{"section":"x15","name":"15 Standard Built-in ECMAScript Objects"},{"section":"x15.1","name":"15.1 The Global Object"},{"section":"x15.1.1","name":"15.1.1 Value Properties of the Global Object"},{"section":"x15.1.1.1","name":"15.1.1.1 NaN"},{"section":"x15.1.1.2","name":"15.1.1.2 Infinity"},{"section":"x15.1.1.3","name":"15.1.1.3 undefined"},{"section":"x15.1.2","name":"15.1.2 Function Properties of the Global Object"},{"section":"x15.1.2.1","name":"15.1.2.1 eval (x)"},{"section":"x15.1.2.1.1","name":"15.1.2.1.1 Direct Call to Eval"},{"section":"x15.1.2.2","name":"15.1.2.2 parseInt (string , radix)"},{"section":"x15.1.2.3","name":"15.1.2.3 parseFloat (string)"},{"section":"x15.1.2.4","name":"15.1.2.4 isNaN (number)"},{"section":"x15.1.2.5","name":"15.1.2.5 isFinite (number)"},{"section":"x15.1.3","name":"15.1.3 URI Handling Function Properties"},{"section":"x15.1.3.1","name":"15.1.3.1 decodeURI (encodedURI)"},{"section":"x15.1.3.2","name":"15.1.3.2 decodeURIComponent (encodedURIComponent)"},{"section":"x15.1.3.3","name":"15.1.3.3 encodeURI (uri)"},{"section":"x15.1.3.4","name":"15.1.3.4 encodeURIComponent (uriComponent)"},{"section":"x15.1.4","name":"15.1.4 Constructor Properties of the Global Object"},{"section":"x15.1.4.1","name":"15.1.4.1 Object ( . . . )"},{"section":"x15.1.4.2","name":"15.1.4.2 Function ( . . . )"},{"section":"x15.1.4.3","name":"15.1.4.3 Array ( . . . )"},{"section":"x15.1.4.4","name":"15.1.4.4 String ( . . . )"},{"section":"x15.1.4.5","name":"15.1.4.5 Boolean ( . . . )"},{"section":"x15.1.4.6","name":"15.1.4.6 Number ( . . . )"},{"section":"x15.1.4.7","name":"15.1.4.7 Date ( . . . )"},{"section":"x15.1.4.8","name":"15.1.4.8 RegExp ( . . . )"},{"section":"x15.1.4.9","name":"15.1.4.9 Error ( . . . )"},{"section":"x15.1.4.10","name":"15.1.4.10 EvalError ( . . . )"},{"section":"x15.1.4.11","name":"15.1.4.11 RangeError ( . . . )"},{"section":"x15.1.4.12","name":"15.1.4.12 ReferenceError ( . . . )"},{"section":"x15.1.4.13","name":"15.1.4.13 SyntaxError ( . . . )"},{"section":"x15.1.4.14","name":"15.1.4.14 TypeError ( . . . )"},{"section":"x15.1.4.15","name":"15.1.4.15 URIError ( . . . )"},{"section":"x15.1.5","name":"15.1.5 Other Properties of the Global Object"},{"section":"x15.1.5.1","name":"15.1.5.1 Math"},{"section":"x15.1.5.2","name":"15.1.5.2 JSON"},{"section":"x15.2","name":"15.2 Object Objects"},{"section":"x15.2.1","name":"15.2.1 The Object Constructor Called as a Function"},{"section":"x15.2.1.1","name":"15.2.1.1 Object ( [ value ] )"},{"section":"x15.2.2","name":"15.2.2 The Object Constructor"},{"section":"x15.2.2.1","name":"15.2.2.1 new Object ( [ value ] )"},{"section":"x15.2.3","name":"15.2.3 Properties of the Object Constructor"},{"section":"x15.2.3.1","name":"15.2.3.1 Object.prototype"},{"section":"x15.2.3.2","name":"15.2.3.2 Object.getPrototypeOf ( O )"},{"section":"x15.2.3.3","name":"15.2.3.3 Object.getOwnPropertyDescriptor ( O, P ) "},{"section":"x15.2.3.4","name":"15.2.3.4 Object.getOwnPropertyNames ( O )"},{"section":"x15.2.3.5","name":"15.2.3.5 Object.create ( O [, Properties] )"},{"section":"x15.2.3.6","name":"15.2.3.6 Object.defineProperty ( O, P, Attributes )"},{"section":"x15.2.3.7","name":"15.2.3.7 Object.defineProperties ( O, Properties )"},{"section":"x15.2.3.8","name":"15.2.3.8 Object.seal ( O )"},{"section":"x15.2.3.9","name":"15.2.3.9 Object.freeze ( O )"},{"section":"x15.2.3.10","name":"15.2.3.10 Object.preventExtensions ( O )"},{"section":"x15.2.3.11","name":"15.2.3.11 Object.isSealed ( O )"},{"section":"x15.2.3.12","name":"15.2.3.12 Object.isFrozen ( O )"},{"section":"x15.2.3.13","name":"15.2.3.13 Object.isExtensible ( O )"},{"section":"x15.2.3.14","name":"15.2.3.14 Object.keys ( O )"},{"section":"x15.2.4","name":"15.2.4 Properties of the Object Prototype Object"},{"section":"x15.2.4.1","name":"15.2.4.1 Object.prototype.constructor"},{"section":"x15.2.4.2","name":"15.2.4.2 Object.prototype.toString ( )"},{"section":"x15.2.4.3","name":"15.2.4.3 Object.prototype.toLocaleString ( )"},{"section":"x15.2.4.4","name":"15.2.4.4 Object.prototype.valueOf ( )"},{"section":"x15.2.4.5","name":"15.2.4.5 Object.prototype.hasOwnProperty (V)"},{"section":"x15.2.4.6","name":"15.2.4.6 Object.prototype.isPrototypeOf (V)"},{"section":"x15.2.4.7","name":"15.2.4.7 Object.prototype.propertyIsEnumerable (V)"},{"section":"x15.2.5","name":"15.2.5 Properties of Object Instances"},{"section":"x15.3","name":"15.3 Function Objects"},{"section":"x15.3.1","name":"15.3.1 The Function Constructor Called as a Function"},{"section":"x15.3.1.1","name":"15.3.1.1 Function (p1, p2, … , pn, body)"},{"section":"x15.3.2","name":"15.3.2 The Function Constructor"},{"section":"x15.3.2.1","name":"15.3.2.1 new Function (p1, p2, … , pn, body)"},{"section":"x15.3.3","name":"15.3.3 Properties of the Function Constructor"},{"section":"x15.3.3.1","name":"15.3.3.1 Function.prototype"},{"section":"x15.3.3.2","name":"15.3.3.2 Function.length"},{"section":"x15.3.4","name":"15.3.4 Properties of the Function Prototype Object"},{"section":"x15.3.4.1","name":"15.3.4.1 Function.prototype.constructor"},{"section":"x15.3.4.2","name":"15.3.4.2 Function.prototype.toString ( )"},{"section":"x15.3.4.3","name":"15.3.4.3 Function.prototype.apply (thisArg, argArray)"},{"section":"x15.3.4.4","name":"15.3.4.4 Function.prototype.call (thisArg [ , arg1 [ , arg2, … ] ] )"},{"section":"x15.3.4.5","name":"15.3.4.5 Function.prototype.bind (thisArg [, arg1 [, arg2, …]])"},{"section":"x15.3.4.5.1","name":"15.3.4.5.1 [[Call]]"},{"section":"x15.3.4.5.2","name":"15.3.4.5.2 [[Construct]]"},{"section":"x15.3.4.5.3","name":"15.3.4.5.3 [[HasInstance]] (V)"},{"section":"x15.3.5","name":"15.3.5 Properties of Function Instances"},{"section":"x15.3.5.1","name":"15.3.5.1 length"},{"section":"x15.3.5.2","name":"15.3.5.2 prototype"},{"section":"x15.3.5.3","name":"15.3.5.3 [[HasInstance]] (V)"},{"section":"x15.3.5.4","name":"15.3.5.4 [[Get]] (P)"},{"section":"x15.4","name":"15.4 Array Objects"},{"section":"x15.4.1","name":"15.4.1 The Array Constructor Called as a Function"},{"section":"x15.4.1.1","name":"15.4.1.1 Array ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.2","name":"15.4.2 The Array Constructor"},{"section":"x15.4.2.1","name":"15.4.2.1 new Array ( [ item0 [ , item1 [ , … ] ] ] )"},{"section":"x15.4.2.2","name":"15.4.2.2 new Array (len)"},{"section":"x15.4.3","name":"15.4.3 Properties of the Array Constructor"},{"section":"x15.4.3.1","name":"15.4.3.1 Array.prototype"},{"section":"x15.4.3.2","name":"15.4.3.2 Array.isArray ( arg )"},{"section":"x15.4.4","name":"15.4.4 Properties of the Array Prototype Object"},{"section":"x15.4.4.1","name":"15.4.4.1 Array.prototype.constructor"},{"section":"x15.4.4.2","name":"15.4.4.2 Array.prototype.toString ( )"},{"section":"x15.4.4.3","name":"15.4.4.3 Array.prototype.toLocaleString ( )"},{"section":"x15.4.4.4","name":"15.4.4.4 Array.prototype.concat ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.5","name":"15.4.4.5 Array.prototype.join (separator)"},{"section":"x15.4.4.6","name":"15.4.4.6 Array.prototype.pop ( )"},{"section":"x15.4.4.7","name":"15.4.4.7 Array.prototype.push ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.8","name":"15.4.4.8 Array.prototype.reverse ( )"},{"section":"x15.4.4.9","name":"15.4.4.9 Array.prototype.shift ( )"},{"section":"x15.4.4.10","name":"15.4.4.10 Array.prototype.slice (start, end)"},{"section":"x15.4.4.11","name":"15.4.4.11 Array.prototype.sort (comparefn)"},{"section":"x15.4.4.12","name":"15.4.4.12 Array.prototype.splice (start, deleteCount [ , item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.13","name":"15.4.4.13 Array.prototype.unshift ( [ item1 [ , item2 [ , … ] ] ] )"},{"section":"x15.4.4.14","name":"15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )"},{"section":"x15.4.4.15","name":"15.4.4.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )"},{"section":"x15.4.4.16","name":"15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.17","name":"15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.18","name":"15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.19","name":"15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.20","name":"15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )"},{"section":"x15.4.4.21","name":"15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )"},{"section":"x15.4.4.22","name":"15.4.4.22 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )"},{"section":"x15.4.5","name":"15.4.5 Properties of Array Instances"},{"section":"x15.4.5.1","name":"15.4.5.1 [[DefineOwnProperty]] ( P, Desc, Throw )"},{"section":"x15.4.5.2","name":"15.4.5.2 length"},{"section":"x15.5","name":"15.5 String Objects"},{"section":"x15.5.1","name":"15.5.1 The String Constructor Called as a Function"},{"section":"x15.5.1.1","name":"15.5.1.1 String ( [ value ] )"},{"section":"x15.5.2","name":"15.5.2 The String Constructor"},{"section":"x15.5.2.1","name":"15.5.2.1 new String ( [ value ] )"},{"section":"x15.5.3","name":"15.5.3 Properties of the String Constructor"},{"section":"x15.5.3.1","name":"15.5.3.1 String.prototype"},{"section":"x15.5.3.2","name":"15.5.3.2 String.fromCharCode ( [ char0 [ , char1 [ , … ] ] ] )"},{"section":"x15.5.4","name":"15.5.4 Properties of the String Prototype Object"},{"section":"x15.5.4.1","name":"15.5.4.1 String.prototype.constructor"},{"section":"x15.5.4.2","name":"15.5.4.2 String.prototype.toString ( )"},{"section":"x15.5.4.3","name":"15.5.4.3 String.prototype.valueOf ( )"},{"section":"x15.5.4.4","name":"15.5.4.4 String.prototype.charAt (pos)"},{"section":"x15.5.4.5","name":"15.5.4.5 String.prototype.charCodeAt (pos)"},{"section":"x15.5.4.6","name":"15.5.4.6 String.prototype.concat ( [ string1 [ , string2 [ , … ] ] ] )"},{"section":"x15.5.4.7","name":"15.5.4.7 String.prototype.indexOf (searchString, position)"},{"section":"x15.5.4.8","name":"15.5.4.8 String.prototype.lastIndexOf (searchString, position)"},{"section":"x15.5.4.9","name":"15.5.4.9 String.prototype.localeCompare (that)"},{"section":"x15.5.4.10","name":"15.5.4.10 String.prototype.match (regexp)"},{"section":"x15.5.4.11","name":"15.5.4.11 String.prototype.replace (searchValue, replaceValue)"},{"section":"x15.5.4.12","name":"15.5.4.12 String.prototype.search (regexp)"},{"section":"x15.5.4.13","name":"15.5.4.13 String.prototype.slice (start, end)"},{"section":"x15.5.4.14","name":"15.5.4.14 String.prototype.split (separator, limit)"},{"section":"x15.5.4.15","name":"15.5.4.15 String.prototype.substring (start, end)"},{"section":"x15.5.4.16","name":"15.5.4.16 String.prototype.toLowerCase ( )"},{"section":"x15.5.4.17","name":"15.5.4.17 String.prototype.toLocaleLowerCase ( )"},{"section":"x15.5.4.18","name":"15.5.4.18 String.prototype.toUpperCase ( )"},{"section":"x15.5.4.19","name":"15.5.4.19 String.prototype.toLocaleUpperCase ( )"},{"section":"x15.5.4.20","name":"15.5.4.20 String.prototype.trim ( )"},{"section":"x15.5.5","name":"15.5.5 Properties of String Instances"},{"section":"x15.5.5.1","name":"15.5.5.1 length"},{"section":"x15.5.5.2","name":"15.5.5.2 [[GetOwnProperty]] ( P )"},{"section":"x15.6","name":"15.6 Boolean Objects"},{"section":"x15.6.1","name":"15.6.1 The Boolean Constructor Called as a Function"},{"section":"x15.6.1.1","name":"15.6.1.1 Boolean (value)"},{"section":"x15.6.2","name":"15.6.2 The Boolean Constructor"},{"section":"x15.6.2.1","name":"15.6.2.1 new Boolean (value)"},{"section":"x15.6.3","name":"15.6.3 Properties of the Boolean Constructor"},{"section":"x15.6.3.1","name":"15.6.3.1 Boolean.prototype"},{"section":"x15.6.4","name":"15.6.4 Properties of the Boolean Prototype Object"},{"section":"x15.6.4.1","name":"15.6.4.1 Boolean.prototype.constructor"},{"section":"x15.6.4.2","name":"15.6.4.2 Boolean.prototype.toString ( )"},{"section":"x15.6.4.3","name":"15.6.4.3 Boolean.prototype.valueOf ( )"},{"section":"x15.6.5","name":"15.6.5 Properties of Boolean Instances"},{"section":"x15.7","name":"15.7 Number Objects"},{"section":"x15.7.1","name":"15.7.1 The Number Constructor Called as a Function"},{"section":"x15.7.1.1","name":"15.7.1.1 Number ( [ value ] )"},{"section":"x15.7.2","name":"15.7.2 The Number Constructor"},{"section":"x15.7.2.1","name":"15.7.2.1 new Number ( [ value ] )"},{"section":"x15.7.3","name":"15.7.3 Properties of the Number Constructor"},{"section":"x15.7.3.1","name":"15.7.3.1 Number.prototype"},{"section":"x15.7.3.2","name":"15.7.3.2 Number.MAX_VALUE"},{"section":"x15.7.3.3","name":"15.7.3.3 Number.MIN_VALUE"},{"section":"x15.7.3.4","name":"15.7.3.4 Number.NaN"},{"section":"x15.7.3.5","name":"15.7.3.5 Number.NEGATIVE_INFINITY"},{"section":"x15.7.3.6","name":"15.7.3.6 Number.POSITIVE_INFINITY"},{"section":"x15.7.4","name":"15.7.4 Properties of the Number Prototype Object"},{"section":"x15.7.4.1","name":"15.7.4.1 Number.prototype.constructor"},{"section":"x15.7.4.2","name":"15.7.4.2 Number.prototype.toString ( [ radix ] )"},{"section":"x15.7.4.3","name":"15.7.4.3 Number.prototype.toLocaleString()"},{"section":"x15.7.4.4","name":"15.7.4.4 Number.prototype.valueOf ( )"},{"section":"x15.7.4.5","name":"15.7.4.5 Number.prototype.toFixed (fractionDigits)"},{"section":"x15.7.4.6","name":"15.7.4.6 Number.prototype.toExponential (fractionDigits)"},{"section":"x15.7.4.7","name":"15.7.4.7 Number.prototype.toPrecision (precision)"},{"section":"x15.7.5","name":"15.7.5 Properties of Number Instances"},{"section":"x15.8","name":"15.8 The Math Object"},{"section":"x15.8.1","name":"15.8.1 Value Properties of the Math Object"},{"section":"x15.8.1.1","name":"15.8.1.1 E"},{"section":"x15.8.1.2","name":"15.8.1.2 LN10"},{"section":"x15.8.1.3","name":"15.8.1.3 LN2"},{"section":"x15.8.1.4","name":"15.8.1.4 LOG2E"},{"section":"x15.8.1.5","name":"15.8.1.5 LOG10E"},{"section":"x15.8.1.6","name":"15.8.1.6 PI"},{"section":"x15.8.1.7","name":"15.8.1.7 SQRT1_2"},{"section":"x15.8.1.8","name":"15.8.1.8 SQRT2"},{"section":"x15.8.2","name":"15.8.2 Function Properties of the Math Object"},{"section":"x15.8.2.1","name":"15.8.2.1 abs (x)"},{"section":"x15.8.2.2","name":"15.8.2.2 acos (x)"},{"section":"x15.8.2.3","name":"15.8.2.3 asin (x)"},{"section":"x15.8.2.4","name":"15.8.2.4 atan (x)"},{"section":"x15.8.2.5","name":"15.8.2.5 atan2 (y, x)"},{"section":"x15.8.2.6","name":"15.8.2.6 ceil (x)"},{"section":"x15.8.2.7","name":"15.8.2.7 cos (x)"},{"section":"x15.8.2.8","name":"15.8.2.8 exp (x)"},{"section":"x15.8.2.9","name":"15.8.2.9 floor (x)"},{"section":"x15.8.2.10","name":"15.8.2.10 log (x)"},{"section":"x15.8.2.11","name":"15.8.2.11 max ( [ value1 [ , value2 [ , … ] ] ] )"},{"section":"x15.8.2.12","name":"15.8.2.12 min ( [ value1 [ , value2 [ , … ] ] ] )"},{"section":"x15.8.2.13","name":"15.8.2.13 pow (x, y)"},{"section":"x15.8.2.14","name":"15.8.2.14 random ( )"},{"section":"x15.8.2.15","name":"15.8.2.15 round (x)"},{"section":"x15.8.2.16","name":"15.8.2.16 sin (x)"},{"section":"x15.8.2.17","name":"15.8.2.17 sqrt (x)"},{"section":"x15.8.2.18","name":"15.8.2.18 tan (x)"},{"section":"x15.9","name":"15.9 Date Objects"},{"section":"x15.9.1","name":"15.9.1 Overview of Date Objects and Definitions of Abstract Operators"},{"section":"x15.9.1.1","name":"15.9.1.1 Time Values and Time Range"},{"section":"x15.9.1.2","name":"15.9.1.2 Day Number and Time within Day"},{"section":"x15.9.1.3","name":"15.9.1.3 Year Number"},{"section":"x15.9.1.4","name":"15.9.1.4 Month Number"},{"section":"x15.9.1.5","name":"15.9.1.5 Date Number"},{"section":"x15.9.1.6","name":"15.9.1.6 Week Day"},{"section":"x15.9.1.7","name":"15.9.1.7 Local Time Zone Adjustment"},{"section":"x15.9.1.8","name":"15.9.1.8 Daylight Saving Time Adjustment"},{"section":"x15.9.1.9","name":"15.9.1.9 Local Time"},{"section":"x15.9.1.10","name":"15.9.1.10 Hours, Minutes, Second, and Milliseconds"},{"section":"x15.9.1.11","name":"15.9.1.11 MakeTime (hour, min, sec, ms)"},{"section":"x15.9.1.12","name":"15.9.1.12 MakeDay (year, month, date)"},{"section":"x15.9.1.13","name":"15.9.1.13 MakeDate (day, time)"},{"section":"x15.9.1.14","name":"15.9.1.14 TimeClip (time)"},{"section":"x15.9.1.15","name":"15.9.1.15 Date Time String Format"},{"section":"x15.9.1.15.1","name":"15.9.1.15.1 Extended years"},{"section":"x15.9.2","name":"15.9.2 The Date Constructor Called as a Function"},{"section":"x15.9.2.1","name":"15.9.2.1 Date ( [ year [, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ] ] ] )"},{"section":"x15.9.3","name":"15.9.3 The Date Constructor"},{"section":"x15.9.3.1","name":"15.9.3.1 new Date (year, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ] )"},{"section":"x15.9.3.2","name":"15.9.3.2 new Date (value)"},{"section":"x15.9.3.3","name":"15.9.3.3 new Date ( )"},{"section":"x15.9.4","name":"15.9.4 Properties of the Date Constructor"},{"section":"x15.9.4.1","name":"15.9.4.1 Date.prototype"},{"section":"x15.9.4.2","name":"15.9.4.2 Date.parse (string)"},{"section":"x15.9.4.3","name":"15.9.4.3 Date.UTC (year, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ])"},{"section":"x15.9.4.4","name":"15.9.4.4 Date.now ( )"},{"section":"x15.9.5","name":"15.9.5 Properties of the Date Prototype Object"},{"section":"x15.9.5.1","name":"15.9.5.1 Date.prototype.constructor"},{"section":"x15.9.5.2","name":"15.9.5.2 Date.prototype.toString ( )"},{"section":"x15.9.5.3","name":"15.9.5.3 Date.prototype.toDateString ( )"},{"section":"x15.9.5.4","name":"15.9.5.4 Date.prototype.toTimeString ( )"},{"section":"x15.9.5.5","name":"15.9.5.5 Date.prototype.toLocaleString ( )"},{"section":"x15.9.5.6","name":"15.9.5.6 Date.prototype.toLocaleDateString ( )"},{"section":"x15.9.5.7","name":"15.9.5.7 Date.prototype.toLocaleTimeString ( )"},{"section":"x15.9.5.8","name":"15.9.5.8 Date.prototype.valueOf ( )"},{"section":"x15.9.5.9","name":"15.9.5.9 Date.prototype.getTime ( )"},{"section":"x15.9.5.10","name":"15.9.5.10 Date.prototype.getFullYear ( )"},{"section":"x15.9.5.11","name":"15.9.5.11 Date.prototype.getUTCFullYear ( )"},{"section":"x15.9.5.12","name":"15.9.5.12 Date.prototype.getMonth ( )"},{"section":"x15.9.5.13","name":"15.9.5.13 Date.prototype.getUTCMonth ( )"},{"section":"x15.9.5.14","name":"15.9.5.14 Date.prototype.getDate ( )"},{"section":"x15.9.5.15","name":"15.9.5.15 Date.prototype.getUTCDate ( )"},{"section":"x15.9.5.16","name":"15.9.5.16 Date.prototype.getDay ( )"},{"section":"x15.9.5.17","name":"15.9.5.17 Date.prototype.getUTCDay ( )"},{"section":"x15.9.5.18","name":"15.9.5.18 Date.prototype.getHours ( )"},{"section":"x15.9.5.19","name":"15.9.5.19 Date.prototype.getUTCHours ( )"},{"section":"x15.9.5.20","name":"15.9.5.20 Date.prototype.getMinutes ( )"},{"section":"x15.9.5.21","name":"15.9.5.21 Date.prototype.getUTCMinutes ( )"},{"section":"x15.9.5.22","name":"15.9.5.22 Date.prototype.getSeconds ( )"},{"section":"x15.9.5.23","name":"15.9.5.23 Date.prototype.getUTCSeconds ( )"},{"section":"x15.9.5.24","name":"15.9.5.24 Date.prototype.getMilliseconds ( )"},{"section":"x15.9.5.25","name":"15.9.5.25 Date.prototype.getUTCMilliseconds ( )"},{"section":"x15.9.5.26","name":"15.9.5.26 Date.prototype.getTimezoneOffset ( )"},{"section":"x15.9.5.27","name":"15.9.5.27 Date.prototype.setTime (time)"},{"section":"x15.9.5.28","name":"15.9.5.28 Date.prototype.setMilliseconds (ms)"},{"section":"x15.9.5.29","name":"15.9.5.29 Date.prototype.setUTCMilliseconds (ms)"},{"section":"x15.9.5.30","name":"15.9.5.30 Date.prototype.setSeconds (sec [, ms ] )"},{"section":"x15.9.5.31","name":"15.9.5.31 Date.prototype.setUTCSeconds (sec [, ms ] )"},{"section":"x15.9.5.32","name":"15.9.5.32 Date.prototype.setMinutes (min [, sec [, ms ] ] )"},{"section":"x15.9.5.33","name":"15.9.5.33 Date.prototype.setUTCMinutes (min [, sec [, ms ] ] )"},{"section":"x15.9.5.34","name":"15.9.5.34 Date.prototype.setHours (hour [, min [, sec [, ms ] ] ] )"},{"section":"x15.9.5.35","name":"15.9.5.35 Date.prototype.setUTCHours (hour [, min [, sec [, ms ] ] ] )"},{"section":"x15.9.5.36","name":"15.9.5.36 Date.prototype.setDate (date)"},{"section":"x15.9.5.37","name":"15.9.5.37 Date.prototype.setUTCDate (date)"},{"section":"x15.9.5.38","name":"15.9.5.38 Date.prototype.setMonth (month [, date ] )"},{"section":"x15.9.5.39","name":"15.9.5.39 Date.prototype.setUTCMonth (month [, date ] )"},{"section":"x15.9.5.40","name":"15.9.5.40 Date.prototype.setFullYear (year [, month [, date ] ] )"},{"section":"x15.9.5.41","name":"15.9.5.41 Date.prototype.setUTCFullYear (year [, month [, date ] ] )"},{"section":"x15.9.5.42","name":"15.9.5.42 Date.prototype.toUTCString ( )"},{"section":"x15.9.5.43","name":"15.9.5.43 Date.prototype.toISOString ( )"},{"section":"x15.9.5.44","name":"15.9.5.44 Date.prototype.toJSON ( key )"},{"section":"x15.9.6","name":"15.9.6 Properties of Date Instances"},{"section":"x15.10","name":"15.10 RegExp (Regular Expression) Objects"},{"section":"x15.10.1","name":"15.10.1 Patterns"},{"section":"x15.10.2","name":"15.10.2 Pattern Semantics"},{"section":"x15.10.2.1","name":"15.10.2.1 Notation"},{"section":"x15.10.2.2","name":"15.10.2.2 Pattern"},{"section":"x15.10.2.3","name":"15.10.2.3 Disjunction"},{"section":"x15.10.2.4","name":"15.10.2.4 Alternative"},{"section":"x15.10.2.5","name":"15.10.2.5 Term"},{"section":"x15.10.2.6","name":"15.10.2.6 Assertion"},{"section":"x15.10.2.7","name":"15.10.2.7 Quantifier"},{"section":"x15.10.2.8","name":"15.10.2.8 Atom"},{"section":"x15.10.2.9","name":"15.10.2.9 AtomEscape"},{"section":"x15.10.2.10","name":"15.10.2.10 CharacterEscape"},{"section":"x15.10.2.11","name":"15.10.2.11 DecimalEscape"},{"section":"x15.10.2.12","name":"15.10.2.12 CharacterClassEscape"},{"section":"x15.10.2.13","name":"15.10.2.13 CharacterClass"},{"section":"x15.10.2.14","name":"15.10.2.14 ClassRanges"},{"section":"x15.10.2.15","name":"15.10.2.15 NonemptyClassRanges"},{"section":"x15.10.2.16","name":"15.10.2.16 NonemptyClassRangesNoDash"},{"section":"x15.10.2.17","name":"15.10.2.17 ClassAtom"},{"section":"x15.10.2.18","name":"15.10.2.18 ClassAtomNoDash"},{"section":"x15.10.2.19","name":"15.10.2.19 ClassEscape"},{"section":"x15.10.3","name":"15.10.3 The RegExp Constructor Called as a Function"},{"section":"x15.10.3.1","name":"15.10.3.1 RegExp(pattern, flags)"},{"section":"x15.10.4","name":"15.10.4 The RegExp Constructor"},{"section":"x15.10.4.1","name":"15.10.4.1 new RegExp(pattern, flags)"},{"section":"x15.10.5","name":"15.10.5 Properties of the RegExp Constructor"},{"section":"x15.10.5.1","name":"15.10.5.1 RegExp.prototype"},{"section":"x15.10.6","name":"15.10.6 Properties of the RegExp Prototype Object"},{"section":"x15.10.6.1","name":"15.10.6.1 RegExp.prototype.constructor"},{"section":"x15.10.6.2","name":"15.10.6.2 RegExp.prototype.exec(string)"},{"section":"x15.10.6.3","name":"15.10.6.3 RegExp.prototype.test(string)"},{"section":"x15.10.6.4","name":"15.10.6.4 RegExp.prototype.toString()"},{"section":"x15.10.7","name":"15.10.7 Properties of RegExp Instances"},{"section":"x15.10.7.1","name":"15.10.7.1 source"},{"section":"x15.10.7.2","name":"15.10.7.2 global"},{"section":"x15.10.7.3","name":"15.10.7.3 ignoreCase"},{"section":"x15.10.7.4","name":"15.10.7.4 multiline"},{"section":"x15.10.7.5","name":"15.10.7.5 lastIndex"},{"section":"x15.11","name":"15.11 Error Objects"},{"section":"x15.11.1","name":"15.11.1 The Error Constructor Called as a Function"},{"section":"x15.11.1.1","name":"15.11.1.1 Error (message)"},{"section":"x15.11.2","name":"15.11.2 The Error Constructor"},{"section":"x15.11.2.1","name":"15.11.2.1 new Error (message)"},{"section":"x15.11.3","name":"15.11.3 Properties of the Error Constructor"},{"section":"x15.11.3.1","name":"15.11.3.1 Error.prototype"},{"section":"x15.11.4","name":"15.11.4 Properties of the Error Prototype Object"},{"section":"x15.11.4.1","name":"15.11.4.1 Error.prototype.constructor"},{"section":"x15.11.4.2","name":"15.11.4.2 Error.prototype.name"},{"section":"x15.11.4.3","name":"15.11.4.3 Error.prototype.message"},{"section":"x15.11.4.4","name":"15.11.4.4 Error.prototype.toString ( )"},{"section":"x15.11.5","name":"15.11.5 Properties of Error Instances"},{"section":"x15.11.6","name":"15.11.6 Native Error Types Used in This Standard"},{"section":"x15.11.6.1","name":"15.11.6.1 EvalError"},{"section":"x15.11.6.2","name":"15.11.6.2 RangeError"},{"section":"x15.11.6.3","name":"15.11.6.3 ReferenceError"},{"section":"x15.11.6.4","name":"15.11.6.4 SyntaxError"},{"section":"x15.11.6.5","name":"15.11.6.5 TypeError"},{"section":"x15.11.6.6","name":"15.11.6.6 URIError"},{"section":"x15.11.7","name":"15.11.7 NativeError Object Structure"},{"section":"x15.11.7.1","name":"15.11.7.1 NativeError Constructors Called as Functions"},{"section":"x15.11.7.2","name":"15.11.7.2 NativeError (message)"},{"section":"x15.11.7.3","name":"15.11.7.3 The NativeError Constructors"},{"section":"x15.11.7.4","name":"15.11.7.4 New NativeError (message)"},{"section":"x15.11.7.5","name":"15.11.7.5 Properties of the NativeError Constructors"},{"section":"x15.11.7.6","name":"15.11.7.6 NativeError.prototype"},{"section":"x15.11.7.7","name":"15.11.7.7 Properties of the NativeError Prototype Objects"},{"section":"x15.11.7.8","name":"15.11.7.8 NativeError.prototype.constructor"},{"section":"x15.11.7.9","name":"15.11.7.9 NativeError.prototype.name"},{"section":"x15.11.7.10","name":"15.11.7.10 NativeError.prototype.message"},{"section":"x15.11.7.11","name":"15.11.7.11 Properties of NativeError Instances"},{"section":"x15.12","name":"15.12 The JSON Object"},{"section":"x15.12.1","name":"15.12.1 The JSON Grammar  "},{"section":"x15.12.1.1","name":"15.12.1.1 The JSON Lexical Grammar"},{"section":"x15.12.1.2","name":"15.12.1.2 The JSON Syntactic Grammar"},{"section":"x15.12.2","name":"15.12.2 parse ( text [ , reviver ] )"},{"section":"x15.12.3","name":"15.12.3 stringify ( value [ , replacer [ , space ] ] )"},{"section":"x16","name":"16 Errors"},{"section":"A","name":"Annex A (informative) Grammar Summary"},{"section":"A.1","name":"A.1 Lexical Grammar"},{"section":"A.2","name":"A.2 Number Conversions"},{"section":"A.3","name":"A.3 Expressions"},{"section":"A.4","name":"A.4 Statements"},{"section":"A.5","name":"A.5 Functions and Programs"},{"section":"A.6","name":"A.6 Universal Resource Identifier Character Classes"},{"section":"A.7","name":"A.7 Regular Expressions"},{"section":"A.8","name":"A.8 JSON"},{"section":"A.8.1","name":"A.8.1 JSON Lexical Grammar"},{"section":"A.8.2","name":"A.8.2 JSON Syntactic Grammar"},{"section":"B","name":"Annex B (informative) Compatibility"},{"section":"B.1","name":"B.1 Additional Syntax"},{"section":"B.1.1","name":"B.1.1 Numeric Literals"},{"section":"B.1.2","name":"B.1.2 String Literals"},{"section":"B.2","name":"B.2 Additional Properties"},{"section":"B.2.1","name":"B.2.1 escape (string)"},{"section":"B.2.2","name":"B.2.2 unescape (string)"},{"section":"B.2.3","name":"B.2.3 String.prototype.substr (start, length)"},{"section":"B.2.4","name":"B.2.4 Date.prototype.getYear ( )"},{"section":"B.2.5","name":"B.2.5 Date.prototype.setYear (year)"},{"section":"B.2.6","name":"B.2.6 Date.prototype.toGMTString ( )"},{"section":"C","name":"Annex C (informative) The Strict Mode of ECMAScript"},{"section":"D","name":"Annex D (informative) Corrections and Clarifications in the 5th Edition with Possible 3rd Edition Compatibility Impact"},{"section":"E","name":"Annex E (informative) Additions and Changes in the 5th Edition that Introduce Incompatibilities with the 3rd Edition"},{"section":"bibliography","name":"Bibliography"}];

},{}],57:[function(require,module,exports){
module.exports=//SG1 is seperated so Atlantis can be added in later.
{"SG1":{"Season 1":["Children of the Gods","The Enemy Within","Emancipation","The Broca Divide","The First Commandment","Brief Candle","Cold Lazarus","Thor's Hammer","The Torment of Tantalus","Bloodlines","Fire and Water","The Nox","Hathor","Singularity","Cor-ai","Enigma","Tin Man","Solitudes","There But for the Grace of God ","Politics ","Within the Serpent's Grasp "],"Season 2":["The Serpent's Lair ","In the Line of Duty","Prisoners","The Gamekeeper","Need","Thor's Chariot","Message in a Bottle",
"Family","Secrets","Bane","The Tok'ra","The Tok'ra (Part 2)","Spirits","Touchstone","A Matter of Time","The Fifth Race","Serpent's Song","Holiday","One False Step","Show and Tell","1969","Out of Mind "],"Season 3":["Into the Fire ","Seth","Fair Game","Legacy","Learning Curve","Point of View","Deadman Switch","Demons","Rules of Engagement","Forever in a Day","Past and Present","Jolinar's Memories ","The Devil You Know ","Foothold","Pretense","Urgo","A Hundred Days","Shades of Grey","New Ground","Maternal Instinct",
"Crystal Skull","Nemesis "],"Season 4":["Small Victories ","The Other Side","Upgrades","Crossroads","Divide and Conquer","Window of Opportunity","Watergate","The First Ones","Scorched Earth","Beneath the Surface","Point of No Return","Tangent","The Curse","The Serpent's Venom","Chain Reaction","2010","Absolute Power","The Light","Prodigy","Entity","Double Jeopardy ","Exodus "],"Season 5":["Enemies ","Threshold ","Ascension","The Fifth Man","Red Sky","Rite of Passage","Beast of Burden","The Tomb",
"Between Two Fires","2001","Desperate Measures","Wormhole X-Treme!","Proving Ground","48 Hours","Summit ","Last Stand ","Fail Safe","The Warrior","Menace","The Sentinel","Meridian","Revelations"],"Season 6":["Redemption","Redemption (Part 2)","Descent","Frozen","Nightwalkers","Abyss","Shadow Play","The Other Guys","Allegiance","Cure","Prometheus ","Unnatural Selection ","Sight Unseen","Smoke & Mirrors","Paradise Lost","Metamorphosis","Disclosure","Forsaken","The Changeling","Memento","Prophecy","Full Circle"],
"Season 7":["Fallen ","Homecoming ","Fragile Balance","Orpheus","Revisions","Lifeboat","Enemy Mine","Space Race","Avenger 2.0","Birthright","Evolution","Evolution (Part 2)","Grace","Fallout","Chimera","Death Knell","Heroes","Heroes (Part 2)","Resurrection","Inauguration","Lost City","Lost City (Part 2)"],"Season 8":["New Order","New Order (Part 2)","Lockdown","Zero Hour","Icon","Avatar","Affinity","Covenant","Sacrifices","Endgame","Gemini","Prometheus Unbound","It's Good to Be King","Full Alert",
"Citizen Joe","Reckoning","Reckoning (Part 2)","Threads","Moebius","Moebius (Part 2)"],"Season 9":["Avalon","Avalon (Part 2)","Origin ","The Ties That Bind","The Powers That Be","Beachhead","Ex Deus Machina","Babylon","Prototype","The Fourth Horseman","The Fourth Horseman (Part 2)","Collateral Damage","Ripple Effect","Stronghold","Ethon","Off the Grid","The Scourge","Arthur's Mantle","Crusade","Camelot "],"Season 10":["Flesh and Blood ","Morpheus","The Pegasus Project","Insiders","Uninvited","200",
"Counterstrike","Memento Mori","Company of Thieves","The Quest","The Quest (Part 2)","Line in the Sand","The Road Not Taken","The Shroud","Bounty","Bad Guys","Talion","Family Ties","Dominion","Unending"]}};

},{}],58:[function(require,module,exports){
//"encoded" to leave some surprise
exports.undecided=["SSdtIG5vdCBzdXJl", "RVJST1IgQ0FMQ1VMQVRJTkcgUkVTVUxU","SSBrbm93IGp1c3Qgb25lIHRoaW5nLCBhbmQgdGhhdCBpcyB0aGF0IEknbSBhIGx1bWJlcmphY2s="].map(atob);

exports.sameness=["VGhhdCdzIG5vdCByZWFsbHkgYSBjaG9pY2UsIG5vdyBpcyBpdD8=","U291bmRzIGxpa2UgeW91IGhhdmUgYWxyZWFkeSBkZWNpZGVk","Q2hlYXRlciBjaGVhdGVyIHlvdXIgaG91c2UgaXMgYSBoZWF0ZXI="].map(atob);

//now for the juicy part
exports.answers=["QWJzb2x1dGVseSBub3Q=","QWJzb2x1dGVseSBub3Q=","QWJzb2x1dGVseSBub3Q=","QWxsIHNpZ25zIHBvaW50IHRvIG5v","QWxsIHNpZ25zIHBvaW50IHRvIG5v","QWxsIHNpZ25zIHBvaW50IHRvIG5v","QWxsIHNpZ25zIHBvaW50IHRvIHllcw==","QWxsIHNpZ25zIHBvaW50IHRvIHllcw==","QWxsIHNpZ25zIHBvaW50IHRvIHllcw==","QnV0IG9mIGNvdXJzZQ==","QnV0IG9mIGNvdXJzZQ==","QnV0IG9mIGNvdXJzZQ==","QnkgYWxsIG1lYW5z","QnkgYWxsIG1lYW5z","QnkgYWxsIG1lYW5z","Q2VydGFpbmx5IG5vdA==","Q2VydGFpbmx5IG5vdA==","Q2VydGFpbmx5IG5vdA==","Q2VydGFpbmx5","Q2VydGFpbmx5","Q2VydGFpbmx5","RGVmaW5pdGVseQ==","RGVmaW5pdGVseQ==","RGVmaW5pdGVseQ==","RG91YnRmdWxseQ==","RG91YnRmdWxseQ==","RG91YnRmdWxseQ==","RnJhbmtseSBteSBkZWFyLCBJIGRvbid0IGdpdmUgYSBkZWFu", "RnJhbmtseSBteSBkZWFyLCBJIGRvbid0IGdpdmUgYSBkZWFu", "SSBjYW4gbmVpdGhlciBjb25maXJtIG5vciBkZW55","SSBleHBlY3Qgc28=","SSBleHBlY3Qgc28=","SSBleHBlY3Qgc28=","SSdtIG5vdCBzbyBzdXJlIGFueW1vcmUuIEl0IGNhbiBnbyBlaXRoZXIgd2F5","SW1wb3NzaWJsZQ==","SW1wb3NzaWJsZQ==","SW1wb3NzaWJsZQ==","SW5kZWVk","SW5kZWVk","SW5kZWVk","SW5kdWJpdGFibHk=","SW5kdWJpdGFibHk=","SW5kdWJpdGFibHk=","Tm8gd2F5","Tm8gd2F5","Tm8gd2F5","Tm8=","Tm8=","Tm8=","Tm8=","Tm9wZQ==","Tm9wZQ==","Tm9wZQ==","Tm90IGEgY2hhbmNl","Tm90IGEgY2hhbmNl","Tm90IGEgY2hhbmNl","Tm90IGF0IGFsbA==","Tm90IGF0IGFsbA==","Tm90IGF0IGFsbA==","TnVoLXVo","TnVoLXVo","TnVoLXVo","T2YgY291cnNlIG5vdA==","T2YgY291cnNlIG5vdA==","T2YgY291cnNlIG5vdA==","T2YgY291cnNlIQ==","T2YgY291cnNlIQ==","T2YgY291cnNlIQ==","UHJvYmFibHk=","UHJvYmFibHk=","UHJvYmFibHk=","WWVzIQ==","WWVzIQ==","WWVzIQ==","WWVzIQ==","WWVzLCBhYnNvbHV0ZWx5","WWVzLCBhYnNvbHV0ZWx5","WWVzLCBhYnNvbHV0ZWx5"].map(atob);
//can you feel the nectar?

},{}],59:[function(require,module,exports){
//a Trie suggestion dictionary, made by Esailija (small fixes by God)
// http://stackoverflow.com/users/995876/esailija
//used in the "command not found" message to show you closest commands
/*global exports*/

exports.SuggestionDictionary = (function () {

function TrieNode() {
    this.word = null;
    this.children = {};
}

TrieNode.prototype.add = function( word ) {
    var node = this, char, i = 0;

    while( char = word.charAt(i++) ) {
        if( !(char in node.children) ) {
            node.children[ char ] = new TrieNode();
        }

        node = node.children[ char ];
    }

    node.word = word;
};

TrieNode.prototype.del = function(word, i) {
    i = i || 0;
    var node = this;
    var char = word[i++];

    // recursively delete all trie nodes that are left empty after removing the command from the leaf
    if (node.children[char]) {
        node.children[char].del(word, i);
        if (Object.keys(node.children[char].children).length === 0 && node.children[char].word === null) {
            delete node.children[char];
        }
    }

    if (node.word === word) {
        node.word = null;
    }
};

//Having a small maxCost will increase performance greatly, experiment with
//values of 1-3
function SuggestionDictionary ( maxCost ) {
    if( !(this instanceof SuggestionDictionary) ) {
        throw new TypeError( "Illegal function call" );
    }

    maxCost = Number( maxCost );

    if( isNaN( maxCost ) || maxCost < 1 ) {
        throw new TypeError( "maxCost must be an integer > 1 " );
    }

    this.maxCost = maxCost;
    this.trie = new TrieNode();
}

SuggestionDictionary.prototype = {
    constructor: SuggestionDictionary,

    build : function ( words ) {
        if( !Array.isArray( words ) ) {
            throw new TypeError( "Cannot build a dictionary from "+words );
        }

        this.trie = new TrieNode();

        words.forEach(function ( word ) {
            this.trie.add( word );
        }, this);
    },

    __sortfn : function ( a, b ) {
        return a[1] - b[1];
    },

    search : function ( word ) {
        word = word.valueOf();
        var r;

        if( typeof word !== "string" ) {
            throw new TypeError( "Cannot search " + word );
        }
        if( this.trie === undefined ) {
            throw new TypeError( "Cannot search, dictionary isn't built yet" );
        }

        r = search( word, this.maxCost, this.trie );
        //r will be array of arrays:
        //["word", cost], ["word2", cost2], ["word3", cost3] , ..

        r.sort( this.__sortfn ); //Sort the results in order of least cost


        return r.map(function ( subarr ) {
            return subarr[ 0 ];
        });
    }
};

function range ( x, y ) {
    var r = [], i, l, start;

    if( y === undefined ) {
        start = 0;
        l = x;
    }
    else {
        start = x;
        l = y-start;
    }

    for( i = 0; i < l; ++i ) {
        r[i] = start++;
    }

    return r;

}

function search ( word, maxCost, trie ) {
    var results = [],
    currentRow = range( word.length + 1 );


    Object.keys( trie.children ).forEach(function ( letter ) {
        searchRecursive(
            trie.children[letter], letter, word,
            currentRow, results, maxCost );
    });

    return results;
}


function searchRecursive ( node, letter, word, previousRow, results, maxCost ) {
    var columns = word.length + 1,
        currentRow = [ previousRow[0] + 1 ],
        i, insertCost, deleteCost, replaceCost, last;

    for( i = 1; i < columns; ++i ) {

        insertCost = currentRow[ i-1 ] + 1;
        deleteCost = previousRow[ i ] + 1;

        if( word.charAt(i-1) !== letter ) {
            replaceCost = previousRow[ i-1 ]+1;

        }
        else {
            replaceCost = previousRow[ i-1 ];
        }

        currentRow.push( Math.min(insertCost, deleteCost, replaceCost) );
    }

    last = currentRow[ currentRow.length-1 ];
    if( last <= maxCost && node.word !== null ) {
        results.push( [node.word, last] );
    }

    if( Math.min.apply(Math, currentRow) <= maxCost ) {
        Object.keys( node.children ).forEach(function ( letter ) {
            searchRecursive(
                node.children[letter], letter, word,
                currentRow, results, maxCost );
        });
    }
}

return SuggestionDictionary;
}());

},{}],60:[function(require,module,exports){
"use strict";
/*global module, CHAT*/
module.exports = function (bot) {
    var users = {};
    var joined = [];

    var join = function ( msgObj, cb ) {
        joined.push( msgObj.user_id );
        addInfos( cb );
    };

    bot.IO.register( 'userjoin', function userjoin ( msgObj ) {
        bot.log( msgObj, 'userjoin' );

        var user = users[ msgObj.user_id ];
        if ( !user ) {
            join( msgObj, finish );
        }
        else {
            finish( user );
        }

        function finish ( user ) {
            bot.IO.fire( 'userregister', user, msgObj.room_id );
        }
    });

    //this function throttles to give the chat a chance to fetch the user info
    // itself, and to queue up several joins in a row
    var addInfos = (function ( cb ) {
        bot.log( joined, 'user addInfos' );
        requestInfo( null, joined, cb );

        joined = [];
    }).throttle( 1000 );

    function requestInfo ( room, ids, cb ) {
        if ( !Array.isArray(ids) ) {
            ids = [ ids ];
        }

        if ( !ids.length ) {
            return;
        }

        bot.IO.xhr({
            method : 'POST',
            url : '/user/info',

            data : {
                ids : ids.join(),
                roomId : room || bot.adapter.roomid
            },
            complete : finish
        });

        function finish ( resp ) {
            resp = JSON.parse( resp );
            resp.users.forEach( addUser );
        }

        function addUser ( user ) {
            users[ user.id ] = user;
            cb( user );
        }
    }

    users.request = requestInfo;

    users.findUserId = function ( username ) {
        var ids = Object.keys( users );
        username = normaliseName( username );

        return ids.first( nameMatches ) || -1;

        function nameMatches ( id ) {
            return normaliseName( users[id].name ) === username;
        }

        function normaliseName ( name ) {
            return name.toLowerCase().replace( /\s/g, '' );
        }
    }.memoize();

    users.findUsername = (function () {
        var cache = {};

        return function ( id, cb ) {
            if ( cache[id] ) {
                finish( cache[id] );
            }
            else if ( users[id] ) {
                finish( users[id].name );
            }
            else {
                users.request( bot.adapter.roomid, id, reqFinish );
            }

            function reqFinish ( user ) {
                finish( user.name );
            }
            function finish ( name ) {
                cb( cache[id] = name );
            }
        };
    })();

    users.loadUsers = function () {
        CHAT.RoomUsers.all().forEach(function (user) {
            users[user.id] = user;
        });
    };

    return users;
};

},{}],61:[function(require,module,exports){
//345678901234567890123456789012345678901234567890123456789012345678901234567890
//small utility functions

//takes n objects, and merges them into one super-object, which'll one day rule
// the galaxy. Non-mutative. The merging, not the galaxy ruling.
//
// > Object.merge( {a : 4, b : 5}, {a : 6, c : 7} )
// { a : 6, b : 5, c : 7 }
Object.merge = function () {
    return [].reduce.call( arguments, function ( ret, merger ) {

        Object.keys( merger ).forEach(function ( key ) {
            ret[ key ] = merger[ key ];
        });

        return ret;
    }, {} );
};

//iterates over an object. the callback receives the key, value and the obejct.
// > Object.iterate( {a : 4, b : 5}, console.log.bind(console) )
// a 4 { a: 4, b: 5 }
// b 5 { a: 4, b: 5 }
Object.iterate = function ( obj, cb, thisArg ) {
    Object.keys( obj ).forEach(function (key) {
        cb.call( thisArg, key, obj[key], obj );
    });
};

//takes an array, and turns it into the truth map (item[i] => true)
//TODO: replace with Set
Object.TruthMap = function ( props ) {
    return ( props || [] ).reduce( assignTrue, Object.create(null) );

    function assignTrue ( ret, key ) {
        ret[ key ] = true;
        return ret;
    }
};

//turns a pseudo-array (like arguments) into a real array
Array.from = function ( arrayLike, start ) {
    return [].slice.call( arrayLike, start );
};

//SO chat uses an unfiltered for...in to iterate over an array somewhere, so
// that we have to use Object.defineProperty to make these non-enumerable
Object.defineProperty( Array.prototype, 'invoke', {
    value : function ( funName ) {
        var args = Array.from( arguments, 1 );

        return this.map( invoke );

        function invoke ( item, index ) {
            var res = item;

            if ( item[funName] && item[funName].apply ) {
                res = item[ funName ].apply( item, args );
            }

            return res;
        }
    },

    configurable : true,
    writable : true
});

Object.defineProperty( Array.prototype, 'pluck', {
    value : function ( propName ) {
        return this.map( pluck );

        function pluck ( item, index, arr ) {
            //protection aganst null/undefined.
            try {
                return item[ propName ];
            }
            catch (e) {
                return item;
            }
        }
    },

    configurable : true,
    writable : true
});

//fuck you readability
//left this comment as company for future viewers with their new riddle
Object.defineProperty( Array.prototype, 'first', {
    value : function ( fun ) {
        return this.some(function ( item ) {
            return fun.apply( null, arguments ) && ( (fun = item) || true );
        }) ? fun : null;
    },

    configurable : true,
    writable : true
});

Object.defineProperty( Array.prototype, 'random', {
    value : function () {
        return this[ Math.floor(Math.random() * this.length) ];
    },

    configurable : true,
    writable : true
});

Object.defineProperty( Array.prototype, 'groupBy', {
    value : function ( classifier ) {
        return this.reduce(function ( ret, item ) {
            var key = classifier( item );

            if ( !ret[key] ) {
                ret[ key ] = [];
            }
            ret[ key ].push( item );

            return ret;
        }, {});
    },

    configurable : true,
    writable : true
});

//define generic array methods on Array, like FF does
[ 'forEach', 'map', 'filter', 'reduce' ].forEach(function ( name ) {
    var fun = [][ name ]; //teehee
    Array[ name ] = function () {
        return fun.call.apply( fun, arguments );
    };
});

String.prototype.indexesOf = function ( str, fromIndex ) {
    //since we also use index to tell indexOf from where to begin, and since
    // telling it to begin from where it found the match will cause it to just
    // match it again and again, inside the indexOf we do `index + 1`
    // to compensate for that 1, we need to subtract 1 from the original
    // starting position
    var index = ( fromIndex || 0 ) - 1,
        ret = [];

    while ( (index = this.indexOf(str, index + 1)) > -1 ) {
        ret.push( index );
    }

    return ret;
};

//Crockford's supplant
String.prototype.supplant = function ( arg ) {
    //if it's an object, use that. otherwise, use the arguments list.
    var obj = (
        Object(arg) === arg ?
            arg : arguments );
    return this.replace( /\{([^\}]+)\}/g, replace );

    function replace ( $0, $1 ) {
        return obj.hasOwnProperty( $1 ) ?
            obj[ $1 ] :
            $0;
    }
};

String.prototype.startsWith = function ( str ) {
    return this.indexOf( str ) === 0;
};

Function.prototype.throttle = function ( time ) {
    var fun = this, timeout = -1;

    var ret = function () {
        clearTimeout( timeout );

        var context = this, args = arguments;
        timeout = setTimeout(function () {
            fun.apply( context, args );
        }, time );
    };

    return ret;
};

Function.prototype.memoize = function () {
    var cache = Object.create( null ), fun = this;

    return function memoized ( hash ) {
        if ( hash in cache ) {
            return cache[ hash ];
        }

        var res = fun.apply( null, arguments );

        cache[ hash ] = res;
        return res;
    };
};

//async memoizer
Function.prototype.memoizeAsync = function ( hasher ) {
    var cache = Object.create( null ), fun = this;

    hasher = hasher || function (x) { return x; };

    return function memoized () {
        var args = Array.from( arguments ),
            cb = args.pop(), //HEAVY assumption that cb is always passed last
            hash = hasher.apply( null, arguments );

        if ( hash in cache ) {
            cb.apply( null, cache[hash] );
            return;
        }

        //push the callback to the to-be-passed arguments
        args.push( resultFun );
        fun.apply( this, args );

        function resultFun () {
            cache[ hash ] = arguments;
            cb.apply( null, arguments );
        }
    };
};

//returns the function in string-form, without the enclosing crap.
Function.prototype.stringContents = function () {
    return this.toString()
        .replace(/^function\*?\s+\([^)]*\)\s*\{/, '')
        .replace(/\}$/, '');
};

//returns the number with at most `places` digits after the dot
//examples:
// 1.337.maxDecimal(1) === 1.3
//
//steps:
// floor(1.337 * 10e0) = 13
// 13 / 10e0 = 1.3
Number.prototype.maxDecimal = function ( places ) {
    var exponent = Math.pow( 10, places );

    return Math.floor( this * exponent ) / exponent;
};

//receives an (ordered) array of numbers, denoting ranges, returns the first
// range it falls between. I suck at explaining, so:
// 4..fallsAfter( [1, 2, 5] )  === 2
// 4..fallsAfter( [0, 3] ) === 3
Number.prototype.fallsAfter = function ( ranges ) {
    ranges = ranges.slice();
    var min = ranges.shift(), max,
        n = this.valueOf();

    for ( var i = 0, l = ranges.length; i < l; i++ ) {
        max = ranges[ i ];

        if ( n < max ) {
            break;
        }
        min = max;
    }

    return min <= n ? min : null;
};

//calculates a:b to string form
Math.ratio = function ( a, b ) {
    a = Number( a );
    b = Number( b );

    var gcd = this.gcd( a, b );
    return ( a / gcd ) + ':' + ( b / gcd );
};

//Euclidean gcd
Math.gcd = function ( a, b ) {
    if ( !b ) {
        return a;
    }
    return this.gcd( b, a % b );
};

Math.rand = function ( min, max ) {
    //rand() === rand( 0, 9 )
    if ( typeof min === 'undefined' ) {
        min = 0;
        max = 9;
    }

    //rand( max ) === rand( 0, max )
    else if ( typeof max === 'undefined' ) {
        max = min;
        min = 0;
    }

    return Math.floor( Math.random() * (max - min + 1) ) + min;
};

//I got annoyed that RegExps don't automagically turn into correct shit when
// JSON-ing them. so HERE.
Object.defineProperty( RegExp.prototype, 'toJSON', {
    value : function () {
        return this.toString();
    },
    configurable : true,
    writable : true
});

//takes a string and escapes any special regexp characters
RegExp.escape = function ( str ) {
    //do I smell irony?
    return str.replace( /[-^$\\\/\.*+?()[\]{}|]/g, '\\$&' );
    //using a character class to get away with escaping some things. the - in
    // the beginning doesn't denote a range because it only denotes one when
    // it's in the middle of a class, and the ^ doesn't mean negation because
    // it's not in the beginning of the class
};

//not the most efficient thing, but who cares. formats the difference between
// two dates
Date.timeSince = function ( d0, d1 ) {
    d1 = d1 || new Date();

    var ms = d1 - d0,
        delay;

    var delays = [
        {
            delta : 3.1536e+10,
            suffix : 'year'
        },
        {
            delta : 2.592e+9,
            suffix : 'month'
        },
        {
            delta : 8.64e+7,
            suffix : 'day'
        },
        {
            delta : 3.6e+6,
            suffix : 'hour'
        },
        {
            delta : 6e+4,
            suffix : 'minute'
        },
        {
            delta : 1000,
            suffix : 'second'
        }
        //anything else is ms
    ];

    while ( delays.length ) {
        delay = delays.shift();

        if ( ms >= delay.delta ) {
            return format( ms / delay.delta, delay.suffix );
        }
    }
    return format( ms, 'millisecond' );

    function format ( interval, suffix ) {
        interval = Math.floor( interval );
        suffix += interval === 1 ? '' : 's';

        return interval + ' ' + suffix;
    }
};

},{}]},{},[61,7,4]);
