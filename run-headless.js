var Nightmare = require('nightmare');
var hound = new Nightmare();

/***********	Change me!	  ***********/
var config = {
	email:	  'you can guess',
	password: 'what these are'
};

function once (fn) {
	var called = false, res;
	return function () {
		if (called) { return res; }

		called = true;
		res = fn.apply(this, arguments);

		return res;
	};
}

hound
	.goto('https://stackoverflow.com/users/login/')
	.screenshot('pics/pre-login.png')
	.type('#se-login input[type="email"]', config.email)
	.type('#se-login input[type="password"]', config.password)
	.click('#se-login input[type="button"]')
	.wait()
	.screenshot('pics/login.png')
	.goto('https://chat.stackoverflow.com/rooms/76070')
	.screenshot('pics/chat.png')
	.evaluate(function () {
		var script = document.createElement('script');
		script.src = 'https://raw.github.com/Zirak/SO-ChatBot/master/master.js';
		script.onload = function() {
			console.log('Loaded bot');
		};
		document.head.appendChild(script);
	}, function () {
		console.log('Injected chatbot.');
	})
	.setup(function () {
		var self = hound;

		setTimeout(next, 0);
		function next(err) {
			var item = self.queue.shift();
			if (!item) {
				console.log('Should be done loading stuff.');
				return;
			}

			var method = item[0],
				args = item[1];
			args.push(once(next));
			method.apply(self, args);
		}
	});
