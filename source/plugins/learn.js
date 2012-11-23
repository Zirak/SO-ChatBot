(function () {
"use strict";
var parse = bot.getCommand( 'parse' );
var storage = JSON.parse( localStorage.bot_learn || '{}' );
loadCommands();

function learn ( args ) {
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
	command.input = new RegExp( command.input );

	bot.log( command, '/learn parsed' );

	addCustomCommand( command );
	saveCommand( command );
	return 'Command ' + command.name + ' learned';
}

function addCustomCommand ( command ) {
	var cmd = bot.Command({
		name : command.name,
		description : 'User-taught command: ' + command.output,

		fun : makeCustomCommand( command ),
		permissions : {
			use : 'ALL',
			del : 'ALL'
		}
	});
	cmd.learned = true;

	cmd.del = (function ( old ) {
		return function () {
			deleteCommand( command.name );
			old();
		};
	}( cmd.del ));

	bot.log( cmd, '/learn addCustomCommand' );
	bot.addCommand( cmd );
}
function makeCustomCommand ( command ) {
	bot.log( command, '/learn makeCustomCommand' );
	return function ( args ) {
		bot.log( args, command.name + ' input' );

		var cmdArgs = bot.Message( command.output, args.get() );
		return parse.exec( cmdArgs, command.input.exec(args) );
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
		error = 'Illegal /learn object; see `/help learn`';
	}

	else if ( !/^[\w\-]+$/.test(cmd.name) ) {
		error = 'Invalid command name';
	}

	else if ( bot.commandExists(cmd.name.toLowerCase()) ) {
		error = 'Command ' + cmd.name + ' already exists';
	}

	return error;
}

function loadCommands () {
	Object.keys( storage ).forEach( teach );

	function teach ( key ) {
		var cmd = JSON.parse( storage[key] );
		cmd.input = new RegExp( cmd.input );

		bot.log( cmd, '/learn loadCommands' );
		addCustomCommand( cmd );
	}
}
function saveCommand ( command ) {
	storage[ command.name ] = JSON.stringify({
		name   : command.name,
		input  : command.input.source,
		output : command.output
	});
	localStorage.bot_learn = JSON.stringify( storage );
}
function deleteCommand ( name ) {
	delete storage[ name ];
	localStorage.bot_learn = JSON.stringify( storage );
}

bot.addCommand({
	name : 'learn',
	fun  : learn,
	privileges : {
		del : 'NONE'
	},

	description : 'Teaches the bot a command. ' +
		'`/learn cmdName cmdOutputMacro [cmdInputRegex]`'
});
}());
