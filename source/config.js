module.exports = function (bot) {
    var welcomeFmt = 'Welcome to the JavaScript chat! Please review the {rulesLink}. ' +
        'If you have a question, just post it, and if anyone\'s free and interested they\'ll help. ' +
        'If you want to report an abusive user or a problem in this room, visit our {metaLink}.';
    var rulesLink = bot.adapter.link(
        'room rules',
        'https://rlemon.github.com/so-chat-javascript-rules/'
    );
    var metaLink = bot.adapter.link(
        'meta',
        'https://github.com/JavaScriptRoom/culture/'
    );

    var config = Object.merge(
        {
            pattern: '!!',
            welcomeMessage: welcomeFmt.supplant({ rulesLink: rulesLink, metaLink: metaLink }),

            // these must be set for the weather
            // command and backup command respectivly.
            // I've removed the sample keys so I can easily
            // change them with the bot loader script.

            //weatherKey: '',
            //githubToken: ''
        },
        bot.memory.get('config', {})
    );

    bot.memory.set('config', config);
    bot.memory.save('config');

    return config;
};
