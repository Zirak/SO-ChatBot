function color ( args ) {
  var address = 'http://southouse.tk/colors.php?color='
	var ret = address + args.toString().toLowerCase().replace(/[# ]/g, '') + '#.png'; //Finally done with those '#'s and spaces.
	

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
