(function () {
var linkTemplate = '[{text}]({url})';

bot.adapter = {
	roomid : null, fkey : null, site : null,

	//not a necessary function, used in here to set some variables
	init : function () {
		var fkey = document.getElementById( 'fkey' );
		if ( !fkey ) {
			console.error( 'bot.adapter could not find fkey; aborting' );
			return;
		}
		this.fkey = fkey.value;
		this.roomid = /\d+/.exec(location)[ 0 ];
		this.site = /chat\.(\w+)/.exec( location )[ 1 ];

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

	interval : 5000,

	init : function () {
		var that = this,
			roomid = bot.adapter.roomid;

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

			that.openSocket( resp.url );
		}
	},

	openSocket : function ( url ) {
		//chat sends an l query string parameter. seems to be the same as the
		// since xhr parameter, but I didn't know what that was either so...
		//putting in 0 got the last shitload of messages, so what does a high
		// number do? (spoiler: it "works")
		var socket = this.socket = new WebSocket( url + '?l=99999999999' );
		socket.onmessage = this.ondata.bind( this );
	},

	ondata : function ( messageEvent ) {
		this.pollComplete( messageEvent.data );
	},

	pollComplete : function ( resp ) {
		if ( !resp ) {
			return;
		}
		resp = JSON.parse( resp );

		//each key will be in the form of rROOMID
		Object.keys( resp ).forEach(function ( key ) {
			var msgObj = resp[ key ];

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
		//event_type of 1 means new message, 2 means edited message
		if ( msg.event_type !== 1 && msg.event_type !== 2 ) {
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
	}
};

//the output is expected to have only one method: add, which receives a message
// and the room_id. everything else is up to the implementation.
var output = bot.adapter.out = {
	interval : polling.interval + 500,
	messages : {},

	init : function () {
		this.loopage();
	},

	//add a message to the output queue
	add : function ( msg, roomid ) {
		roomid = roomid || bot.adapter.roomid;
		IO.out.receive({
			text : msg + '\n',
			room : roomid
		});
	},

	//build the final output
	build : function ( obj ) {
		if ( !this.messages[obj.room] ) {
			this.messages[ obj.room ] = '';
		}
		this.messages[ obj.room ] += obj.text;
	},

	//send output to all the good boys and girls
	//no messages for naughty kids
	//...what's red and sits in the corner?
	//a naughty strawberry
	send : function () {
		//unless the bot's stopped. in which case, it should shut the fudge up
		// the freezer and never let it out. not until it can talk again. what
		// was I intending to say?
		if ( !bot.stopped ) {
			Object.keys( this.messages ).forEach(function ( room ) {
				var message = this.messages[ room ];

				if ( !message ) {
					return;
				}

				this.sendToRoom( message, room );
			}, this );
		}

		this.messages = {};
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
				output.add( text, roomid );
			}
			//server error, usually caused by message being too long
			else if ( xhr.status === 500 ) {
				output.add( 'Server error (status 500) occured', roomid );
			}
			else {
				IO.fire( 'sendoutput', xhr );
			}
		}
	},

	//what do you call a boomerang which doesn't return?
	//a stick
	loopage : function () {
		var that = this;
		setTimeout(function () {
			IO.out.flush();
			that.loopage();
		}, this.interval );
	}
};
//what's orange and sounds like a parrot?
//a carrot
IO.register( 'output', output.build, output );
IO.register( 'afteroutput', output.send, output );

//two guys walk into a bar. the bartender asks them "is this some kind of joke?"
bot.adapter.init();
}());
