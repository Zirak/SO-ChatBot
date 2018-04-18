module.exports = function (bot) {
    'use strict';

    var options = {
        message: 'you are bad at this',
        splitter: ' '
    };

    function clap(args) {
        var input = args.length > 0 ? args.toString() : options.message;
        var parts = input.split(options.splitter);
        var output = parts.join(' 👏 ');
        args.send(output);
    }

    bot.addCommand({
        fun: clap,
        name: 'clap',
        permission: {
            del: 'NONE'
        },
        description: 'makes 👏 everything 👏 better',
        unTellable: false
    });
};
