(function () {
"use strict";
var parse = bot.getCommand( 'parse' );
var storage = JSON.parse( localStorage.bot_learn || '{}' );

function learn ( args ) {
	bot.log( args, '/learn input' );

	var commandParts = args.parse();
	var command = {
		name   : commandParts[ 0 ],
		output : commandParts[ 1 ],
		input  : commandParts[ 2 ] || '.*',
		//meta info
		creator: args.get( 'user_name' ),
		date   : new Date()
	};
	command.description = [
		'User-taught command:',
		commandParts[3] || '',
		args.codify( command.output )
	].join( ' ' );

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
		//I hate this duplication
		name : command.name,

		description : command.description,
		creator : command.creator,
		date : command.date,

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
			old.call( cmd );
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
		cmd.date = new Date( Date.parse(cmd.date) );

		bot.log( cmd, '/learn loadCommands' );
		addCustomCommand( cmd );
	}
}
function saveCommand ( command ) {
	//h4x in source/util.js defines RegExp.prototype.toJSON so we don't worry
	// about the input regexp stringifying
	storage[ command.name ] = JSON.stringify( command );
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

	description : 'Teaches me a command. ' +
		'`/learn cmdName outputPattern [inputRegex [description]]`'
});

loadCommands();
}());
