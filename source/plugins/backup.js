module.exports = function (bot) {
    'use strict';

    var backupFmt = 'Donna Noble has left The Library {0}.';

    function backupCommand(args) {
        bot.IO.xhr({
            url: 'https://api.github.com/gists',
            method: 'POST',
            headers: {
                Authorization: 'token ' + bot.config.githubToken
            },
            data: JSON.stringify({
                description: 'bot memory ' + new Date(),
                files: {
                    'memory.json': {
                        content: JSON.stringify(getBotStorage())
                    }
                }
            }),
            complete: finishCb(args.reply)
        });
    }

    function finishCb(cb) {
        return function(resp) {
            var gistData = JSON.parse(resp);
            var backupLink = bot.adapter.link(
                'Donna Noble has been saved',
                gistData.html_url
            );
            cb(backupFmt.supplant(backupLink));
        };
    }

    function getBotStorage() {
        return Object.keys(localStorage).reduce(function(filtered, key) {
            // we hide the config because it contains keys
            if (key.startsWith('bot_') && !key.includes('config')) {
                filtered[key] = localStorage[key];
            }
            return filtered;
        }, {});
    }

    bot.addCommand({
        name: 'backup',
        fun: backupCommand,
        permissions: {
            del: 'NONE',
            use: 'OWNER'
        },
        async: true,
        descrription: 'backs up the bots memory'
    });
};
