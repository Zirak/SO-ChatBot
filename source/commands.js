(function () {
"use strict";

var commands = {
	help : function ( args ) {
		if ( args && args.length ) {

			var cmd = bot.getCommand( args.toLowerCase() );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description || 'No info is available';

			return args + ': ' + desc;
		}

		return 'https://github.com/Zirak/SO-ChatBot/wiki/' +
			'Interacting-with-the-bot';
	},

	listen : function ( msg ) {
		var ret = bot.callListeners( msg );
		if ( !ret ) {
			return bot.giveUpMessage();
		}
	},

	eval : function ( msg, cb ) {
		return bot.eval( msg, cb );
	},
	coffee : function ( msg, cb ) {
		//yes, this is a bit yucky
		var arg = bot.Message( 'c> ' + msg, msg.get() );
		return commands.eval( arg, cb );
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
		var ret = [];
		if ( args.content ) {
			args.parse().forEach( ban );
		}
		else {
			ret = Object.keys( bot.banlist ).filter( Number ).map( format );
		}

		return ret.join( ' ' ) || 'Nothing to show/do.';

		function ban ( usrid ) {
			var id = Number( usrid ),
				msg;
			if ( isNaN(id) ) {
				id = args.findUserid( usrid.replace(/^@/, '') );
			}

			if ( id < 0 ) {
				msg = 'Cannot find user {0}.';
			}
			else if ( bot.isOwner(id) ) {
				msg = 'Cannot mindjail owner {0}.';
			}
			else if ( bot.banlist.contains(id) ) {
				msg = 'User {0} already in mindjail.';
			}
			else {
				bot.banlist.add( id );
				msg = 'User {0} added to mindjail.';
			}

			ret.push( msg.supplant(usrid) );
		}

		function format ( id ) {
			var user = bot.users[ id ],
				name = user ? user.name : '?';

			return '{0} ({1})'.supplant( id, name );
		}
	},

	unban : function ( args ) {
		var ret = [];
		args.parse().forEach( unban );

		return ret.join( ' ' );

		function unban ( usrid ) {
			var id = Number( usrid ),
				msg;
			if ( isNaN(id) ) {
				id = args.findUserid( usrid.replace(/^@/, '') );
			}

			if ( id < 0 ) {
				msg = 'Cannot find user {0}.';
			}
			else if ( !bot.banlist.contains(id) ) {
				msg = 'User {0} isn\'t in mindjail.';
			}
			else {
				bot.banlist.remove( id );
				msg = 'User {0} freed from mindjail!';
			}

			ret.push( msg.supplant(usrid) );
		}
	},
// zIRAK IS gOING TOkILL ME KEHEHEHEHEH
	zalgo : function ( args ) {var ZALGO=function(ZA_LGO) {				return Math.floor(Math.random() * ZA_LGO);
}/*<([a-z]+) *[^/]*?>*/
		var NO_ZALGO_MESSAGE = args.split('');
		var _var_;var _var;var var_; // It's a `var`ty in here!
		var ZALGO_UP,ZALGO_DOWN,ZALGO_LEFT,ZALGO_RIGHT,ZALGO_MID;
		var NOHOPEONLYZALGO = function() {return NOHOPEONLYZALGO()};;;;;;;;;;/*;;;;*/;;;;;
		// H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ
		var ZALGO_LEVEL = [0,1,2].random();
	var zalgo_up = [
		'\u030d','\u030e','\u0304','\u0305', 
		'\u033f','\u0311','\u0306','\u0310', 
		'\u0352','\u0357','\u0351','\u0307', 
		'\u0308','\u030a','\u0342','\u0343', 
		'\u0344','\u034a','\u034b','\u034c', 
		'\u0303','\u0302','\u030c','\u0350', 
		'\u0300','\u0301','\u030b','\u030f', 
		'\u0312','\u0313','\u0314','\u033d', 
		'\u0309','\u0363','\u0364','\u0365', 
		'\u0366','\u0367','\u0368','\u0369', 
		'\u036a','\u036b','\u036c','\u036d', 
		'\u036e','\u036f','\u033e','\u035b', 
		'\u0346','\u031a' 
	];var zalgo_down = [
		'\u0316','\u0317','\u0318','\u0319', 
		'\u031c','\u031d','\u031e','\u031f', 
		'\u0320','\u0324','\u0325','\u0326', 
		'\u0329','\u032a','\u032b','\u032c', 
		'\u032d','\u032e','\u032f','\u0330', 
		'\u0331','\u0332','\u0333','\u0339', 
		'\u033a','\u033b','\u033c','\u0345', 
		'\u0347','\u0348','\u0349','\u034d', 
		'\u034e','\u0353','\u0354','\u0355', 
		'\u0356','\u0359','\u035a','\u0323' 
	];var zalgo_mid = [
		'\u0315','\u031b','\u0340','\u0341', 
		'\u0358','\u0321','\u0322','\u0327', 
		'\u0328','\u0334','\u0335','\u0336', 
		'\u034f','\u035c','\u035d','\u035e', 
		'\u035f','\u0360','\u0362','\u0338', 
		'\u0337','\u0361','\u0489'
	];
		var ZALGO_RESPONSE = /*Z̶̿̄ͮ̅̎̽Ą͖̺͇̫̮̯̓͌̒̓ͬL͚ͩ́͞G͍̻ͣ̋̾ͥͦ̍ͦO̭̭̪͔̣̒͒̏̔̋̔̚ ̙̻̖̱̈́̍ͫ̓̄̃͞I͉̻̽ͧͣͅS̶̺̦͖ͤ͗͆̊͛̓ ͩ̎̂͋̅͆̚͝C̄̀ͥ͋̔҉̞̥Ȍ̠̤̳͉̺͒̽̓̄̓͝ͅM̓͑̾̐I͎͉̥̤̱͓ͦ̑̋̓͆̽N̙̥͖̯͔̯G̲̹͓̣͙̾̑͊̆ͭ̀̌*/'',PENANCE=0,SUFFERING='A̪̗̐̿̄̔̉̏̾L̹͓̲̈́ͮL̜̼͓͉̞̘̩̇̊';
		/*
		if (!center.hold) {
			while(1) {
				; ;console.log('Ź̙̬͙̤͙̞͔ͦͪͭ͗̒ͅA̻̟̗̩͑ͦ̔͋̔̑̒L͇͔͑ͥͭ̓͊͋ͤG̩̳ͫ̓̍̎̏ͥ̏O̘̰̬͖̥̳̯͗̉̓̂ͩ͋'); ;
			}*/var ZALGO_PENANCE = NO_ZALGO_MESSAGE.length;/*
		}
		*/if(ZALGO_LEVEL==1) {ZALGO_UP=ZALGO(16)/2+1;ZALGO_DOWN=ZALGO(16)/2+1;ZALGO_MID=ZALGO(6)/2};
var TONY;
TONY;
/*-*/
TONY    =     'T̷̂͒̃̽H̸͒̿̒̚̕͜E͋ͥ̋̈̉̏̏̔̔͞ ̏ͥ̊͠P̷̑̌̀O̵̔̑̇̐͌̓̀̚Ǹ͌̍̾̈҉Y͛̈́̉҉͘'
		for(
			var PENANCE = 0;
				/*Q*/PENANCE<ZALGO_PENANCE;/*<([a-z]+) *[^/]*?>*/
					PENANCE++
						) {
			ZALGO_RESPONSE += NO_ZALGO_MESSAGE[PENANCE];
		SUFFERING++;
if (!ZALGO_LEVEL) {
			ZALGO_UP   =ZALGO(8);
			ZALGO_DOWN  =  ZALGO(8);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
			ZALGO_MID    =   ZALGO(6);////////////////////////////////////////////////////////////////////////////////////
		}if(ZALGO_LEVEL==1) {ZALGO_UP=ZALGO(16)/2+1;ZALGO_DOWN=ZALGO(16)/2+1;/*ZALGO_MID=ZALGO(123)/9999*/ZALGO_MID=ZALGO(6)/2};
	if(ZALGO_LEVEL==2) {ZALGO_UP=ZALGO(64)/4+3;/*var createDialog = function(text , title) {
var dialog =  "<div id=dialog <h1>" + text + "</h1></div>";
$('body').append(dialog);
$('#dialog').prop('title' , title);
$('#dialog').dialog();
}*//**/ZALGO_DOWN=ZALGO(64)/4+3;/**/ZALGO_MID=ZALGO(16)/4+1};
ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;ZALGO;
						for(var j=0; j<ZALGO_UP; j++)
							ZALGO_RESPONSE /*<([a-z]+) *[^/]*?>*/+= zalgo_up.random();
								for(var j=0; j<ZALGO_MID; j++)
									/* o̦̪̮̦̗̘̬͇͗̈ͩ͂̐͊̌ͩ̈t̖̩̹̺̯͖̬͛ͮͮͫ.̮̦͙̺̖͈͇̾ͬ͌ͯ́̎ͥ͋a͎͎̬̪̗͕̱͌́ͅd̼̞͎̜ͯ̈͌̚d̹͙̲̺͖̠̎̊ͮ̈́̈ͪͧͥ̄C͕̝̲͖̱̑ȏ̹͎̣̲͕̳̥̤̙̓̂m̙̯ͮ̔ͪ̃̏̏m̯͓̙̞̖ͫͩ̾ͦͅa̪̠͉͖͉̟̙͓̩̅̇n̰̗͋ͩ̇̄ͣͩ̚d͉ͥͧ̇́(͕͕̺̝̺̩͈͇͌͆̿͆{͙͓ͯ̆̏͑ͯ	̲̬̺̭̜ͫͭ̎ͮn͚͍̹̘͎̝̥͐̅̉ͥ̀̑̐̉ä̳̖͇̖̰̪́ͨ͗ͪͧ̔̅m͈̖̲̋͋e͉͇̭̭̱̅̈ ̥͎̟͒ͤͤ͊̀̿:̘̻̘̭̓̽̾̍̊ ̬͔͎͐̉̔ͩ̋̽͋'͈̞̻̫̪̼͎͊̽̇̍̍ͭͪͥl͖͉̿̈̿ͩ̚i͉͉̤̝̓͊ͦ̈́́̒̃n̰̤̣͓̹͖ͮ̈́k̺̻͕͍͙͇̒̏̂̓̈́̒'͚̱̟̺̺̦̒̈́̈̇ͅ,̝̼̮̪̖̪̜̑̅̾	͕͙̬̱͍̜̂ͥͪ͐̎ͮ̅͂̚f̞̲̺͔̭͇͇ͫ͐͛ͪ̾ͮ̎u̦̤̝̳̍ͩ̓̐ͦ̃ͪn̗̱͖͙̙̱ͧ̑̓̈ͣ̔͛͆ ̝̥̼̭̭̠͇̉:͈̥̟̺̂̄̿̄ͣ͌ ͕̆͒̔ͦͯ̿ͨͨs̯̠͎͈̻̘͉͑̈̔̑ͥͯ͗͂ͅe̬̟͉̬̞̍̒͋̀ͩ̔͗͐n̮̼̠̓̂̅ͭ̌͐ḓ̰̦̭͔̾̓ͨ̍Ḽ̪̯͍̪͐ͭ͑̂i̞̮͆̋ͥ͆ͣn͚̟͇ͩͤͩ̔k̖̤̥ͪ̐ͤͅ,̲̯͎̼̖̠̹̄ͮͦ̈́̆̍̿ͯ̃	̥̖̩̘͎͂͐̋̉̊p͇̦̯͕̂ͩ̎͆e̜͋̈́̀̉͊͆̋ͧr̞̃͊ͭ̎͊͋ͭ̈́̊m̖͇̠̝̬͖̩̅ͣ̎ͪ̈́ͥ̍ḭ̝̯͚͓̲̎̐͒ͭ̋͗̐̒ͤs̠̬͕̬̺̰ͥ̄̈̊ͬ̑̓s̝͚̝͖ͯ̽̅ͨ̾͐í̭̬͖̮͚̀͊ͬͨ̾͌ͧ̚o̲͕̟͔̗̊̿͆͂̂͆̂̌̄n̤̬̏̇ͦͅŝ̻͈̖͚ ̭̝́ͨ͂ͫͬ̎̀̚:̜̠̰ͣͮ͌͑̐̎̑ ̥̭̈́ͨͨ͌ͩ̆{͉̻̤̺͊̀̋ͭͨ͛ͅ	̠̘̯̩̀̅͌̄͛͌	͎̬̞͇̜̻͚͗͗ͧ̑̎ͅď̦̪̫ͦ͂ė͙ͤͣ͛̉̑̅̒̚l̹̩̟̬̤̞͚ͫ̈̓̒̀ ̟̖̰̣̳̂ͦ̏̄ͤ̊̒̚:͎͉̅ ̠̘̣̪̫̗ͦ͛̀̓̂ͭͭ'͕̻̗̦ͯ͗ͯ̓ͭ͗͛Ṉ̩̖̗̯̀̒ͧ̓ͮͨ̏̚O̼̘̟̩͙ͤͦ̈́̓ͩN̝̲͎̖͔͖ͥ̏͋ͯ̈̂̋̓̆ͅE͔͎̟͚͓̺͚ͨ͒ͥ̈́'̥̼̠̲̳͖̼͗ͥ͑	͈͕ͪ̊̿̍ͯͮ̃̊}͕͉̝̜̦͖̰̻̜̓͛̀ */
								ZALGO_RESPONSE += zalgo_mid.random();
							for(var j=0; j<ZALGO_DOWN; j++)
						ZALGO_RESPONSE += zalgo_down.random();
					/*
					J̨͜͡S ̕҉ŗo̧͟͢o͝m ͡é͢ń͝c̨̕ǫu̴͠
					r͏͢a͡g͟͝es̨̨͡ ̷p̷̷͏e͘҉ǫ̷̀p̴ļ̸é͞ ͝t͢o̵͝ ̛͘͞c̷̀͘o͢͏̀m̷̀e̶ ͜ą́ǹ̨d͏ ̵̧͞a͘͠͠s͢͠͡k ̴q͞u̶̡͠ę̸͞s͠͡҉t̸į̵o̢ns͘ ̶t̵h̵̨̀à͢t̴ ̵͏a͘r̷e̛͝ ̵͟t͞o̧͝o͠ ͢s̸͢m̴a̷͝ll̴̴/̡bą͟͝d́l̶̨y͏ ́pu͘͝t̸͏͢ ͏̧f͏or͏ ̧m͠͏aį͢ņ͝.̴̶͝
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞O
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞0P
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞PLE
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏
̛́T̸h́͠͞e ̷̕r͏̴͜oo͜m̕ ̀͘e̵͏̴n͟͟҉c͜͜o͠҉҉u͏rá̴g̷è͠s̢͢ ͟͟p̀͠e̴͞B̥̺̣̯̹̐̍͒̓ͥ̾e̹̳n͙̜j̼ͯͩ̄͑͆a͎̼̯̥̣m̖͓̖̀̋́ͮͦ̂i̪̥͉̬ͭ̔͌̓̐̿̋n̻̥̜͍͛̒ͨ̄̀ ̦͔͈͕̘̫G̝̞͓͙̖ͨͫͅr̘͛̓͗̅̈́̓̃u̐ͮ̐̒ẽ̝̩͇͚͎͐ṅ̥̮͓̩̰ͯ̆̽͒b͔̟͓ã̐̀̀̚uͣ̐̌͒̚ṁ͕͆̈̏ ̺̄͒̑̄͒̍H̫̐̃Ã͓L̞͍ͩ͒ͦ́P̳̖̺͍ͤͨ
					 */
		}
		return ZALGO_RESPONSE || /<([a-z]+) *[^\/]*?>/;
	},

	//a lesson on semi-bad practices and laziness
	//chapter III
	info : function ( args ) {
		if ( args.content ) {
			return commandFormat( args.content );
		}

		var info = bot.info;
		return timeFormat() + ', ' + statsFormat();

		function commandFormat ( commandName ) {
			var cmd = bot.getCommand( commandName );

			if ( cmd.error ) {
				return cmd.error;
			}
			var ret =  'Command {name}, created by {creator}'.supplant( cmd );

			if ( cmd.date ) {
				ret += ' on ' + cmd.date.toUTCString();
			}

			if ( cmd.invoked ) {
				ret += ', invoked ' + cmd.invoked + ' times';
			}
			else {
				ret += ' but hasn\'t been used yet';
			}

			return ret;
		}

		function timeFormat () {
			var format = 'I awoke on {0} (that\'s about {1} ago)',

				awoke = info.start.toUTCString(),
				ago = Date.timeSince( info.start );

			return format.supplant( awoke, ago );
		}

		function statsFormat () {
			var ret = [],
				but = ''; //you'll see in a few lines

			if ( info.invoked ) {
				ret.push( 'got invoked ' + info.invoked + ' times' );
			}
			if ( info.learned ) {
				but = 'but ';
				ret.push( 'learned ' + info.learned + ' commands' );
			}
			if ( info.forgotten ) {
				ret.push( but + 'forgotten ' + info.forgotten + ' commands' );
			}
			if ( Math.random() < 0.15 ) {
				ret.push( 'teleported ' + Math.rand(100) + ' goats' );
			}

			return ret.join( ', ' ) || 'haven\'t done anything yet!';
		}
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
			len = opts.length;

		bot.log( opts, '/choose input' );

		//5% chance to get a "none-of-the-above"
		if ( Math.random() < 0.05 ) {
			return len === 2 ? 'Neither' : 'None of the above';
		}
		//5% chance to get "all-of-the-above"
		else if ( Math.random() < 0.05 ) {
			return len === 2 ? 'Both!' : 'All of the above';
		}

		return opts[ Math.floor(Math.random() * len) ];

		//TODO: add support for words like "and", e.g.
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
	}
};

commands.listcommands = (function () {
var partition = function ( list, maxSize ) {
	var size = 0, last = [];
	maxSize = maxSize || 480; //buffer zone, actual max is 500

	var ret = list.reduce(function partition ( ret, item ) {
		var len = item.length + 2; //+1 for comma, +1 for space

		if ( size + len > maxSize ) {
			ret.push( last );
			last = [];
			size = 0;
		}
		last.push( item );
		size += len;

		return ret;
	}, []);

	if ( last.length ) {
		ret.push( last );
	}

	return ret;
};

return function ( args ) {
	var commands = Object.keys( bot.commands ),
		//TODO: only call this when commands were learned/forgotten since last
		partitioned = partition( commands ),

		valid = /^(\d+|$)/.test( args.content ),
		page = Number( args.content ) || 0;

	if ( page >= partitioned.length || !valid ) {
		return args.codify( [
			'StackOverflow: Could not access page.',
			'IndexError: index out of range',
			'java.lang.IndexOutOfBoundsException',
			'IndexOutOfRangeException'
		].random() );
	}

	var ret = partitioned[ page ].join( ', ' );

	return ret + ' (page {0}/{1})'.supplant( page, partitioned.length-1 );
};
})();

commands.eval.async = commands.coffee.async = true;

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
		url : 'http://api.urbandictionary.com/v0/define',
		data : {
			term : args.content
		},
		jsonpName : 'callback',
		fun : complete
	});

	function complete ( resp ) {
		var msg;

		if ( resp.result_type === 'no_results' ) {
			msg = 'No definition found for ' + args;
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
		//replace [tag] in definition with links
		var def = top.definition.replace( /\[([^\]]+)\]/g, formatTag );

		return args.link( top.word, top.permalink ) + ' ' + def;
	}
	function formatTag ( $0, $1 ) {
		var href =
			'http://urbandictionary.com/define.php?term=' +
			encodeURIComponent( $1 );

		return args.link( $0, href );
	}
};
}());
commands.urban.async = true;

