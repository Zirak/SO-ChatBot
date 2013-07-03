(function () {
"use strict";

var linkTemplate = '[{text}]({url})';

bot.adapter = {
	//the following two only used in the adapter; you can change & drop at will
	roomid : null,
	fkey   : null,
	//used in commands calling the SO API
	site   : null,
	//our user id
	user_id : null,

	//not a necessary function, used in here to set some variables
	init : function () {
		var fkey = document.getElementById( 'fkey' );
		if ( !fkey ) {
			console.error( 'bot.adapter could not find fkey; aborting' );
			return;
		}
		this.fkey = fkey.value;
		this.roomid = Number( /\d+/.exec(location)[0] );
		this.site = /chat\.(\w+)/.exec( location )[ 1 ];
		this.user_id = CHAT.user.current().id;

		this.in.init();
		this.out.init();
	},

	//a pretty crucial function. accepts the msgObj we know nothing about,
	// and returns an object with these properties:
	//  user_name, user_id, room_id, content
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
	}
};

//the input is not used by the bot directly, so you can implement it however
// you like
var polling = bot.adapter.in = {
	//used in the SO chat requests, dunno exactly what for, but guessing it's
	// the latest id or something like that. could also be the time last
	// sent, which is why I called it times at the beginning. or something.
	times : {},
	//currently, used for messages sent when the room's been silent for a
	// while
	lastTimes : {},

	firstPoll : true,

	interval : 5000,

	init : function ( roomid ) {
		var that = this,
			providedRoomid = ( roomid !== undefined );
		roomid = roomid || bot.adapter.roomid;

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
			bot.log( resp );

			that.openSocket( resp.url, providedRoomid );
		}
	},

	initialPoll : function () {
		bot.log( 'adapter: initial poll' );
		var roomid = bot.adapter.roomid,
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
			bot.log( resp );

			that.times[ 'r' + roomid ] = resp.time;
			that.firstPoll = false;

			that.loopage();
		}
	},

	openSocket : function ( url, discard ) {
		//chat sends an l query string parameter. seems to be the same as the
		// since xhr parameter, but I didn't know what that was either so...
		//putting in 0 got the last shitload of messages, so what does a high
		// number do? (spoiler: it "works")
		var socket = this.socket = new WebSocket( url + '?l=99999999999' );

		if ( discard ) {
			socket.onmessage = function () {
				socket.close();
			};
		}
		else {
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
			this.loopage();
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
		//and move on with our lives
		this.loopage();
	},

	handleMessageObject : function ( msg ) {
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
		this.lastTimes[ msg.room_id ] = Date.now();

		//check for a multiline message
		if ( msg.content.startsWith('<div class=\'full\'>') ) {
			this.handleMultilineMessage( msg );
			return;
		}

		//add the message to the input buffer
		IO.in.receive( msg );
	},

	handleMultilineMessage : function ( msg ) {
		//remove the enclosing tag
		var multiline = msg.content
			//slice upto the beginning of the ending tag
			.slice( 0, msg.content.lastIndexOf('</div>') )
			//and strip away the beginning tag
			.replace( '<div class=\'full\'>', '' );

		//iterate over each line
		multiline.split( '<br>' ).forEach(function ( line ) {
			//and treat it as if it were a separate message
			this.handleMessageObject(
				Object.merge( msg, { content : line.trim() })
			);
		}, this );
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
		if ( roomid === bot.adapter.roomid ) {
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
		bot.log( 'adapter: socket failed', this );
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
		}, this.interval );
	}
};

//the output is expected to have only one method: add, which receives a message
// and the room_id. everything else is up to the implementation.
var output = bot.adapter.out = {
	'409' : 0, //count the number of conflicts
	total : 0, //number of messages sent
	interval : polling.interval + 500,

	init : function () {},

	//add a message to the output queue
	add : function ( msg, roomid ) {
		IO.out.receive({
			text : msg + '\n',
			room : roomid || bot.adapter.roomid
		});
		IO.out.tick();
	},

	//send output to all the good boys and girls
	//no messages for naughty kids
	//...what's red and sits in the corner?
	//a naughty strawberry
	send : function ( obj ) {
		//unless the bot's stopped. in which case, it should shut the fudge up
		// the freezer and never let it out. not until it can talk again. what
		// was I intending to say?
		if ( !bot.stopped ) {
			//ah fuck it
			this.sendToRoom( obj.text, obj.room );
		}
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
			bot.log( xhr.status );

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

		function delayAdd () {
			setTimeout(function delayedAdd () {
				output.add( text, roomid );
			}, output.interval );
		}
	}
};
//what's orange and sounds like a parrot?
//a carrot
IO.register( 'output', output.send, output );

//two guys walk into a bar. the bartender asks them "is this some kind of joke?"
bot.adapter.init();
}());
