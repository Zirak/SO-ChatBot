(function () {
"use strict";

var commands = {
	help : function ( args ) {
		if ( args.length ) {

			var cmd = bot.getCommand( args );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description;
			if ( !desc ) {
				return 'No info is available on command ' + args;
			}

			return args + ': ' + desc;
		}

		return 'https://github.com/Titani/SO-ChatBot/blob/master/README.md';
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

	forget : function ( args ) {
		var name = args.toLowerCase();

		var cmd = bot.getCommand( name );
		if ( cmd.error ) {
			return cmd.error;
		}

		if ( !cmd.canDel(args.get('user_id')) ) {
			return 'You are not authorized to delete the command ' + args;
		}

		cmd.del();
		return 'Command ' + args + ' forgotten.';
	},

	regex : function ( args ) {
		var parts = args.parse(),
			what = parts[ 0 ], pattern = parts[ 1 ], flags = parts[ 2 ] || '';

		var regex = new RegExp( pattern, flags.toLowerCase() ),
			matches = regex.exec( what );

		bot.log( what, pattern, flags, regex, 'regex parsed' );
		bot.log( matches, 'regex matched' );

		if ( !matches ) {
			return 'No matches.';
		}

		return matches.join( ', ' );
	},

	jquery : function jquery ( args ) {
		//check to see if more than one thing is requested
		var splitArgs = args.split( ' ' );
		if ( splitArgs.length > 1 ) {
			return splitArgs.map( jquery ).join( ' ' );
		}

		var props = args.trim().replace( /^\$/, 'jQuery' );

		var parts = props.split( '.' ), exists = false, url = props, msg;
		//parts will contain two likely components, depending on the input
		// jQuery.prop    -  parts[0] will be jQuery, parts[1] will be prop
		// prop           -  parts[0] will be prop
		// jQuery.fn.prop -  that's a special case

		//jQuery API urls works like this:
		// if it's on the jQuery object, then the url is /jQuery.property
		// if it's on the proto, then the url is /property

		//so, the mapping goes like this:
		// jQuery.fn.prop => prop
		// jQuery.prop    => jQuery.prop if it's on jQuery
		// prop           => prop if it's on jQuery.prototype,
		//                   jQuery.prop if it's on jQuery

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
			msg = 'Could not find specified jQuery property ' + args;
		}
		bot.log( msg, '/jquery link' );

		return msg;
	},

	choose : function ( args ) {
		var opts = args.parse();
		bot.log( opts, '/choose input' );

		return opts[ Math.floor(Math.random() * opts.length) ];
	},

	online : function () {
		var avatars = document.getElementById( 'present-users' )
				.getElementsByClassName( 'avatar' );

		return [].map.call( avatars,
			function ( wrapper ) {
				return wrapper.children[ 0 ].title;
			}
		).join( ', ' );
	},

	user : function ( args ) {
		var props = args.replace( ' ', '' ),
			usrid = props || args.get( 'user_id' );

		//check for searching by username, which here just means "there's no
		// digit in there"
		if ( /\D$/.test(usrid) ) {
			var users = [].slice.call( document
				.getElementById( 'sidebar' )
				.getElementsByClassName( 'user-container' ) );

			//grab a list of user ids
			var ids = users.map(function ( container ) {
				return container.id.match( /\d+/ )[ 0 ];
			});
			//and a list of their names
			var names = users.map(function ( container ) {
				return container.getElementsByTagName( 'img' )[ 0 ].title;
			});

			var index = names.indexOf(usrid);
			if ( index > -1 ) {
				usrid = ids[ index ];
			}
			else {
				return 'Ca\'t find user ' + usrid + ' in this chatroom.';
			}
		}

		args.directreply( 'http://stackoverflow.com/users/' + usrid );
	},

	listcommands : function () {
		return 'Available commands: ' +
			Object.keys( bot.commands ).join( ', ' );
	}
};

//cb is for internal usage by other commands/listeners
commands.define = (function () {
var cache = {};

return function ( args, cb ) {
	if ( cache.hasOwnProperty(args) ) {
		return finish( cache[args] );
	}

	var duckyAPI = 'http://api.duckduckgo.com/?',
		params = {
			q : 'define ' + args,
			format : 'json'
		};

	duckyAPI += IO.urlstringify( params );

	IO.jsonp({
		url : duckyAPI,
		fun : finishCall,
		jsonpName : 'callback'
	});

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
			def = 'Could not find definition for ' + args;
		}
		else {
			def = args + ': ' + def; //problem?
			//the chat treats ( as a special character, so we escape!
			def += ' [\\(source\\)](' + url + ')';
		}
		bot.log( def, '/define finishCall output' );

		//add to cache
		cache[ args ] = def;

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
			msg = IO.decodehtml( resp.value.joke );
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
commands.urban = function ( args, cb ) {
	if ( !args.length ) {
		return 'Y U NO PROVIDE ARGUMENTS!?';
	}

	IO.jsonp({
		url:'http://www.urbandictionary.com/iphone/search/define',
		data : {
			term : args.slice()
		},
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		var msg, top;

		if ( resp.result_type === 'no_results' ) {
			msg = 'Y U NO MAEK SENSE!!!???!!?11 No results.';
		}
		else {
			top = resp.list[ 0 ];
			msg = '[' + args + '](' + top.permalink + '): ' + top.definition;
		}

		if ( cb && cb.call ) {
			cb( msg );
		}
		else {
			args.reply( msg );
		}
	}
};
commands.urban.async = true;

commands.parse = (function () {
//special variables
var variables = {
	who : function ( msg ) {
		return msg.get( 'user_name' );
	},

	someone : function () {
		var presentUsers = document.getElementById( 'sidebar' )
			.getElementsByClassName( 'present-user' );

		//the chat keeps a low opacity for users who remained silent for long,
		// and high opacity for those who recently talked
		var active = [].filter.call( presentUsers, function ( user ) {
			return Number( user.style.opacity ) >= 0.5;
		});

		var user = active[ Math.floor(Math.random() * (active.length-1)) ];
		return user.getElementsByTagName( 'img' )[ 0 ].title;
	},

	digit : function () {
		return Math.floor( Math.random() * 10 );
	}
};
//special macros
var funcs = {
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
var varRegex = /(?:.|^)\$(\w+)/g,
	funcRegex = /(?:.|^)\$(\w+)\((.*?)\)/g;

//extraVars is for internal usage via other commands
return function parse ( args, extraVars ) {
	extraVars = extraVars || {};
	bot.log( args, extraVars, '/parse input' );

	return args
		.replace( funcRegex, replaceFunc )
		.replace( varRegex, replaceVar );

	function replaceFunc ( $0, filler, fillerArgs ) {
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

		//check for the function's existance in the funcs object
		if ( funcs.hasOwnProperty(filler) ) {
			//parse the arguments, split them into individual arguments,
			// and trim'em (to cover the case of "arg,arg" and "arg, arg")
			fillerArgs = parse( fillerArgs, extraVars )
				.split( ',' ).invoke( 'trim' );

			console.log( filler, fillerArgs, '/parse func call');
			ret += funcs[ filler ].apply( null, fillerArgs );
		}

		return ret;
	}

	function replaceVar ( $0, filler ) {
		//same as in the above function
		if ( $0.startsWith('$$') ) {
			return $0.slice( 1 );
		}

		var ret = '';
		if ( $0[0] !== '$' ) {
			ret = $0[ 0 ];
		}

		//it's recognized by special extra variables passed
		if ( extraVars.hasOwnProperty(filler) ) {
			ret += extraVars[ filler ];
		}
		//it's a special variables
		else if ( variables.hasOwnProperty(filler) ) {
			ret += variables[ filler ]( args );
		}
		//it's part of the argument variables
		else if ( args.get(filler) ) {
			ret += args.get( filler );
		}
		//it's not defined
		else {
			ret = $0;
		}

		return ret;
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

	//check if the user wants to reply to a message
	var direct = false, msgObj = args.get();
	if ( /\d+$/.test(replyTo) ) {
		msgObj.message_id = replyTo;
		direct = true;
	}
	else {
		msgObj.user_name = replyTo;
	}

	var cmdArgs = bot.makeMessage(
		//the + 2 is for the two spaces after each arg
		args.slice( replyTo.length + cmdName.length + 2 ).trim(),
		msgObj
	);
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

commands.mdn = (function () {

// https://developer.mozilla.org/Special:Tags?tag=DOM
//a lowercaseObjectName => DOMobjectName object, where a falsy value
// means to just use lowercaseObjectName
var DOMParts = {
	'document' : '',
	'element' : '',
	'event' : '',
	'form' : '',
	'node' : 'Node',
	'nodelist' : 'NodeList',
	'range' : '',
	'text' : 'Text',
	'window' : ''
};

return function mdn ( args ) {
	var splittedArgs = args.split( ' ' );
	if ( splittedArgs.length > 1 ) {
		return splittedArgs.map( mdn ).join( ' ' );
	}

	var parts = args.trim().split( '.' ),
		base = 'https://developer.mozilla.org/en/',
		url;

	bot.log( args, parts, '/mdn input' );

	var lowercased = parts[ 0 ].toLowerCase();

	if ( DOMParts.hasOwnProperty(lowercased) ) {
		parts[ 0 ] = DOMParts[ lowercased ] || lowercased;
		url = base + 'DOM/' + parts.join( '.' );

		bot.log( url, '/mdn DOM' );
	}

	else if ( window[parts[0]] ) {
		url = base +
			'JavaScript/Reference/Global_Objects/' + parts.join( '/' );
		bot.log( url, '/mdn global' );
	}

	else {
		url = 'https://developer.mozilla.org/en-US/search?q=' + args;
		bot.log( url, '/mdn unknown' );
	}

	return url;
};
}());

commands.get = (function () {

var types = {
	answer : true,
	question : true
};
var ranges = {
	//the result array is in descending order, so it's "reversed"
	first : function ( arr ) {
		return arr[ arr.length - 1 ];
	},

	last : function ( arr ) {
		return arr[ 0 ];
	},

	between : function ( arr ) {
		//SO api takes care of this for us
		return arr;
	}
};

return function ( args, cb ) {
	var parts = args.parse(),
		type = parts[ 0 ],
		plural = type + 's',

		range = parts[ 1 ] || 'last',
		start, end,

		usrid = parts[ 2 ];

	//if "between" is given, fetch the correct usrid
	if ( range === 'between' ) {
		usrid = parts[ 4 ];
	}

	//range is a number and no usrid, assume the range is the usrid, and
	//default range to last
	if ( !usrid && !isNaN(Number(range)) ) {
		usrid = range;
		range = 'last';
	}

	//if after all this it's falsy, assume the user's id
	if ( !usrid ) {
		usrid = args.get( 'user_id' );
	}

	bot.log( parts, 'get input' );

	if ( !types.hasOwnProperty(type) ) {
		return 'Invalid "getter" name ' + type;
	}
	if ( !ranges.hasOwnProperty(range) ) {
		return 'Invalid range specifier ' + range;
	}

	var url = 'http://api.stackoverflow.com/1.1/users/' + usrid + '/' +
			plural + '?sort=creation';

	bot.log( url, '/get building url' );

	if ( range === 'between' ) {
		start = Date.parse( parts[2] );
		end = Date.parse( parts[3] );
		url += '&fromdate=' + start + '&todate=' + end;

		bot.log( url, '/get building url between' );
	}

	IO.jsonp({
		url : url,
		fun : parseResponse
	});

	function parseResponse ( respObj ) {
		//Une erreru! L'horreur!
		if ( respObj.error ) {
			args.reply( respObj.error.message );
			return;
		}

		//get only the part we care about in the result, based on which one
		// the user asked for (first, last, between)
		var relativeParts = [].concat( ranges[range](respObj[plural]) ),
			base = "http://stackoverflow.com/q/",
			res;

		bot.log( relativeParts.slice(), '/get parseResponse parsing' );

		if ( relativeParts[0] ) {
			//get the id(s) of the answer(s)/question(s)
			res = relativeParts.map(function ( obj ) {
				bot.log( obj );
				return base + ( obj[type + '_id'] || '' );
			}).join( ' ' );
		}
		else {
			res = 'User did not submit any ' + plural;
		}
		bot.log( res, '/get parseResponse parsed');

		if ( cb && cb.call ) {
			cb( res );
		}
		else {
			args.directreply( res );
		}
	}
};
}());
commands.get.async = true;

commands.learn = (function () {
return function ( args ) {
	bot.log( args, '/learn input' );

	var commandParts = args.parse();
	var command = {
		name   : commandParts[ 0 ],
		output : commandParts[ 1 ],
		input  : commandParts[ 2 ] || '.*'
	};

	//a truthy value, unintuitively, means it isn't valid, because it returns
	// an error message
	var invalid = checkCommand( command );
	if ( invalid ) {
		return invalid;
	}
	command.name = command.name.toLowerCase();

	bot.log( commandParts, '/learn parsed' );

	var pattern = new RegExp( command.input );

	bot.addCommand({
		name : command.name,
		fun : customCommand,
		description : 'User-taught command: ' + command.output,
		permissions : {
			use : 'ALL',
			del : 'ALL'
		}
	});

	return 'Command ' + command.name + ' learned';

	function customCommand ( args ) {
		bot.log( args, command.name + ' input' );

		var cmdArgs = bot.makeMessage( command.output, args.get() );
		return commands.parse( cmdArgs, pattern.exec(args) );
	}
};

//return a truthy value (an error message) if it's invalid, falsy if it's
// valid
function checkCommand ( cmd ) {
	var somethingUndefined = Object.keys( cmd ).some(function ( key ) {
		return !cmd[ key ];
	});

	if ( somethingUndefined ) {
		return 'Illegal /learn object';
	}

	if ( !/^\w+$/.test(cmd.name) ) {
		return 'Command name must only contain alphanumeric characters.';
	}

	if ( bot.commandExists(cmd.name.toLowerCase()) ) {
		return 'Command ' + cmd.name + ' already exists';
	}
}
}());

Object.keys( commands ).forEach(function ( cmdName ) {
	bot.addCommand({
		name : cmdName,
		fun  : commands[ cmdName ],
		permissions : {
			del : 'NONE'
		},
		async : commands[ cmdName ].async
	});
});

//only allow specific users to use /die and /live
bot.commands.die.permissions.use = bot.commands.live.permissions.use = [
	419970, //Raynos
	342129, //Matt McDonald
	170224, //Ivo Wetzel
	94197,  //Andy E
	617762  //me (Zirak)
];

}());
