(function () {
var undo = {
	last_id : null,

	command : function ( args, cb ) {
		var id = Number( args.parse()[0] );
		bot.log( id, '/undo input' );

		if ( !id ) {
			id = this.last_id
		}

		if ( !id ) {
			finish( 'I\'ve yet to say a word.' );
		}
		else {
			this.remove( id, finish );
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

	remove : function ( id, cb ) {
		IO.xhr({
			url   : '/messages/' + id + '/delete',
			data   : fkey(),
			method  : 'POST',
			complete : finish
		});

		function finish ( resp, xhr ) {
			var msg;

			if ( resp === '"ok"' ) {
				msg = 'Target eliminated';
			}
			else if ( /it is too late/i.test(resp) ) {
				msg = 'TimeError: Could not reach 88mph';
			}
			else {
				msg = 'I have no idea what happened: ' + resp;
			}

			cb( msg );
		}
	},

	update_id : function ( xhr ) {
		console.log( xhr );
		this.last_id = JSON.parse( xhr.responseText ).id;
	}
};

IO.register( 'sendoutput', undo.update_id, undo );
bot.addCommand({
	name : 'undo',
	fun  : undo.command,
	thisArg : undo,
	permissions : {
		del : 'NONE',
		use : bot.owners
	},
	description : 'Undo (delete) specified or last message. `/undo [msgid]`'
});

}());
