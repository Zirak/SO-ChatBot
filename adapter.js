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

	//these should be rewritten
	codify : $D,
	link   : $D

};

bot.adapter. in = {
	ENTER : 13,
	elem  : document.getElementById( 'input' ),
	send  : document.getElementById( 'send' ),

	init : function () {
		var listen = this.listen.bind( this );
		this.elem.addEventListener( 'keyup', listen, false );
		this.send.addEventListener( 'click', listen, false );
	},

	listen : function ( e ) {
		if ( e.which !== this.ENTER ) {
			return;
		}
		this.elem.disabled = true;
		//leaving the following commented to mock rlemon
		//this.submit.apply( this );
		this.submit();
	},

	submit : function () {
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
	elem: document.getElementById( 'chat' ),
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
		var self = this;
		this.messages.forEach( this.format.add, this.format );
		this.messages = [];

		bot.adapter.in.elem.value = "";
		bot.adapter.in.elem.disabled = false;
	},

	loopage: function () {
		var that = this;
		setTimeout(function() {
			IO.out.flush();
			that.loopage();
		}, 1000);
	}
};

output.format = {
	add  : function ( msg ) {
		output.elem.appendChild( this.wrap(msg) );
	},

	wrap : function ( msg ) {
		var cont = this.container();
		cont.appendChild( this.ident() );
		cont.appendChild( this.message(msg) );

		return cont;
	},

	container : function () {
		var ret = document.createElement( 'div' );
		ret.className = 'message';
		return ret;
	},

	message : function ( md ) {
		var elem = document.createElement( 'div' );
		elem.className = 'text';
		//elem.appendChild( mini_md(md) );
		elem.textContent = md;
		return elem;
	},

	ident : function () {
		var img = document.createElement('img');
		img.src = 'http://www.gravatar.com/avatar/2d7aced56559de2ecc26577fd1cba614?s=32&d=identicon&r=PG';
		img.className = 'ident';
		return img;
	}
};

bot.adapter.in.elem.focus();
bot.adapter.in.init();
output.loopage();


IO.register('output', output.build, output);
IO.register('afteroutput', output.send, output);

function mini_md ( message ) {
	//I'll do it later...already have the logic, too lazy to write
	return message;
/(^|\s)(\b(https?|ftp):\/\/[\-A-Z0-9+\u0026@#\/%?=~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~_|])/gi, "$1<a href='$2'>$2</a>"
}

function $D ( x ) {
	return x;
}
