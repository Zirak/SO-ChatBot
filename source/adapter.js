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
