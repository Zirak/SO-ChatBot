(function () {
"use strict";

var message = "Welcome to the JavaScript chat! Please review the " +
		bot.adapter.link(
			"room pseudo-rules",
			"http://rlemon.github.com/so-chat-javascript-rules/" ) + ". " +
	"Please don't ask if you can ask or if anyone's around; just ask " +
	"your question, and if anyone's free and interested they'll help.";

function welcome ( name ) {
	return bot.adapter.reply( name ) + " " + message;
}

bot.addCommand({
	name : 'welcome',
	fun : function ( args ) {
		if (!args.length) {
			return message;
		}

		return args.send( welcome(args) );
	},
	permission : {
		del : 'NONE'
	},
	description : 'Welcomes a user. `/welcome user`'
});
}());
