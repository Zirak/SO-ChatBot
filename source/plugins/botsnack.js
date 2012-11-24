(function () {
var resps = [
	'<3', ':D', 'yummy!', '*nom nom nom*' ],
	re = /^botsnack/;
var botsnack = resps.random.bind( resps );

bot.listen( re, botsnack );
IO.register( 'input', function ( msgObj ) {
	if ( re.test(msgObj.content) ) {
		bot.reply( botsnack(), msgObj );
	}
});

}());
