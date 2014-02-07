(function () {
"use strict";
//welcomes new users with a link to the room rules and a short message.

var seen = bot.memory.get( 'users' );

var message = "Welcome to the JavaScript chat! Please review the " +
		bot.adapter.link(
			"room pseudo-rules",
			"http://rlemon.github.com/so-chat-javascript-rules/"
		) +
		". Please don't ask if you can ask or if anyone's around; just ask " +
		"your question, and if anyone's free and interested they'll help.";

var messageCountRe = /transcript\/17(?:'|")>([\d\.]+)(k?)/i;

function welcome ( name, room ) {
	bot.adapter.out.add(
		bot.adapter.reply( name ) + " " + message, room );
}

IO.register( 'userregister', function ( user, room ) {
	var semiLegitUser = bot.isOwner( user.id ) ||
		user.reputation > 1000 || user.reputation < 20;

	if (
		Number( room ) !== 17 || semiLegitUser  || seen[ user.id ]
	) {
		if ( semiLegitUser ) {
			finish( true );
		}
		return;
	}

	IO.xhr({
		method : 'GET',
		url : '/users/' + user.id,

		complete : complete
	});

	function complete ( resp ) {
		//I'm parsing html with regexps. hopefully Cthulu won't eat me.
		// <a href="/transcript/17">7</a>
		// [..., "17", null]
		// <a href="/transcript/17">2.1k</a>
		// [..., "2.1", "k"]
		var chatMessages = messageCountRe.exec( resp ),
			newUser;

		if ( chatMessages ) {
			newUser = !chatMessages[ 2 ] && Number( chatMessages[1] ) < 2;
		}
		else {
			newUser = true;
		}

		if ( newUser ) {
			welcome( user.name, room );
		}
		finish();
	}

	function finish ( unsee ) {
		if ( unsee ) {
			delete seen[ user.id ];
		}
		else {
			seen[ user.id ] = true;
		}
		bot.memory.save( 'users' );
	}
});

bot.addCommand({
	name : 'welcome',
	fun : function ( args ) {
		if (!args.length) {
			return message;
		}

		welcome( args, args.get('roomid') );
	},
	permission : {
		del : 'NONE'
	},
	description : 'Welcomes a user. `/welcome user`'
});
}());
