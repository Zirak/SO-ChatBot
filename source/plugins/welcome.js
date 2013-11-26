(function () {
"use strict";

var message = "Welcome to the JavaScript chat! Please review the " +
		bot.adapter.link(
			"room pseudo-rules",
			"http://rlemon.github.com/so-chat-javascript-rules/" ) + ". " +
	"Please don't ask if you can ask or if anyone's around; just ask " +
	"your question, and if anyone's free and interested they'll help.";

function welcome ( name, room ) {
	/*bot.adapter.out.add(*/
	return bot.adapter.reply( name ) + " " + message;/*, room );*/
}

bot.addCommand({
	name : 'welcome',
	fun : function ( args ) {
		if (!args.length) {
			return message;
		}

		return welcome( args, args.get('roomid') );
	},
	permission : {
		del : 'NONE'
	},
	description : 'Welcomes a user. `/welcome user`'
});
}());
