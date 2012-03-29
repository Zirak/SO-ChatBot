(function () {
bot.adapter = {};

var polling = bot.adapter.in = {
	//used in the SO chat requests, dunno exactly what for, but guessing it's
	// the latest id or something like that
	times : {},

	pollInterval : 5000,

	init : function () {
		var that = this,
			roomid = location.pathname.match( /\d+/ )[ 0 ];

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
			.slice( 0, msg.content.lastIndexOf('</div>') )
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
		}, this.pollInterval );
	}
};
polling.init();

var output = bot.adapter.out = {
	messages : {},

	//add a message to the output queue
	add : function ( msg, roomid ) {
		roomid = roomid || bot.roomid;
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

	//and send output to all the good boys and girls
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

	sendToRoom : function ( text, room ) {
		IO.xhr({
			url : '/chats/' + room + '/messages/new',
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
				output.add( text, room );
			}
		}
	},

	loopage : function () {
		IO.out.flush();
	}
};
output.timer = setInterval( output.loopage, 5000 );

IO.register( 'output', output.build, output );
IO.register( 'afteroutput', output.send, output );
}());
