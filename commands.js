var parseCommandArgs = (function ( args ) {

	var state, inString, prev;

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

		else if ( ch === ' ' && !inString ) {
			if ( prev === ' ' ) {
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

	return function ( args ) {
		var ret = [],
			arg = '',
			ch,
			pos = 0, len = args.length,
			whatToDo;

		state = 'data';
		inString = false;

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
			throw new Error( 'Unexpected end of input' );
		}

		return ret;
	};

}());

//to be used in commands.mdn
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
	'window' : '',
};

var commands = {
	help : function () {
		return 'https://github.com/Titani/SO-ChatBot/blob/master/README.md';
	},
	
	alive : function () {
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
		return 'Command ' + args + ' was forgotten.';
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

			console.log( url, def, '!!/define finishCall input' );
			
			//Webster returns the definition as
			// word definition: the actual definition
			// instead of just the actual definition
			if ( resp.AbstractSource === 'Merriam Webster' ) {
				def = def.replace( args + ' definition:', '' );
				console.log( def, '!!/define finishCall webster' );
			}

			if ( !def ) {
				def = 'Could not find definition for ' + args;
			}
			else {
				def = args + ': ' + def; //problem?
				def += ' [(source)](' + url + ')';
			}
			console.log( def, '!/define finishCall output' );

			bot.reply( def, msgObj.user_name );
		}
	},

	mdn : function ( args ) {
		var parts = args.trim().split( '.' ),
			base = 	'https://developer.mozilla.org/en/',
			url;

		console.log( args, parts, '!!/mdn input' );

		var lowercased = parts[ 0 ].toLowerCase();

		if ( DOMParts.hasOwnProperty(lowercased) ) {
			parts[ 0 ] = DOMParts[ lowercased ] || parts[ 0 ];
			url = base + 'DOM/';

			if ( parts.length > 1 ) {
				url += parts.join( '.' );
			} else {
				url += parts[ 0 ];
			}
			console.log( url, '!!/mdn DOM' );
		}

		else if ( window[parts[0]] ) {
			url = base +
				  'JavaScript/Reference/Global_Objects/' +
				  parts.join( '/' );
			console.log( url, '!!/mdn global' );
		}

		else {
			url = 'https://developer.mozilla.org/en-US/search?q=' + args;
			console.log( url, '!!/mdn unknown' );
		}

		return url;
	},

	jquery : function ( args ) {
		args = args.trim().replace( /^\$/, 'jQuery' );

		var parts = args.split( '.' ), exists = false, msg;
		//parts will contain two likely components, depending on the user input
		// user gave jQuery.prop - parts[0] will be jQuery, parts[1] will
		//  be prop
		// user gave prop - parts[0] will be prop
		// user gave jQuery.fn.prop - that's a special case

		console.log( args, parts, '!!/jquery input' );

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
			args = 'jQuery.' + parts[0];
			exists = true;
		}

		if ( exists ) {
			msg = 'http://api.jquery.com/' + args;
		}
		else {
			msg = 'Could not find specified jQuery property ' + args;
		}
		console.log( msg, '!!/jquery link' );

		return msg;
	},

	online : function () {
		var avatars = document.getElementById('present-users')
				.getElementsByClassName('avatar');

		return [].map.call( avatars,
			function ( wrapper ) {
				return wrapper.children[ 0 ].title;}
			).join( ', ' );
	},


	user : function ( args, msgObj ) {
		var senderID = msgObj.user_id;
		return 'http://stackoverflow.com/users/' + ( args || senderID );
	},

	listcommands : function () {
		return 'Available commands:' + Object.keys( bot.commands ).join( ', ' );
	}
};

