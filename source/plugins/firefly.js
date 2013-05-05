//listener to help decide which Firefly episode to watch

bot.listen( /(which |what |give me a )?firefly ep(isode)?/i, function () {
	var names = ["Serenity", "The Train Job", "Bushwhacked", "Shindig", "Safe", "Our Mrs. Reynolds", "Jaynestown", "Out of Gas", "Ariel", "War Stories", "Trash", "The Message", "Heart of Gold", "Objects in Space"];

	var r = Math.floor(Math.random() * 14);
	return 'Episode {0} - {1}'.supplant(r, names[r]);
});
