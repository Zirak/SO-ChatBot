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
		elem.appendChild( mini_md.parse(md) );
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

var mini_md = {
	tab  : '    ',
	frag : null,
	link_re : /\[(.+)\]\(((?:https?|ftp):\/\/.+\..+)\)/g,

	parse : function ( message ) {
		this.frag = document.createDocumentFragment();
		this.message = this.untabify( message );

		//code check
		console.log( this.message );
		if ( this.message.slice(0, 4) === this.tab ) {
			this.codify();
			return this.frag;
		}

		var linked = this.link_re.break( this.message, this.replace.bind(this) );

		if ( !linked ) {
			this.append_text( 0 );
		}
		return this.frag;
	},

	codify : function () {
		var code = document.createElement( 'pre' );
		code.textContent = this.message;

		this.frag.appendChild( code );
	},

	replace : function ( groups, prev, begin ) {
		console.log( arguments );
		this.append_text( prev, begin );

		if ( groups[0] ) {
			this.append_link( groups[1], groups[2] );
		}
	},

	append_link : function ( text, href ) {
		var link = document.createElement( 'a' );
		link.textContent = text;
		link.href = href ? href : text;

		this.frag.appendChild( link );
	},

	append_text : function ( begin, end ) {
		console.log( begin, end );
		var node;
		if ( begin !== end ) {
			node = document.createTextNode();
			node.data = this.message.slice( begin, end );

			this.frag.appendChild( node );
		}
	},

	untabify : function ( text ) {
		return text.replace( /\t/g, this.tab );
	}
};

RegExp.prototype.break = function ( str, fun ) {
	var last = 0, matched = false;
	str.replace( this, cb );

	if ( matched ) {
		fun.call( null, [], last );
	}
	return matched;

	function cb ( match ) {
		matched = true;
		var args = [].slice.call( arguments ),
			groups = args.slice( 0, -2 ),
			offset = args[ args.length - 2 ];

		fun.call( null, groups, last, offset );
		last = offset + match.length;
	}
};

function $D ( x ) {
	return x;
}
