(function () {

function color ( args ) {
    // Url format: http://dummyimage.com/{dimensions}/{fg}/{bg}.png

	var clean = args.toString()
		.toLowerCase()
		.match( /([a-z0-9]+)+/g );

    // Hard-code a 150x150 square
	var url = 'http://dummyimage.com/150/';

    // Background color
    url += clean[0] + "/";

    // Foreground color
    if (clean[1]) {
        url += clean[1];
    } else {
        url += "000";
    }

    url += ".png";

    if (clean[2]) {
        url += "&text=" + clean[2];
    }

	args.directreply(url);
}

bot.addCommand({
	name : 'color',
	fun	 : color,
	permissions : {
		del : 'NONE'
	},

	description : 'Displays a color square for the hex color(s) passed in, with optional text. ' +
		' `/color backgroundColor [foregroundColor] [text]`'
});

})();
