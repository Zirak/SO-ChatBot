(function () {
	var cmd = {
		description : 'Reloads the browser window I live in',
		fun : refresh,
		name : 'refresh',
		permissions : {
			del : 'NONE',
			use : 'OWNER'
		}
	};

	bot.addCommand( cmd );

	function refresh() {
		window.location.reload();
    };
}());
