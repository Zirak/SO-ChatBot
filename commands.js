var parseCommandArgs = (function ( args ) {

	var state, inString, prev, separator;

	var handleChar = function ( ch ) {
		var ret;

		if ( state === 'escape' ) {
			ret = ch;
			state = 'data';
		}

		else if ( ch === '"' ) {
			inString = !inString;
			state = 'data';
			ret = '';
		}

		else if ( ch === '\\' ) {
			ret = '';
			state = 'escape';
		}

		else if ( ch === separator && !inString ) {
			if ( prev === separator ) {
				ret = '';
			}
			else {
				ret = 'NEW';
			}
		}

		else if ( state === 'data' ) {
			ret = ch;
		}

		prev = ch;

		return ret;
	};

	return function ( args, sep ) {
		var ret = [],
			arg = '',
			ch,
			pos = 0, len = args.length,
			whatToDo;

		state = 'data';
		inString = false;
		separator = sep || ' ';

		while ( pos < len ) {
			ch = args[ pos++ ];
			whatToDo = handleChar( ch );

			if ( whatToDo === 'NEW' ) {
				ret.push( arg );
				arg = '';
			}
			else {
				arg += whatToDo;
			}
		}
		ret.push( arg );

		if ( inString ) {
			throw new Error( 'Unexpected end of input; expected \"' );
		}

		return ret;
	};

}());

var commands = {
	help : function ( args ) {
		if ( args ) {
			if ( !bot.commandExists(args) ) {
				return 'Command ' + args + ' isn\'t defined';
			}

			var desc = bot.commands[ args ].description;
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
		bot.stopped = false;
		return 'And on this day, you shall paint eggs for a giant bunny.';
	},

	die : function () {
		if ( this.stopped ) {
			return 'Kill me once, shame on you, kill me twice...';
		}
		bot.stopped = true;
		return 'You killed me!';
	},

	forget : function ( args, msgObj ) {
		if ( !bot.commandExists(args) ) {
			return 'Command ' + args + ' does not exist';
		}

		var cmd = bot.commands[ args ];
		if ( !cmd.canDel(msgObj.user_id) ) {
			return 'You are not authorized to delete the command ' + args;
		}

		cmd.del();
		return 'Command ' + args + ' forgotten.';
	},

	define : function ( args, msgObj ) {
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

			console.log( url, def, '/define finishCall input' );

			//Webster returns the definition as
			// wordName definition: the actual definition
			// instead of just the actual definition
			if ( resp.AbstractSource === 'Merriam-Webster' ) {
				def = def.replace( args + ' definition: ', '' );
				console.log( def, '/define finishCall webster' );
			}

			if ( !def ) {
				def = 'Could not find definition for ' + args;
			}
			else {
				def = args + ': ' + def; //problem?
				def += ' [(source)](' + url + ')';
			}
			console.log( def, '/define finishCall output' );

			bot.reply( def, msgObj );
		}
	},

	norris : function ( args, msgObj ) {
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
				msg = resp.value.joke.replace( '&amp;quot;', '\"' );
			}

			bot.reply( msg, msgObj );
		}
	},

	jquery : function ( args ) {
		//check to see if more than one thing is requested
		var parsedArgs = parseCommandArgs( args );
		if ( parsedArgs.length > 1 ) {
			return parsedArgs.map( bot.commands.jquery.fun ).join( ' ' );
		}

		args = args.trim().replace( /^\$/, 'jQuery' );

		var parts = args.split( '.' ), exists = false, url = args, msg;
		//parts will contain two likely components, depending on the input
		// jQuery.prop    -  parts[0] will be jQuery, parts[1] will be prop
		// prop           -  parts[0] will be prop
		// jQuery.fn.prop -  that's a special case

		console.log( args, parts, '/jquery input' );

		//jQuery API urls works like this:
		// if it's on the jQuery object, then the url is /jQuery.property
		// if it's on the proto, then the url is /property

		//user gave something like jQuery.fn.prop, turn that to just prop
		if ( parts.length === 3 ) {
			parts = [ parts[2] ];
		}

		//check to see if it's a property on the jQuery object itself
		if ( parts[0] === 'jQuery' && jQuery[parts[1]] ) {
			exists = true;
		}

		//user wants something on the prototype?
		else if ( parts.length === 1 && jQuery.prototype[parts[0]] ) {
			exists = true;
		}

		//user just wanted a property? maybe.
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
		console.log( msg, '/jquery link' );

		return msg;
	},

	roll : function ( args ) {
		var nums = args.match( /\d+/g ),
			sides, count;

		console.log( nums, '/roll input' );

		if ( !nums || !nums.length ) {
			return 'Invalid input for /roll'; //should probably be better...
		}

		if ( nums.length === 1 ) {
			sides = 6;
			count = nums[ 0 ];
		}
		else if ( nums.length > 1 ) {
			count = nums[ 0 ];
			sides = nums[ 1 ];
		}
		console.log( count, sides, '/roll rolling')

		var rolls = [];
		var max = sides - 1;
		for ( var i = 0; i < count; i++ ) {
			rolls[ i ] = Math.floor( Math.random() * max + 1 );
		}

		return rolls.join( ', ' );
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

	user : function ( args, msgObj ) {
		//to support names with spaces in the, you can call like "user name"
		args = parseCommandArgs( args )[ 0 ];
		var usrid = args || msgObj.user_id;

		//check for searching by username
		if ( /^[\w\s]+$/.test(usrid) ) {
			var users = [].slice.call( document
				.getElementById( 'sidebar' )
				.getElementsByClassName( 'user-container' ) );

			var ids = users.map(function ( container ) {
				return container.id.match( /\d+/ )[ 0 ];
			});
			var names = users.map(function ( container ) {
				return container.getElementsByTagName( 'img' )[ 0 ].title;
			});

			var index = names.indexOf(usrid);
			if ( index > -1 ) {
				usrid = ids[ index ];
			}
		}

		return 'http://stackoverflow.com/users/' + usrid;
	},

	listcommands : function () {
		return 'Available commands: ' +
			Object.keys( bot.commands ).join( ', ' );
	}
};