commands.get = (function () {
var types = {
		answer : true,
		question : true,
	},
	range = {
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

		relativity = parts[ 1 ] || 'last',
		start, end,

		usrid = parts[ 2 ];

	//if "between" is given without the optional user_id, then assume the
	// sender's id
	if ( relativity === 'between' && isNaN(Number(usrid)) ) {
		usrid = msgObj.user_id;
	}

	//relativity is a number and no usrid, assume the relativity is the usrid
	if ( !usrid && !isNaN(Number(relativity)) ) {
		usrid = relativity;
		relativity = 'last';
	}
	else if ( !usrid ) {
		usrid = msgObj.user_id;
	}

	console.log( parts, 'get input' );

	if ( !types.hasOwnProperty(type) ) {
		return 'Invalid "getter" name ' + type;
	}
	if ( !range.hasOwnProperty(relativity) ) {
		return 'Invalid range specifier ' + relativity;
	}

	var url = 'http://api.stackoverflow.com/1.1/users/' + usrid + '/' +
			plural + '?sort=creation';

	console.log( url, 'get building url' );

	if ( relativity === 'between' ) {
		start = Date.parse( parts[2] );
		end = Date.parse( parts[3] );
		url += '&fromdate=' + start + '&todate=' + end;

		console.log( url, 'get building url between' );
	}

	IO.jsonp({
		url : url,
		fun : parseResponse
	});

	return 'Retrieving ' + type;

	function parseResponse ( respObj ) {

		if ( respObj.error ) {
			bot.reply( respObj.error.message, msgObj.user_name );
			return;
		}

		var relativeParts = [].concat( range[relativity]( respObj[plural] ) ),
			base = "http://stackoverflow.com/q/",
			res;

		console.log( relativeParts.slice(), 'get parseResponse parsing' );

		if ( relativeParts.length ) {
			res = relativeParts.map(function ( obj ) {
				console.log( obj );
				return base + ( obj[type + '_id'] || '' );
			}).join( ' ' );
		}
		else {
			res = 'User did not submit any ' + plural;
		}
		console.log( res, 'get parseResponse parsed');

		bot.directreply( res, msgObj.message_id );
	}
};
}());

commands.learn = (function () {

//special variables that are recognized in output patterns
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

return function ( args ) {
	console.log( args, 'learn input' );

	var commandParts = parseCommandArgs( args ),
		command = {
			name   : commandParts[ 0 ],
			output : commandParts[ 1 ],
			input  : commandParts[ 2 ] || '.*',
			flags  : commandParts[ 3 ]
		};

	console.log( commandParts, 'learn parsed' );

	if ( !/^\w+$/.test(command.name) ) {
		return 'Command name must only contain alphanumeric characters.';
	}

	if ( !command.name || !command.input || !command.output ) {
		return 'Illegal /learn object ' + args;
	}

	command.name = command.name.toLowerCase();

	if ( bot.commandExists(command.name) ) {
		return 'Command ' + command.name + ' already exists';
	}

	//the input regular expression have a slightly syntax: instead of \w, for
	// instance, you do ~w. to write a ~, you do ~~
	command.input = command.input.replace(
		/~./g,
		function ( ch ) {
			ch = ch[ 1 ];
			if ( ch === '~' ) {
				return '~';
			}
			return '\\' + ch;
		}
	);

	var pattern = new RegExp( command.input, command.flags ),
		out = command.output;

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

		var match = pattern.exec( args ) || [],
			msg = out;
		console.log( match, command.name + ' replace #1' );
		msg = msg.replace( /(?:.|^)\$(\w+)/g, replacePart );

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
			
			if ( match.hasOwnProperty(filler) ) {
				ret += match[ filler ];
			}
			else if ( fillers.hasOwnProperty(filler) ) {
				ret += fillers[ filler ]( msgObj );
			}
			else if ( msgObj.hasOwnProperty(filler) ) {
				ret += msgObj[ filler ];
			}
			else {
				ret += $0.slice( 1 );
			}

			return ret;
		}

		console.log( msg, command.name + ' output' );
		return msg;
	}
};
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

bot.commands.die.permissions.use = bot.commands.alive.permissions.use = [
	419970, //Raynos
	342129, //Matt McDonald
	170224, //Ivo Wetzel
	94197,  //Andy E
	617762  //me (Zirak)
];

