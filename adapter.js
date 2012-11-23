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
	link_re : /(https?:\/\/.+?\.[^\)\s]+(?!\())/g,
	link_md : /\[(.+?)\]\(((?:https?|ftp):\/\/.+?\..+?)\)/g,
	code_md : /`(.+?)`(?=$|\s)/g, //this will have to do...

	parse : function ( message ) {
		this.message = this.untabify( message );

		//code check
		if ( this.message.slice(0, 4) === this.tab ) {
			return this.codify( null, this.message );
		}

		var frag = fragger.new();
		frag.init( this.message );

		frag.replace( this.link_md, this.link );
		frag.replace( this.link_re, this.link );
		frag.replace( this.code_md, this.codify  );

		return frag.root;
	},

	link : function ( $0, text, href ) {
		var link = document.createElement( 'a' );
		link.textContent = text;
		link.href = href ? href : text;

		return link;
	},

	codify : function ( $0, text ) {
		//$0 existing means it's a regexp match, not a block-codify
		var tag = $0 ? 'code' : 'pre';
		var code = document.createElement( tag );
		code.textContent = text;

		return code;
	},

	untabify : function ( text ) {
		return text.replace( /\t/g, this.tab );
	}
};

var fragger = {
	root : null,
	cur_root : null, //ungh, but I can't find a better place...
	last_index : null,

	new : function () {
		return Object.create( this );
	},

	init : function ( text ) {
		this.root = document.createDocumentFragment();
		this.root.appendChild( document.createTextNode(text) );
	},

	replace : function ( re, fun ) {
		this.last_index = 0;
		var list = this.getTextNodes(),
			bound = this.actual_replace.bind( this, fun ),
			cur;

		while ( cur = list.pop() ) {
			this.cur_root = document.createDocumentFragment();

			cur.data.replace( re, bound );
			this.append_text( cur.data, this.last_index );

			this.root.replaceChild( this.cur_root, cur );
		}

		return this.root;
	},

	actual_replace : function ( cb, match ) {
		var args   = [].slice.call( arguments ),
			str    = args[ args.length - 1 ],
			offset = args[ args.length - 2 ];

		this.append_text( str, this.last_index, offset );

		var node = cb.apply( null, args.slice(1) );
		if ( node && node.nodeType ) {
			this.cur_root.appendChild( node );
			this.last_index = offset + match.length;
		}
	},

	append_text : function ( str, begin, end ) {
		if ( begin === end ) {
			return;
		}
		var node = document.createTextNode();
		node.data = str.slice( begin, end );

		this.cur_root.appendChild( node );
	},

	getTextNodes : function () {
		return [].filter.call( this.root.childNodes, text_node_check );

		function text_node_check ( node ) {
			return node && node.nodeType === 3;
		}
	}
};

function $D ( x ) {
	return x;
}
