bot.addCommand({
	name : 'parse',
	fun : function ( args ) {
		var msgObj = args.get(),
			user = bot.users[ args.get('user_id') ],

	    extraVars = Object.merge( msgObj, user );
		bot.log( args, extraVars, '/parse input' );

		return bot.parseMacro( args.toString(), extraVars );
	},
	permissions : { del : 'NONE', use : 'ALL' },

	description : 'Returns result of "parsing" message according to the my ' +
		'mini-macro capabilities (see online docs)',
});
