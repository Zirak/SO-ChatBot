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

		document : true,
		complete : complete
	});

	function complete ( doc ) {
		//<div id='room-17'>
		// ...
		// <div class='room-message-count' title='72279 all time messages (by Zirak)
		//    ...
		// </div>
		// ...
		//</div>
		var messageCount = doc.querySelector( '#room-17 .room-message-count' ),
			newUser;

		if ( messageCount ) {
			newUser = Number( /^\d+/.exec(messageCount.title) ) < 2;
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
