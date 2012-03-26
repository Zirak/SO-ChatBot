(function () {
"use strict";

var commands = {
	help : function ( args ) {
		if ( args.length ) {

			var cmd = bot.getCommand( args );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description || 'No info is available';

			return args + ': ' + desc;
		}

		return (
			'https://github.com/Titani/SO-ChatBot/wiki/' +
				'Interacting-with-the-bot'
		);
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
		var msg = '';
		args.parse().map(function ( usrid ) {
			var id = Number( usrid );
			//name provided instead of id
			if ( /\D/.test(usrid) ) {
				id = findUserid( usrid );
			}

			if ( id < 0 ) {
				msg += 'Cannot find user ' + usrid + '. ';
			}
			else if ( bot.owners.indexOf(id) >= 0 ) {
				msg += 'Cannot mindjail owner ' + usrid + '. ';
				id = -1;
			}

			return id;
		}).forEach( ban );

		return msg;

		function ban ( id ) {
			if ( id < 0 ) {
				return;
			}

			if ( bot.banlist.contains(id) ) {
				msg += 'User ' + id + ' already in mindjail. ';
			}
			else {
				bot.banlist.add( id );
				msg += 'User ' + id + ' added to mindjail. ';
			}
		}
	},

	unban : function ( args ) {
		var msg = '';
		args.parse().map(function ( usrid ) {
			var id = Number( usrid );
			//name provided instead of id
			if ( /\D/.test(usrid) ) {
				id = findUserid( usrid );
			}

			if ( id < 0 ) {
				msg += 'Cannot find user ' + usrid + '. ';
			}

			return Number( id );
		}).forEach( unban );

		return msg;

		function unban ( id ) {
			if ( !bot.banlist.contains(id) ) {
				msg += 'User ' + id + ' isn\'t in mindjail. ';
			}
			else {
				bot.banlist.remove( id );
				msg += 'User ' + id + ' freed from mindjail. ';
			}
		}
	},

	regex : function ( args ) {
		var parts = args.parse(),
			what = parts[ 0 ], pattern = parts[ 1 ], flags = parts[ 2 ] || '',

			regex = new RegExp( pattern, flags.toLowerCase() ),
			matches = regex.exec( what );

		bot.log( what, pattern, flags, regex, 'regex parsed' );
		bot.log( matches, 'regex matched' );

		if ( !matches ) {
			return 'No matches.';
		}

		return matches.map(function ( match ) {
			//have the chat codify the output
			return '`' + match + '`';
		}).join( ', ' );
	},

	jquery : function jquery ( args ) {
		//check to see if more than one thing is requested
		var splitArgs = args.split( ' ' );
		if ( splitArgs.length > 1 ) {
			return splitArgs.map( jquery ).join( ' ' );
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
		var opts = args.parse();
		bot.log( opts, '/choose input' );

		return opts[ Math.floor(Math.random() * opts.length) ];
	},

	online : function () {
		//the pseudo-selector for the user names looks like this:
		//document .present-users .avatar:nth-child(0).title
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
			usrid = props || args.get( 'user_id' ), id = usrid;

		//check for searching by username, which here just means "there's a non
		// digit in there"
		if ( /\D/.test(usrid) ) {
			id = findUserid( usrid );

			if ( id < 0 ) {
				return 'Can\'t find user ' + usrid + ' in this chatroom.';
			}
		}

		args.directreply( 'http://stackoverflow.com/users/' + id );
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
	//we already defined it, grab from memory
	//unless you have alzheimer
	//in which case, you have bigger problems
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
		//talk to the duck!
		url : duckyAPI,
		fun : finishCall,
		jsonpName : 'callback'
	});

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
commands.urban = (function () {
var cache = Object.create( null );

return function ( args, cb ) {
	if ( !args.length ) {
		return 'Y U NO PROVIDE ARGUMENTS!?';
	}

	if ( cache[args] ) {
		return cache[ args ];
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
		var msg, top;

		if ( resp.result_type === 'no_results' ) {
			msg = 'Y U NO MAEK SENSE!!!???!!?11 No results for ' + args;
		}
		else {
			top = resp.list[ 0 ];
			msg = '[' + args + '](' + top.permalink + '): ' + top.definition;
		}
		cache[ args ] = msg;

		if ( cb && cb.call ) {
			cb( msg );
		}
		else {
			args.reply( msg );
		}
	}
};
}());
commands.urban.async = true;

var parse = commands.parse = (function () {
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
		}),
			user = active[ Math.floor(Math.random() * (active.length-1)) ];

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
var varRegex  = /(?:.|^)\$(\w+)/g,
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

			bot.log( filler, fillerArgs, '/parse func call');
			ret += funcs[ filler ].apply( null, fillerArgs );
		}

		//it's passed as an extra function
		else if (
			extraVars.hasOwnProperty(filler) && extraVars[filler].apply
		) {
			ret += extraVars[ filler ].apply( null, fillerArgs );
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
		else if ( args.get && args.get(filler) ) {
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
	if ( /^\d+$/.test(replyTo) ) {
		msgObj.message_id = replyTo;
		direct = true;
	}
	else {
		msgObj.user_name = replyTo;
	}

	var cmdArgs = bot.Message(
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
	'element'  : '',
	'event'    : '',
	'form'     : '',
	'node'     : 'Node',
	'nodelist' : 'NodeList',
	'range'    : '',
	'text'     : 'Text',
	'window'   : ''
};

return function mdn ( args ) {
	var splitArgs = args.split( ' ' );
	if ( splitArgs.length > 1 ) {
		return splitArgs.map( mdn ).join( ' ' );
	}

	var parts = args.trim().split( '.' ),
		base = 'https://developer.mozilla.org/en/',
		url;

	bot.log( args, parts, '/mdn input' );

	//part of the DOM?
	var lowercased = parts[ 0 ].toLowerCase();
	if ( DOMParts.hasOwnProperty(lowercased) ) {
		parts[ 0 ] = DOMParts[ lowercased ] || lowercased;
		url = base + 'DOM/' + parts.join( '.' );

		bot.log( url, '/mdn DOM' );
	}

	//it may be documented as part of the global object
	else if ( window[parts[0]] ) {
		url = base +
			'JavaScript/Reference/Global_Objects/' + parts.join( '/' );
		bot.log( url, '/mdn global' );
	}

	//i unno
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
		type = parts[ 0 ] || 'answer',
		plural = type + 's',

		range = parts[ 1 ] || 'last',
		start, end, //dates used in "between" calls

		usrid = parts[ 2 ];

	//if "between" is given, fetch the correct usrid
	// /get type between start end usrid
	if ( range === 'between' ) {
		usrid = parts[ 4 ];
	}

	//range is a number and no usrid, assume the range is the usrid, and
	// default range to last
	// /get type usrid
	if ( !usrid && !isNaN(range) ) {
		usrid = range;
		range = 'last';
	}

	//if after all this usrid is falsy, assume the user's id
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
		//respObj will have an answers or questions property, based on what we
		// queried for, in array form
		var relativeParts = [].concat( ranges[range](respObj[plural]) ),
			base = "http://stackoverflow.com/q/",
			res;

		bot.log( relativeParts.slice(), '/get parseResponse parsing' );

		if ( relativeParts[0] ) {
			//get the id(s) of the answer(s)/question(s)
			res = relativeParts.map(function ( obj ) {
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
	var errorMessage = checkCommand( command );
	if ( errorMessage ) {
		return errorMessage;
	}
	command.name = command.name.toLowerCase();

	bot.log( commandParts, '/learn parsed' );

	saveCommand( command );
	addCustomCommand( command.name, command.input, command.output );
	return 'Command ' + command.name + ' learned';
};

function addCustomCommand ( name, input, output ) {
	bot.addCommand({
		name : name,
		description : 'User-taught command: ' + output,

		fun : makeCustomCommand( name, input, output ),
		permissions : {
			use : 'ALL',
			del : 'ALL'
		}
	});
}
function makeCustomCommand ( name, input, output ) {
	input = new RegExp( input );

	return function ( args ) {
		bot.log( args, name + ' input' );

		var cmdArgs = bot.Message( output, args.get() );
		//parse is bot.commands.parse
		return parse( cmdArgs, input.exec(args) );
	};
}

//return a truthy value (an error message) if it's invalid, falsy if it's
// valid
function checkCommand ( cmd ) {
	var somethingUndefined = Object.keys( cmd ).some(function ( key ) {
		return !cmd[ key ];
	}),
		error;

	if ( somethingUndefined ) {
		error = 'Illegal /learn object';
	}

	if ( !/^[\w\-]+$/.test(cmd.name) ) {
		error = 'Invalid command name';
	}

	if ( bot.commandExists(cmd.name.toLowerCase()) ) {
		error = 'Command ' + cmd.name + ' already exists';
	}

	return error;
}

//save the learnt command into localStorage
function saveCommand ( cmd ) {
	var storageKey = 'bot-commands',
		commands = JSON.parse( localStorage[storageKey] || '[]' );

	commands.push( cmd );
	localStorage[ storageKey ] = JSON.stringify( commands );
}
//load the learnt commands from localStorage
function loadCommands ( ) {
	var storageKey = 'bot-commands',
		commands = JSON.parse( localStorage[storageKey] || '[]' );

	commands.forEach(function ( cmd ) {
		if ( !bot.commandExists(cmd.name) ) {
			addCustomCommand( cmd.name, cmd.input, cmd.output );
		}
	});
}

loadCommands();
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

//only allow specific users to use certain commands
[ 'die', 'live', 'ban', 'unban' ].forEach(function ( cmdName ) {
	bot.commands[ cmdName ].permissions.use = bot.owners;
});

//utility functions used in some commands
function findUserid ( username ) {
	var users = [].slice.call( document
			.getElementById( 'sidebar' )
			.getElementsByClassName( 'user-container' )
	);

	//grab a list of user ids
	var ids = users.map(function ( container ) {
		return container.id.match( /\d+/ )[ 0 ];
	});
	//and a list of their names
	var names = users.map(function ( container ) {
		return container.getElementsByTagName( 'img' )[ 0 ].title;
	});

	var idx = names.indexOf( username );
	if ( idx < 0 ) {
		return idx;
	}
	return Number( ids[idx] );
}

}());