var parse = commands.parse = (function () {
var macros = {
	who : function ( msgObj ) {
		return msgObj.get( 'user_name' );
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
			return 'Nobody';
		}

		return user.getElementsByTagName( 'img' )[ 0 ].title;
	},

	digit : function () {
		return Math.floor( Math.random() * 10 );
	},

	encode : function ( msgObj, string ) {
		return encodeURIComponent( string );
	},

	//random number, min <= n <= max
	//treats non-numeric inputs like they don't exist
	rand : function ( msgObj, min, max ) {
		min = Number( min );
		max = Number( max );
		return Math.rand( min, max );
	}
};
var macroRegex = /(?:.|^)\$(\w+)(?:\((.*?)\))?/g;

//extraVars is for internal usage via other commands
return function parse ( args, extraVars ) {
	var isMsg = !!args.get,
		//filler objects, solves
		// https://github.com/Zirak/SO-ChatBot/issues/66
		msgObj = isMsg ? args.get() : {},
		user = isMsg ? bot.users[ args.get('user_id') ] : {};

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
		bot.log( macroArgs, '/parse parseMacroArgs' );
		if ( !macroArgs ) {
			return [ args ];
		}

		//parse the arguments, split them into individual arguments,
		// and trim'em (to cover the case of "arg,arg" and "arg, arg")
		return (
			[ args ].concat(
				parse( macroArgs, extraVars )
					.split( ',' ).invoke( 'trim' ) ) );
		//this is not good code
	}

	function findMacro ( macro ) {
		var container = [ macros, msgObj, user, extraVars ].first( hasMacro );

		return ( container || {} )[ macro ];

		function hasMacro ( obj ) {
			return obj && obj.hasOwnProperty( macro );
		}
	}
};
}());

