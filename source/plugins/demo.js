(function () {
    "use strict";

    IO.loadScript('https://cdn.firebase.com/js/client/1.0.2/firebase.js');
    var demoStorage = new Firebase('https://radiant-fire-1626.firebaseio.com/');
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
