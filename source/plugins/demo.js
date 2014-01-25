(function () {
	"use strict";
    var captureDemo = function(msg) {
      demoStorage.push({user: msg.get('user_name'), link: msg.content});
    };
	bot.addCommand({
		fun: captureDemo,
		name: 'demo',
		permissions: {
			del: 'NONE'
		},
		description: 'Saves JS room demos to a safe location in international waters'
	});
}());
