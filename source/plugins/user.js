module.exports = function (bot) {
bot.addCommand({
    name : 'user',
    fun : function () {
        return 'Command deprecated. If you want it to stay, ping Zirak.';
    },
    permissions : { del : 'NONE', use : 'ALL' },
    description : 'Fetches user-link for specified user. ' +
        '`/user usr_id|usr_name`',
});
};
