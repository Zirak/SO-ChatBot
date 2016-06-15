module.exports = function (bot) {

    function mdn (args, cb) {

        bot.IO.jsonp.duckduckgo('mdn ' + args.toString(), finishCall);

        function finishCall(resp) {
            if (resp === null || resp === undefined) {
                finish('Duck is dead !!!!');
                return;
            }
            bot.log(resp, '/mdn resp');

            if (resp.AbstractSource !== 'Mozilla Developer Network') {
                finish('Got nothing.');
                return;
            }

            var msg = resp.AbstractURL;

            finish(msg);
        }
        function finish(res) {
            if (cb && cb.call) {
                cb(res);
            }
            else {
                args.reply(res);
            }
        }
    }

    bot.addCommand({
        name: 'mdn',
        fun: mdn,

        permissions: { del: 'NONE', use: 'ALL' },
        description: 'Fetches mdn documentation. `/mdn what`',
        async: true
    });

};