commands.parse = (function () {

//special variables/macros
var fillers = {
	who : function ( msgObj ) {
		return msgObj.user_name;
	},

	someone : function () {
		var active = document.getElementById( 'sidebar' )
			.getElementsByClassName( 'present-user' );

		active = [].filter.call( active, function ( user ) {
			return Number( user.style.opacity ) >= 0.5;
		});

		var user = active[ Math.floor(Math.random() * active.length) ];
		return user.getElementsByTagName( 'img' )[ 0 ].title;
	},

	digit : function () {
		return Math.floor( Math.random() * 10 );
	}
};
var fillerRegex = /(?:.|^)\$(\w+)/g;

//extraVars is for internal usage via other commands
return function ( args, msgObj, extraVars ) {
	console.log( args, extraVars, '/parse input' );
	extraVars = extraVars || {};

	return args.replace( fillerRegex, replacePart );

	function replacePart ( $0, filler ) {
		if ( $0.startsWith('$$') ) {
			return $0.slice( 1 );
		}

		//include the character that was matched in the $$ check, unless
		// it's a $
		var ret = '';
		if ( $0[0] !== '$' ) {
			ret = $0[ 0 ];
		}

		//it's recognized by special extra variables passed
		if ( extraVars.hasOwnProperty(filler) ) {
			ret += extraVars[ filler ];
		}
		//it's a special variables
		else if ( fillers.hasOwnProperty(filler) ) {
			ret += fillers[ filler ]( msgObj );
		}
		//it's part of msgObj
		else if ( msgObj.hasOwnProperty(filler) ) {
			ret += msgObj[ filler ];
		}
		//it's not defined
		else {
			ret = $0;
		}

		return ret;
	}
}
}());

commands.tell = (function () {

var invalidCommands = { tell : true, forget : true };

return function ( args, msgObj ) {
	//[ usrname|msgid, cmdName, cmdArgs ]
	args = parseCommandArgs( args );

	var replyTo = args[ 0 ],
		cmdName = args[ 1 ],
		cmdArgs = args.slice( 2 ).join( ' ' ),
		cmd;

	if ( !bot.commandExists(cmdName) ) {
		return 'Unidentified command ' + cmdName;
	}
	if ( invalidCommands.hasOwnProperty(cmdName) ) {
		return 'Command ' + cmdName + ' cannot be used in /tell.';
	}

	cmd = bot.commands[ cmdName ];

	if ( !cmd.canUse(msgObj.user_id) ) {
		return 'You do not have permission to use command ' + cmdName;
	}

	//check if the user wants to reply to a message
	var direct = false;
	if ( /\d+$/.test(replyTo) ) {
		msgObj.message_id = replyTo;
		direct = true;
	}
	else {
		msgObj.user_name = replyTo;
	}

	var res = cmd.fun.call( cmd.thisArg, cmdArgs, msgObj );

	if ( !res ) {
		return;
	}

	if ( direct ) {
		bot.directreply( res, msgObj );
	}
	else {
		bot.reply( res, msgObj );
	}
};
}());

