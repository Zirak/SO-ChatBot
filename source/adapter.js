(function () {
var linkTemplate = '[{text}]({url})';

bot.adapter = {
	roomid : ( /\d+/.exec(location) || [0] )[ 0 ],
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

	//receives a msg and the msgObj, and returns a message which will be
	// recognized as a reply to a user
	reply : function ( msg, msgObj ) {
		var usr = msgObj.user_name.replace( /\s/g, '' );
		return '@' + usr + ' ' + msg;
	},
	//again, receives msg and msgObj, returns a message which is a reply to
	// another message
	directreply : function ( msg, msgObj ) {
		return ':' + msgObj.message_id + ' ' + msg;
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

			that.loopage();
		}
	},

	poll : function () {
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

		var that = this;
		//each key will be in the form of rROOMID
		Object.keys( resp ).forEach(function ( key ) {
			var msgObj = resp[ key ];

			//t is a...something important
			if ( msgObj.t ) {
				that.times[ key ] = msgObj.t;
			}

			//e is an array of events, what is referred to in the bot as msgObj
			if ( msgObj.e ) {
				msgObj.e.forEach( that.handleMessageObject, that );
			}
		});

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
	},

	loopage : function () {
		var that = this;

		setTimeout(function () {
			that.poll();
			that.loopage();
		}, this.interval );
	}
};

//the output is expected to have only one method: add, which receives a message
// and the room_id. everything else is up to the implementation.
var output = bot.adapter.out = {
	interval : polling.interval + 500,

	messages : {},

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
polling.init();
output.loopage();
}());
