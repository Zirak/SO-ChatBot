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
	if (
		Number(room) !== 17  || seen[user.id] ||
		bot.isOwner(user.id) || user.reputation > 1000 || user.reputation < 20
	) {
		return;
	}

	IO.xhr({
		method : 'GET',
		url : '/users/' + user.id,

		complete : complete
	});

	function complete (resp) {
		//lulz, I'm parsing html with regexps
		//OH GOD CTHULU DON'T EAT ME
		//<td class="user-keycell">chat user since</td><td class="user-valuecell">YYYY-MM-DD</td>
		var seniority = Date.parse(
			/since.+cell">(\d{4}-\d{2}-\d{2})/
				.exec(resp)[1]);

		//2(weeks) = 1000(ms/s) * 60(s/min) * 60(min/hour) *
		//           24(hour/day) * 7(day/week) * 2 = 1209600000ms
		if (Date.now() - seniority < 12096e5) {
			welcome();
		}
		finish();
	}

	function finish () {
		seen[ user.id ] = true;
		localStorage.bot_users = JSON.stringify( seen );
	}

	function welcome () {
		bot.adapter.out.add(
			bot.adapter.reply(user.name) + " " + message,
			room );
	}
});
}());
