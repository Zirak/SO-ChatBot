responses = [
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
	'Premature optimization is the root of all evil',
	'Perl is written in base64',
	'ROT13 is sufficient encryption',
	'Braces should only appear on the right `if () {`, not on the left',
	'Braces should only appear on the left `if ()\\n{`, not on the right',
	'Duck-Typing is best typing',
	'Strong typing ftw',
	'Static typing will prevent most bugs',
	'Dynamic typing brings 70% more happiness units',

	'NetTuts+ is a GREAT SITE!',
	'expertsexchange is better than StackOverflow',
	'WordPress is bread & butter for any decent website',

	'Can anyone help me with a Java question?',
	'http://stackoverflow.com/a/778275/617762',
	'http://stackoverflow.com/users/22656/jon-skeet',


	'I really hate it when people don\'t',
	'Accordion to recent surveys, you may insert random instrument names into' +
		' sentences without people noticing',
	'There once was a girl fron Nantucket...',
	'There once was a girl from Nantucket,\n' +
		'Who had a nice fancy bucket.\n' +
		'She mopped up the floor\n' +
		'And went to the door\n' +
		'To answer it.', //what did you expect? perv.

	//stolen from copy (ha!)
	'We all know Linux is great...it does infinite loops in 5 seconds. ~ Linus Torvalds',
	'Everything should be made as simple as possible, but not simpler. ~ Albert Einstein',
	'If A = B and B = C, then A = C, except where void or prohibited by law. ~ Roy Santoro',
	'Has anyone really been far even as decided to use even go want to do look more like?',

	//nice snippets
	'    Math.sign = function (n) {\n' +
		'        return (x > 0) - (x < 0);\n' +
		'    }',

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
		'"Where\'s my tractor?"',
	'@jAndy, THE GAME!'
];

//query xkcd to find the last comic id. generate links to comic pages from that
(function () {
IO.jsonp({
	url : 'http://dynamic.xkcd.com/api-0/jsonp/comic',
	jsonpName : 'callback',
	fun : finish
});

function finish ( resp ) {
	var maxID = resp.num;

	//to avoid adding hundreds of links to the responses array and fucking up
	// the probabilities, we'll add just 2, and use a "nice" getter hack
	var descriptor = {
		get : function () {
			return 'http://xkcd.com/' + Math.rand( 1, maxID );
		},
		configurable : true,
		enumerable : true
	};

	//js does not allow dynamic key creation on object literals
	var props = {};
	props[ responses.length ] = props[ responses.length + 1 ] = descriptor;

	Object.defineProperties( responses, props );
	//arrays truly are magic. Chrome automatically adjusts the length after this
	//perhaps it shouldn't surprise me. special behaviour on integer-ish is to
	// be expected
}
})();