commands.mdn = (function () {

// https://developer.mozilla.org/Special:Tags?tag=DOM
//a lowercaseObjectName => DOM/objectName object, where a falsy value
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

return function ( args ) {
	var parts = args.trim().split( '.' ),
		base = 'https://developer.mozilla.org/en/',
		url;

	console.log( args, parts, '/mdn input' );

	var lowercased = parts[ 0 ].toLowerCase();

	if ( DOMParts.hasOwnProperty(lowercased) ) {
		parts[ 0 ] = DOMParts[ lowercased ] || lowercased;
		url = base + 'DOM/';

		if ( parts.length > 1 ) {
			url += parts.join( '.' );
		} else {
			url += parts[ 0 ];
		}
		console.log( url, '/mdn DOM' );
	}

	else if ( window[parts[0]] ) {
		url = base +
			'JavaScript/Reference/Global_Objects/' + parts.join( '/' );
		console.log( url, '/mdn global' );
	}

	else {
		url = 'https://developer.mozilla.org/en-US/search?q=' + args;
		console.log( url, '/mdn unknown' );
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

return function ( args, msgObj ) {
	var parts = parseCommandArgs( args ),
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
		usrid = msgObj.user_id;
	}

	console.log( parts, 'get input' );

	if ( !types.hasOwnProperty(type) ) {
		return 'Invalid "getter" name ' + type;
	}
	if ( !ranges.hasOwnProperty(range) ) {
		return 'Invalid range specifier ' + range;
	}

	var url = 'http://api.stackoverflow.com/1.1/users/' + usrid + '/' +
			plural + '?sort=creation';

	console.log( url, '/get building url' );

	if ( range === 'between' ) {
		start = Date.parse( parts[2] );
		end = Date.parse( parts[3] );
		url += '&fromdate=' + start + '&todate=' + end;

		console.log( url, '/get building url between' );
	}

	IO.jsonp({
		url : url,
		fun : parseResponse
	});

	return 'Retrieving ' + type;

	function parseResponse ( respObj ) {
		//Une erreru! L'horreur!
		if ( respObj.error ) {
			bot.reply( respObj.error.message, msgObj );
			return;
		}

		//get only the part we care about in the result, based on which one
		// the user asked for (first, last, between)
		var relativeParts = [].concat( ranges[range](respObj[plural]) ),
			base = "http://stackoverflow.com/q/",
			res;

		console.log( relativeParts.slice(), '/get parseResponse parsing' );

		if ( relativeParts.length ) {
			//get the id(s) of the answer(s)/question(s)
			res = relativeParts.map(function ( obj ) {
				console.log( obj );
				return base + ( obj[type + '_id'] || '' );
			}).join( ' ' );
		}
		else {
			res = 'User did not submit any ' + plural;
		}
		console.log( res, '/get parseResponse parsed');

		bot.directreply( res, msgObj );
	}
};
}());

commands.learn = (function () {

return function ( args ) {
	console.log( args, '/learn input' );

	var commandParts = parseCommandArgs( args );
	var command = {
		name   : commandParts[ 0 ],
		output : commandParts[ 1 ],
		input  : commandParts[ 2 ] || '.*'
	};

	//a truthy value, unintuitively, means it isn't valid
	var invalid = checkCommand( command );
	if ( invalid ) {
		return invalid;
	}
	command = buildCommand( command );

	console.log( commandParts, '/learn parsed' );

	var pattern = new RegExp( command.input );

	bot.addCommand({
		name : command.name,
		fun : customCommand,
		description : 'User-taught command',
		permissions : {
			use : 'ALL',
			del : 'ALL'
		}
	});

	return 'Command ' + command.name + ' learned';

	function customCommand ( args, msgObj ) {
		console.log( args, command.name + ' input' );
		return command.parse( command.output, msgObj, pattern.exec(args) );
	}
};

function buildCommand ( cmd ) {
	console.log( cmd, '/learn buildCommand input' );

	cmd.name = cmd.name.toLowerCase();
	//the input regular expression have a slightly syntax: instead of \w, for
	// instance, you do ~w. to write a ~, you do ~~
	cmd.input = cmd.input.replace(
		/~./g,
		function ( ch ) {
			ch = ch[ 1 ];
			if ( ch === '~' ) {
				return ch;
			}
			return '\\' + ch;
		}
	);

	return cmd;
}

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
		}
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
