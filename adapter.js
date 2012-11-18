IO.unregister( 'output', bot.adapter.out.build );
IO.unregister( 'afteroutput', bot.adapter.out.send );

bot.invocationPattern = '';

bot.adapter = {
	roomid      : 0,
	transform   : $D,
	escape      : $D,
	reply       : $D,
	directreply : $D,

	//these should be rewritten
	codify      : $D,
	link        : $D

};

bot.adapter.in = {
	ENTER : 13,
	elem  : document.getElementById( 'input' ),

	init : function () {
		this.elem.addEventListener('keyup', this.listen.bind(this), false );
	},

	listen : function ( e ) {
		if ( e.which !== this.ENTER ) {
			return;
		}
		console.log( 'woop' );

		IO.in.receive({
			content   : this.elem.value,
			user_name : 'Anonymo',
			user_id   : 5138008,
			room_id   : bot.adapter.roomid
		});
		IO.in.flush();
	}
};

var output = bot.adapter.out = {
	elem     : document.getElementById( 'chat' ),
	messages : [],

	add : function ( msg ) {
		console.log( 'in ' + msg );
		IO.out.receive({ text : msg + '\n' });
	},
	build : function ( obj ) {
		console.log( 'build', obj, this );
		this.messages.push( obj.text );
	},
	send : function () {
		var self = this;
		this.messages.map( wrap ).forEach( append );
		this.messages = [];

		function wrap ( message ) {
			var cont = document.createElement( 'div' );
			cont.textContent = message;
			return cont;
		}
		function append ( cont ) {
			self.elem.appendChild( cont );
		}
	},

	loopage : function () {
		var that = this;
		setTimeout(function () {
			IO.out.flush();
			that.loopage();
		}, 1000 );
	}
};

bot.adapter.in.init();
output.loopage();

IO.register( 'output', output.build, output );
IO.register( 'afteroutput', output.send, output );

function $D ( x ) {
	return x;
}
