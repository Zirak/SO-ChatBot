if ( bot.adapter ) {
	IO.unregister( 'output', bot.adapter.out.build );
	IO.unregister( 'afteroutput', bot.adapter.out.send );
}

bot.invocationPattern = '';

bot.adapter = {
	roomid     : 0,
	transform  : $D,
	escape     : $D,
	reply      : $D,
	directreply: $D,

	//h4x :D
	codify : bot.adapter.codify,
	link   : bot.adapter.link

};

var input = bot.adapter.in = {
	ENTER : 13,
	inpt  : document.getElementById( 'input' ),
	send  : document.getElementById( 'send' ),

	init : function () {
		var listen = this.listen.bind( this );
		this.inpt.addEventListener( 'keyup', listen, false );
		this.send.addEventListener( 'click', listen, false );
	},

	listen : function ( e ) {
		if ( e.which !== this.ENTER ) {
			return;
		}
		this.inpt.disabled = true;
		//leaving the following commented to mock rlemon
		//this.submit.apply( this );
		this.submit();
	},

	submit : function () {
		var content = this.inpt.value;
		format.add( content, true );

		IO.in.receive({
			content   : content,
			user_name : 'Dave',
			user_id   : 5138008,
			room_id   : bot.adapter.roomid
		});
		IO.in.flush();
	},

	reset : function () {
		this.inpt.value = '';
		this.inpt.disabled = false;
	}
};


var output = bot.adapter.out = {
	messages: [],

	add : function ( msg ) {
		IO.out.receive({
			text: msg + '\n'
		});
	},
	build : function ( obj ) {
		this.messages.push( obj.text );
	},
	send : function () {
		this.messages.forEach( format.add, format );
		this.messages = [];

		input.reset();
	},

	loopage: function () {
		var that = this;
		setTimeout(function() {
			IO.out.flush();
			that.loopage();
		}, 1000);
	}
};

input.inpt.focus();
input.init();
output.loopage();

IO.register('output', output.build, output);
IO.register('afteroutput', output.send, output);

function $D ( x ) {
	return x;
}
