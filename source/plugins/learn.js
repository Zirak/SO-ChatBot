(function () {
var parse;

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

	parse = bot.getCommand( 'parse' );
	if ( parse.error ) {
		console.error( '/parse not loaded, cannot /learn' );
		return 'Failed; /parse not loaded';
	}
	console.log( parse );

	bot.log( command, '/learn parsed' );

	addCustomCommand( command );
	return 'Command ' + command.name + ' learned';
};

function addCustomCommand ( command ) {
	bot.addCommand({
		name : command.name,
		description : 'User-taught command: ' + command.output,

		fun : makeCustomCommand( command ),
		permissions : {
			use : 'ALL',
			del : 'ALL'
		}
	});
}
function makeCustomCommand ( command ) {

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


bot.addCommand({
	name : 'learn',
	fun  : learn,
	privileges : {
		del : 'NONE',
	},

	description : 'Teaches the bot a command. ' +
		'`/learn cmdName cmdOutputMacro [cmdInputRegex]`'
});
}());
