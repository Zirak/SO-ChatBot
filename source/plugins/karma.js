(function () {
"use strict";

bot.addCommand({
	name : 'karma',
	fun : function ( args ) {
		var removal = new Date('2013-05-20');
		var msg = 'Deprecated command (will be removed in aprrox. {0}). ' +
			'If you have any objections, comment [here](https://github.com/Zirak/SO-ChatBot/issues/34)';
		return msg.supplant(Date.timeSince(Date.now(), removal));
	}
});

}());
