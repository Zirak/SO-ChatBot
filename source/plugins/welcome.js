(function () {
"use strict";
//welcomes new users with a link to the room rules and a short message.

var seen = bot.memory.get( 'users' ),
	//hardcoded for some (in)sanity. Change accordingly.
	ownerRoom = 17;

var message = "Welcome to the JavaScript chat! Please review the " +
		bot.adapter.link(
			"room pseudo-rules",
			"http://rlemon.github.com/so-chat-javascript-rules/"
		) +
		". Please don't ask if you can ask or if anyone's around; just ask " +
		"your question, and if anyone's free and interested they'll help.";

function welcome ( name, room ) {
	bot.adapter.out.add( bot.adapter.reply(name) + " " + message, room );
}

IO.register( 'input', function welcomeListener ( msgObj ) {
	var user = bot.users[ msgObj.user_id ],
		room = msgObj.room_id;

	var semiLegitUser = user && isSemiLegitUser( user );
	if (
		Number( room ) !== ownerRoom || semiLegitUser  || seen[ msgObj.user_id ]
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
		var messageCount = doc.querySelector(
			'#room-' + ownerRoom + ' .room-message-count'
		),
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

	function isSemiLegitUser ( user ) {
		return bot.isOwner( user.id ) ||
			user.reputation > 1000 ||
			user.reputation < 20;
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
