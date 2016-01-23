module.exports = function (bot) {
bot.IO.register( 'input', function ( msgObj ) {
    if ( msgObj.user_id === 1386886 && Math.random() < 0.005 ) {
        bot.adapter.out.add(
            bot.adapter.reply(msgObj.user_name) + ' The Game' );
    }
});
};
