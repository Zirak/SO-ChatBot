(function () {
"use strict";

var commands = {
	help : function ( args ) {
		if ( args && args.length ) {

			var cmd = bot.getCommand( args );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description || 'No info is available';

			return args + ': ' + desc;
		}

		return (
			'https://github.com/Zirak/SO-ChatBot/wiki/' +
				'Interacting-with-the-bot'
		);
	},

	listen : function ( msg ) {
		return bot.callListeners( msg );
	},

	eval : function ( msg ) {
		return bot.eval( msg );
	},

	live : function () {
		if ( !bot.stopped ) {
			return 'I\'m not dead! Honest!';
		}
		bot.continue();
		return 'And on this day, you shall paint eggs for a giant bunny.';
	},

	die : function () {
		if ( bot.stopped ) {
			return 'Kill me once, shame on you, kill me twice...';
		}
		bot.stop();
		return 'You killed me!';
	},

	refresh : function() {
		window.location.reload();
    },

	forget : function ( args ) {
		var name = args.toLowerCase(),
			cmd = bot.getCommand( name );

		if ( cmd.error ) {
			return cmd.error;
		}

		if ( !cmd.canDel(args.get('user_id')) ) {
			return 'You are not authorized to delete the command ' + args;
		}

		cmd.del();
		return 'Command ' + name + ' forgotten.';
	},

	ban : function ( args ) {
		var msg = [];
		args.parse().map( getID ).forEach( ban );

		return msg.join( ' ' );

		function getID ( usrid ) {
			//name provided instead of id
			if ( /\D/.test(usrid) ) {
				usrid = args.findUserid( usrid.replace(/^@/, '') );
			}

			var id = Number( usrid );
			if ( id < 0 ) {
				msg.push( 'Cannot find user ' + usrid + '.' );
				id = -1;
			}
			else if ( bot.isOwner(id) ) {
				msg.push( 'Cannot mindjail owner ' + usrid + '.' );
				id = -1;
			}

			return id;
		}

		function ban ( id ) {
			if ( id < 0 ) {
				return;
			}

			if ( bot.banlist.contains(id) ) {
				msg.push( 'User ' + id + ' already in mindjail.' );
			}
			else {
				bot.banlist.add( id );
				msg.push( 'User ' + id + ' added to mindjail.');
			}
		}
	},

	unban : function ( args ) {
		var msg = [];
		args.parse().map( getID ).forEach( unban );

		return msg.join( ' ' );

		function getID ( usrid ) {
			//name provided instead of id
			if ( /\D/.test(usrid) ) {
				usrid = args.findUserid( usrid.replace(/^@/, '') );
			}

			var id = Number( usrid );
			if ( id < 0 ) {
				msg.push( 'Cannot find user ' + usrid + '.' );
				id = -1;
			}
			else if ( bot.isOwner(id) ) {
				msg.push( 'Cannot mindjail owner ' + usrid + '.' );
				id = -1;
			}

			return id;
		}

		function unban ( id ) {
			if ( !bot.banlist.contains(id) ) {
				msg.push( 'User ' + id + ' isn\'t in mindjail.' );
			}
			else {
				bot.banlist.remove( id );
				msg.push( 'User ' + id + ' freed from mindjail.' );
			}
		}
	},

	regex : function ( args ) {
		var parts = args.parse(),

			what = parts.shift(),
			pattern = parts.shift(),
			flags = parts.shift() || '',

			regex = new RegExp( pattern, flags.toLowerCase() ),
			matches = regex.exec( what );

		bot.log( what, pattern, flags, regex, 'regex parsed' );
		bot.log( matches, 'regex matched' );

		if ( !matches ) {
			return 'No matches.';
		}

		return matches.map(function ( match ) {
			return '`' + match + '`';
		}).join( ', ' );
	},

	jquery : function jquery ( args ) {
		//check to see if more than one thing is requested
		var parsed = args.parse( true );
		if ( parsed.length > 1 ) {
			return parsed.map( jquery ).join( ' ' );
		}

		var props = args.trim().replace( /^\$/, 'jQuery' ),

			parts = props.split( '.' ), exists = false,
			url = props, msg;
		//parts will contain two likely components, depending on the input
		// jQuery.fn.prop -  parts[0] = jQuery, parts[1] = prop
		// jQuery.prop    -  parts[0] = jQuery, parts[1] = prop
		// prop           -  parts[0] = prop
		//
		//jQuery API urls works like this:
		// if it's on the jQuery object, then the url is /jQuery.property
		// if it's on the proto, then the url is /property
		//
		//so, the mapping goes like this:
		// jQuery.fn.prop => prop
		// jQuery.prop    => jQuery.prop if it's on jQuery
		// prop           => prop if it's on jQuery.prototype,
		//                     jQuery.prop if it's on jQuery

		bot.log( props, parts, '/jquery input' );

		//user gave something like jQuery.fn.prop, turn that to just prop
		// jQuery.fn.prop => prop
		if ( parts.length === 3 ) {
			parts = [ parts[2] ];
		}

		//check to see if it's a property on the jQuery object itself
		// jQuery.prop => jQuery.prop
		if ( parts[0] === 'jQuery' && jQuery[parts[1]] ) {
			exists = true;
		}

		//user wants something on the prototype?
		// prop => prop
		else if ( parts.length === 1 && jQuery.prototype[parts[0]] ) {
			url = parts[ 0 ];
			exists = true;
		}

		//user just wanted a property? maybe.
		// prop => jQuery.prop
		else if ( jQuery[parts[0]] ) {
			url = 'jQuery.' + parts[0];
			exists = true;
		}

		if ( exists ) {
			msg = 'http://api.jquery.com/' + url;
		}
		else {
			msg = 'http://api.jquery.com/?s=' + encodeURIComponent( args );
		}
		bot.log( msg, '/jquery link' );

		return msg;
	},

	choose : function ( args ) {
		var opts = args.parse().filter( conjunctions ),
			rnd = Math.random(),
			len = opts.length;

		bot.log( opts, rnd, '/choose input' );

		//10% chance to get a "none-of-the-above"
		if ( rnd < 0.1 ) {
			return len === 2 ? 'Neither' : 'None of the above';
		}
		//15% chance to get "all-of-the-above"
		// (the first 10% are covered in the previous option)
		else if ( rnd < 0.25 ) {
			return len === 2 ? 'Both!' : 'All of the above';
		}

		return opts[ Math.floor(Math.random() * len) ];

		//TODO: add support for words like and, e.g.
		// skip and jump or cry and die
		//  =>
		// "skip and jump", "cry and die"
		function conjunctions ( word ) {
			return word !== 'or';
		}
	},

	user : function ( args ) {
		var props = args.parse(),
			usrid = props[ 0 ] || args.get( 'user_id' ),
			id = usrid;

		//check for searching by username
		if ( !(/^\d+$/.test(usrid)) ) {
			id = args.findUserid( usrid );

			if ( id < 0 ) {
				return 'Can\'t find user ' + usrid + ' in this chatroom.';
			}
		}

		args.directreply( 'http://stackoverflow.com/users/' + id );
	},

	listcommands : function () {
		return 'Available commands: ' +
			Object.keys( bot.commands ).join( ', ' );
	},

	purgecommands : function ( args ) {
		var id = args.get( 'user_id' );
		Object.keys( bot.commands ).map( mapper ).forEach( del );

		return 'The deed has been done.';

		function mapper ( cmdName ) {
			return bot.commands[ cmdName ];
		}
		function del ( cmd ) {
			if ( cmd.learned && cmd.canDel(id) ) {
				cmd.del();
			}
		}
	}
};

commands.define = (function () {
var cache = Object.create( null );

//cb is for internal usage by other commands/listeners
return function ( args, cb ) {
	//we already defined it, grab from memory
	//unless you have alzheimer
	//in which case, you have bigger problems
	if ( cache[args] ) {
		return finish( cache[args] );
	}

	IO.jsonp.ddg( 'define ' + args.toString(), finishCall );

	//the duck talked back! either the xhr is complete, or the hallucinations
	// are back
	function finishCall ( resp ) {
		var url = resp.AbstractURL,
			def = resp.AbstractText;

		bot.log( url, def, '/define finishCall input' );

		//Webster returns the definition as
		// wordName definition: the actual definition
		// instead of just the actual definition
		if ( resp.AbstractSource === 'Merriam-Webster' ) {
			def = def.replace( args + ' definition: ', '' );
			bot.log( def, '/define finishCall webster' );
		}

		if ( !def ) {
			def = 'Could not find definition for ' + args +
				'. Trying Urban Dictionary';
			bot.getCommand( 'urban' ).exec( args );
		}
		else {
			def = args + ': ' + def; //problem?
			//the chat treats ( as a special character, so we escape!
			def += ' [\\(source\\)](' + url + ')';
			//add to cache
			cache[ args ] = def;
		}
		bot.log( def, '/define finishCall output' );

		finish( def );
	}

	function finish ( def ) {
		if ( cb && cb.call ) {
			cb( def );
		}
		else {
			args.directreply( def );
		}
	}
};
}());
commands.define.async = true;

//cb is for internal usage by other commands/listeners
commands.norris = function ( args, cb ) {
	var chucky = 'http://api.icndb.com/jokes/random';

	IO.jsonp({
		url : chucky,
		fun : finishCall,
		jsonpName : 'callback'
	});

	function finishCall ( resp ) {
		var msg;

		if ( resp.type !== 'success' ) {
			msg = 'Chuck Norris is too awesome for this API. Try again.';
		}
		else {
			msg = IO.decodehtmlEntities( resp.value.joke );
		}

		if ( cb && cb.call ) {
			cb( msg );
		}
		else {
			args.reply( msg );
		}
	}
};
commands.norris.async = true;

//cb is for internal blah blah blah
commands.urban = (function () {
var cache = Object.create( null );

return function ( args, cb ) {
	if ( !args.length ) {
		return 'Y U NO PROVIDE ARGUMENTS!?';
	}

	if ( cache[args] ) {
		return finish( cache[args] );
	}

	IO.jsonp({
		url:'http://www.urbandictionary.com/iphone/search/define',
		data : {
			term : args.content
		},
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		var msg;

		if ( resp.result_type === 'no_results' ) {
			msg = 'Y U NO MAEK SENSE!!!???!!?11 No results for ' + args;
		}
		else {
			msg = formatTop( resp.list[0] );
		}
		cache[ args ] = msg;

		finish( msg );
	}

	function finish ( def ) {
		if ( cb && cb.call ) {
			cb( def );
		}
		else {
			args.reply( def );
		}
	}

	function formatTop ( top ) {
		return args.link( args.toString(), top.permalink ) +
			' ' +
			top.definition;
	}
};
}());
commands.urban.async = true;

var parse = commands.parse = (function () {
var macros = {
	who : function () {
		return [].pop.call( arguments ).get( 'user_name' );
	},

	someone : function () {
		var presentUsers = document.getElementById( 'sidebar' )
			.getElementsByClassName( 'present-user' );

		//the chat keeps a low opacity for users who remained silent for long,
		// and high opacity for those who recently talked
		var active = [].filter.call( presentUsers, function ( user ) {
			return Number( user.style.opacity ) >= 0.5;
		}),
		user = active[ Math.floor(Math.random() * (active.length-1)) ];

		if ( !user ) {
			return 'Nobody! I\'m all alone :(';
		}

		return user.getElementsByTagName( 'img' )[ 0 ].title;
	},

	digit : function () {
		return Math.floor( Math.random() * 10 );
	},

	encode : function ( string ) {
		return encodeURIComponent( string );
	},

	//random number, min <= n <= max
	//treats non-numeric inputs like they don't exist
	rand : function ( min, max ) {
		min = Number( min );
		max = Number( max );

		//handle rand() === rand( 0, 9 )
		if ( !min ) {
			min = 0;
			max = 9;
		}

		//handle rand( max ) === rand( 0, max )
		else if ( !max ) {
			max = min;
			min = 0;
		}

		return Math.floor( Math.random() * (max - min + 1) ) + min;
	}
};
var macroRegex = /(?:.|^)\$(\w+)(?:\((.*?)\))?/g;

//extraVars is for internal usage via other commands
return function parse ( args, extraVars ) {
	var msgObj = ( args.get && args.get() ) || {};
	extraVars = extraVars || {};
	bot.log( args, extraVars, '/parse input' );

	return args.replace( macroRegex, replaceMacro );

	function replaceMacro ( $0, filler, fillerArgs ) {
		//$$ makes a literal $
		if ( $0.startsWith('$$') ) {
			return $0.slice( 1 );
		}

		//include the character that was matched in the $$ check, unless
		// it's a $
		var ret = '';
		if ( $0[0] !== '$' ) {
			ret = $0[ 0 ];
		}

		var macro = findMacro( filler );

		//not found? bummer.
		if ( !macro ) {
			return filler;
		}

		bot.log( macro, filler, fillerArgs, '/parse replaceMacro' );
		//when the macro is a function
		if ( macro.apply ) {
			ret += macro.apply( null, parseMacroArgs(fillerArgs) );
		}
		//when the macro is simply a substitution
		else {
			ret += macro;
		}
		return ret;
	}

	function parseMacroArgs ( macroArgs ) {
		console.log( macroArgs, '/parse parseMacroArgs' );
		if ( !macroArgs ) {
			return [];
		}

		//parse the arguments, split them into individual arguments,
		// and trim'em (to cover the case of "arg,arg" and "arg, arg")
		return (
			parse( macroArgs, extraVars )
				.split( ',' ).invoke( 'trim' ).concat( args )
		);
	}

	function findMacro ( macro ) {
		return (
			[ macros, msgObj, extraVars ].first( hasMacro ) || [] )[ macro ];

		function hasMacro ( obj ) {
			return obj.hasOwnProperty( macro );
		}
	}
};
}());

commands.tell = (function () {

var invalidCommands = { tell : true, forget : true };

return function ( args ) {
	var props = args.parse();
	bot.log( args.valueOf(), props, '/tell input' );

	var replyTo = props[ 0 ],
		cmdName = props[ 1 ],
		cmd;

	if ( !replyTo || !cmdName ) {
		return 'Invalid /tell arguments. Use /help for usage info';
	}

	cmdName = cmdName.toLowerCase();
	cmd = bot.getCommand( cmdName );
	if ( cmd.error ) {
		return cmd.error;
	}

	if ( invalidCommands.hasOwnProperty(cmdName) ) {
		return 'Command ' + cmdName + ' cannot be used in /tell.';
	}

	if ( !cmd.canUse(args.get('user_id')) ) {
		return 'You do not have permission to use command ' + cmdName;
	}

	//check if the user's being a fag
	if ( /^@/.test(replyTo) ) {
		return 'Don\'t be annoying, drop the @, nobody likes a double-ping.';
	}

	//check if the user wants to reply to a message
	var direct = false, msgObj = args.get();
	if ( /^:?\d+$/.test(replyTo) ) {
		msgObj.message_id = replyTo.replace( /^:/, '' );
		direct = true;
	}
	else {
		msgObj.user_name = replyTo;
	}

	var cmdArgs = bot.Message(
		//the + 2 is for the two spaces after each arg
		// /tell replyTo1cmdName2args
		args.slice( replyTo.length + cmdName.length + 2 ).trim(),
		msgObj );
	bot.log( cmdArgs, '/tell calling ' + cmdName );

	//if the command is async, it'll accept a callback
	if ( cmd.async ) {
		cmd.exec( cmdArgs, callFinished );
	}
	else {
		callFinished( cmd.exec(cmdArgs) );
	}

	function callFinished ( res ) {
		if ( !res ) {
			return;
		}

		if ( direct ) {
			args.directreply( res );
		}
		else {
			args.reply( res );
		}
	}
};
}());

commands.mdn = function ( args, cb ) {
	IO.jsonp.google(
		args.toString() + ' site:developer.mozilla.org', finishCall );

	function finishCall ( resp ) {
		if ( resp.responseStatus !== 200 ) {
			finish( 'Something went on fire; status ' + resp.responseStatus );
			return;
		}

		var result = resp.responseData.results[ 0 ];
		bot.log( result, '/mdn result' );
		finish( result.url );
	}

	function finish ( res ) {
		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.reply( res );
		}
	}
};
commands.mdn.async = true;

var descriptions = {
	help : 'Fetches documentation for given command, or general help article.' +
		' `/help [cmdName]`',

	listen : 'Forwards the message to the listen API (as if called without' +
		' the /)',

	eval : 'Forwards message to code-eval (as if the command / was a >)',

	live : 'Resurrects the bot if it\'s down',

	die  : 'Kills the bot',

	refresh : 'Reloads the browser window for the bot',

	forget : 'Forgets a given command. `/forget cmdName`',

	ban : 'Bans a user from using a bot. `/ban usr_id|usr_name`',

	unban : 'Removes a user from bot\'s mindjail. `/unban usr_id|usr_name`',

	regex : 'Executes a regex against text input. `/regex text regex [flags]`',

	jquery : 'Fetches documentation link from jQuery API. `/jquery what`',

	choose : '"Randomly" choose an option given. `/choose option0 option1 ...`',

	user : 'Fetches user-link for specified user. `/user usr_id|usr_name`',

	listcommands : 'This seems pretty obvious',

	purgecommands : 'Deletes all user-taught commands.',

	define : 'Fetches definition for a given word. `/define something`',

	norris : 'Random chuck norris joke!',

	urban : 'Fetches UrbanDictionary definition. `/urban something`',

	parse : 'Returns result of "parsing" message according to the bot\'s mini' +
		'-macro capabilities',

	tell : 'Redirect command result to user/message.' +
		' /tell `msg_id|usr_name cmdName [cmdArgs]`',

	mdn : 'Fetches mdn documentation. `/mdn what`'
};

//only allow owners to use certain commands
var privilegedCommands = {
	die : true, live : true,
	ban : true, unban : true,
	refresh : true, purgecommands : true
};

Object.keys( commands ).forEach(function ( cmdName ) {
	bot.addCommand({
		name : cmdName,
		fun  : commands[ cmdName ],
		permissions : {
			del : 'NONE',
			use : privilegedCommands[ cmdName ] ? bot.owners : 'ALL'
		},
		description : descriptions[ cmdName ],
		async : commands[ cmdName ].async
	});
});

}());
