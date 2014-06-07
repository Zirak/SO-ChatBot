(function () {
"use strict";

bot.addCommand({
	name : 'convert',
	fun : function () {
		return 'Command deprecated. If you want it to stay, ping Zirak.';
	},
	permissions : {
		del : 'NONE'
	},
	description : 'Converts several units and currencies, case sensitive. '+
		'`/convert <num><unit> [to|in <unit>]` ' +
		'Pass in list for supported units `/convert list`',
	async : true
});
}());
