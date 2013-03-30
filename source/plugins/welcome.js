(function () {
"use strict";
//welcomes new users with a link to the room rules

var seen = JSON.parse( localStorage.bot_users || '{}' );

var message = "Welcome to the JavaScript chat! Please review the " +
		bot.adapter.link(
			"room pseudo-rules",
			"http://rlemon.github.com/so-chat-javascript-rules/" ) + ". " +
	"Please don't ask if you can ask or if anyone's around; just ask " +
	"your question, and if anyone's free and interested they'll help.";

IO.register( 'userregister', function ( user, room ) {
	console.log( user, room, 'register' );
	if ( Number(room) !== 17 || seen[user.id] || bot.isOwner(user.id) ) {
		return;
	}

	seen[ user.id ] = true;
	localStorage.bot_users = JSON.stringify( seen );

	bot.adapter.out.add(
		bot.adapter.reply(user.name) + " " + message,
		room );
});
}());