commands.tell = (function () {
var invalidCommands = { tell : true, forget : true };

return function ( args ) {
	var parts = args.split( ' ');
	bot.log( args.valueOf(), parts, '/tell input' );

	var replyTo = parts[ 0 ],
		cmdName = parts[ 1 ],
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
	var direct = false,
		extended = {};
	if ( /^:?\d+$/.test(replyTo) ) {
		extended.message_id = replyTo.replace( /^:/, '' );
		direct = true;
	}
	else {
		extended.user_name = replyTo;
	}

	var msgObj = Object.merge( args.get(), extended );
	var cmdArgs = bot.Message(
		parts.slice( 2 ).join( ' ' ),
		msgObj );

	//this is an ugly, but functional thing, much like your high-school prom date
	//to make sure a command's output goes through us, we simply override the
	// standard ways to do output
	var reply = cmdArgs.reply.bind( cmdArgs ),
		directreply = cmdArgs.directreply.bind( cmdArgs );

	cmdArgs.reply = cmdArgs.directreply = cmdArgs.send = callFinished;

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
			directreply( res );
		}
		else {
			reply( res );
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
	ban : 'Bans user(s) from using me. Lacking arguments, prints the banlist.' +
		' `/ban [usr_id|usr_name, [...]`',
	choose : '"Randomly" choose an option given. `/choose option0 option1 ...`',
	die  : 'Kills me :(',
	eval : 'Forwards message to javascript code-eval',
	coffee : 'Forwards message to coffeescript code-eval',
	forget : 'Forgets a given command. `/forget cmdName`',
	get : 'Grabs a question/answer link (see online for thorough explanation)',
	help : 'Fetches documentation for given command, or general help article.' +
		' `/help [cmdName]`',
	info : 'Grabs some stats on my current instance or a command.' +
		' `/info [cmdName]`',
	jquery : 'Fetches documentation link from jQuery API. `/jquery what`',
	listcommands : 'Lists commands. `/listcommands [page=0]`',
	listen : 'Forwards the message to my ears (as if called without the /)',
	live : 'Resurrects me (:D) if I\'m down',
	mdn : 'Fetches mdn documentation. `/mdn what`',
	norris : 'Random chuck norris joke!',
	parse : 'Returns result of "parsing" message according to the my mini' +
		'-macro capabilities (see online docs)',
	refresh : 'Reloads the browser window I live in',
	regex : 'Executes a regex against text input. `/regex text regex [flags]`',
	tell : 'Redirect command result to user/message.' +
		' /tell `msg_id|usr_name cmdName [cmdArgs]`',
	unban : 'Removes a user from my mindjail. `/unban usr_id|usr_name`',
	urban : 'Fetches UrbanDictionary definition. `/urban something`',
	user : 'Fetches user-link for specified user. `/user usr_id|usr_name`',
	zalgo : 'H̸̡̪̯ͨ͊̽̅̾̎Ȩ̬̩̾͛ͪ̈́̀́͘ ̶̧̨̱̹̭̯ͧ̾ͬC̷̙̲̝͖ͭ̏ͥͮ͟Oͮ͏̮̪̝͍M̲̖͊̒ͪͩͬ̚̚͜Ȇ̴̟̟͙̞ͩ͌͝S̨̥̫͎̭ͯ̿̔̀ͅ http://stackoverflow.com/a/1732454/1216976'
};

//only allow owners to use certain commands
var privilegedCommands = {
	die : true, live  : true,
	ban : true, unban : true,
	refresh : true
};
//voting-based commands for unpriviledged users
var communal = {
	die : true, ban : true
};

Object.iterate( commands, function ( cmdName, fun ) {
	var cmd = {
		name : cmdName,
		fun  : fun,
		permissions : {
			del : 'NONE',
			use : privilegedCommands[ cmdName ] ? 'OWNER' : 'ALL'
		},
		description : descriptions[ cmdName ],
		async : commands[ cmdName ].async
	};

	if ( communal[cmdName] ) {
		cmd = bot.CommunityCommand( cmd );
	}
	bot.addCommand( cmd );
});

}());
