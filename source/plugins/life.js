module.exports = function (bot) {
bot.addCommand({
    name : 'live',
    fun : function () {
        if ( !bot.stopped ) {
            return 'I\'m not dead! Honest!';
        }
        bot.continue();
        return 'And on this day, you shall paint eggs for a giant bunny.';
    },
    permissions : { del : 'NONE', use : 'OWNER' },
    description : 'Resurrects me (:D) if I\'m down (D:)'
});

bot.addCommand(bot.CommunityCommand({
    name : 'die',
    fun : function () {
        if ( bot.stopped ) {
            return 'Kill me once, shame on you, kill me twice...';
        }

        bot.stop();

        return 'You killed me!';
    },
    permissions : { del : 'NONE', use : 'OWNER' },
    description : 'Kills me :(',
    pendingMessage : 'I will shut up after {0} more invocations.'
}));

};
