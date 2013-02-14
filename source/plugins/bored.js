//when nothing happens after a while, I get bored.
(function () {
"use strict";

var responses = [
	'jQuery is a better language than javascript',
	'World hunger will be solved by eating cats',
	'php is good',
	'php is bad',
	'OOP stands for "Oh Oh! Poop!"',
	'Functional programming is the best',
	'Ruby is for smelly hipsters',
	'Python is for people with guttheria', //wat?
	'Lisp is for lusers',
	'Recursion is always the answer',
	'Javascript isn\'t a real language',
	'CoffeeScript is good',
	'CoffeeScript sucks',
	'You should comment all your code',
	'You should use comments sparingly',
	'Tabs are better than spaces',
	'Spaces are better than tabs',
	'Dart is a good language and idea',
	'TypeScript will outdate javascript',
	'Optimization is king',
	'Preumature optimization is the root of all evil',
	'Perl is written in base64',
	'ROT13 is sufficient encryption',
	'Braces should only appear on the right `if () {`, not on the left',
	'Braches should only appear on the left `if ()\\n{`, not on the right',

	'I really hate it when people don\'t',
	'Accordion to recent surveys, you may insert random instrument names into' +
		' sentences without people noticing',
	'There once was a girl fron Nantucket...',
	'There once was a girl from Nantucket,\n' +
		'Who had a nice fancy bucket.\n' +
		'She mopped up the floor\n' +
		'And went to the door\n' +
		'To answer it.', //what did you expect? perv.

	//anti-jokes start here
	'Why can\'t Elvis Presley drive in reverse? Because he\'s dead',
	'I like my women how I like my coffee. Without a penis',
	'A horse walks into a bar. The bartender asks, "Why the long face?" ' +
		'The horse, incapable of understanding English, shits on the floor ' +
		' and leaves',
	'The magic words which\'ll open many doors are "Push" and "Pull"',
	'Peggy had many valentine cards while I only had one. Peggy is a whore',
	'Why did the boy drop his ice-cream? He was hit by a bus',
	'What\'s sad about 4 black people driving off a cliff? They were my friends',
	'Why can\'t T-Rexs clap? Because they\'re dead',
	'Yo mamma\'s so fat, your father no longer finds her attractive so now ' +
		'they\'re getting divorced',
	'An Irishman, a homosexual and a Jew walk into a bar. What a fine ' +
		'example of an integrated community',
	'What\'s worse than biting on an apple and finding a worm? The holocaust',
	'*knock knock* Who\'s there? "Jehova\'s witnesses"',
	'How do you make a plumber cry? Kill his family',
	'What did the farmer say when he couldn\'t find his tractor?\n' +
		'"Where\'s my tractor?"'
];
var len = responses.length;

//TODO: change back to 5mins after debugging
var delay = 60000, //1000(ms) * 60 (sec) * 5 = 5min
	lastISpoke = {};

function zzz () {
	var now = Date.now(),
		times = bot.adapter.in.lastTimes || {};

	Object.keys( times ).filter( roomcheck ).forEach( stuff );

	//let my naming expertise astound you once more
	function stuff ( roomid ) {
		console.log( times[roomid], lastISpoke[roomid] );
		bot.log( 'triggered bored on room #' + roomid );

		//10 seconds into the future, just to be sure
		lastISpoke[ roomid ] = now + 1000 * 10;
		bot.adapter.out.add( responses.random(), roomid );
	}

	//checks, for a specific room, whether enough time has passed since someone
	// (who wasn't us) spoke
	function roomcheck ( roomid ) {
		var last = times[ roomid ];
		return last > ( lastISpoke[roomid] || 0 ) && last + delay <= now;
	}
}

IO.register( 'heartbeat', zzz );

})();
