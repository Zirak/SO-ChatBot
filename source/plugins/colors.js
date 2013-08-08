function color ( args ) {
  var address = 'http://southouse.tk/colors.php?color='
	var ret = address + args.toString().toLowerCase().match(/([a-z0-9]+)+/gi).join(",") + '#.png'; //Finally done with those '#'s and spaces.
	

	return args.directreply(ret); //That's all for now
}

bot.addCommand({
	name : 'color',
	permissions : {
		del : 'NONE'
	},

	description : 'Returns colors/color assortments for preview.' +
		' `/color`'
});
