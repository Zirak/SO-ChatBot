var format = {
	chat : document.getElementById( 'chat' ),
	is_bot : false,
	idents : {
		bot  : 'http://www.gravatar.com/avatar/2d7aced56559de2ecc26577fd1cba614?s=32&d=identicon&r=PG',
		user : 'http://i.imgur.com/S4qPd.jpg'
	},

	add  : function ( msg, is_user ) {
		//too lazy, already wrote all the is_bot
		this.is_bot = !is_user;
		chat.appendChild( this.wrap(msg) );
	},

	wrap : function ( msg ) {
		var cont = this.container();

		cont.appendChild( this.ident() );
		cont.appendChild( this.text(msg) );

		return cont;
	},

	container : function () {
		var ret = document.createElement( 'div' );
		ret.classList.add( 'message' );

		if ( this.is_bot ) {
			ret.classList.add( 'bot' );
		}
		return ret;
	},

	text : function ( md ) {
		var elem = document.createElement( 'div' );
		elem.className = 'text';

		if ( this.is_bot ) {
			elem.appendChild( mini_md.parse(md) );
		}
		else {
			elem.textContent = md;
		}

		return elem;
	},

	ident : function () {
		var img = new Image( 32, 32 );
		img.src = this.idents[ this.is_bot ? 'bot' : 'user' ];
		img.className = 'ident';

		return img;
	}
};

var mini_md = {
	tab  : '    ',
	link_re : /(https?:\/\/.+?\.[^\)\s]+(?!\())/g,
	link_md : /\[(.+?)\]\(((?:https?|ftp):\/\/.+?\..+?)\)/g,
	code_md : /`(.+?)`/g, //this will have to do...

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
		link.target = '_blank';
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

	/*
	For getting this far through the code, here is some pie:

			 (
			  )
		 __..---..__
	 ,-='  /  |  \  `=-.
	:--..___________..--;
	 \.,_____________,./
	*/

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

//THIS SUCKS, I KNOW IT AND YOU KNOW IT.
format.add( 'Welcome to the chatbot demo! My name is Hal.' );
format.add(
	'For interaction tips please type `/help`, ' +
	'and for a list of available commands try `/listCommands`.' );
