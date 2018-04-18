module.exports = function (bot) {
    var welcomeFmt = 'Welcome to the JavaScript chat! Please review the {0}. ' +
        'Please don\'t ask if you can ask or if anyone\'s around; just ask ' +
        'your question, and if anyone\'s free and interested they\'ll help.';
    var rulesLink = bot.adapter.link(
        'room rules',
        'http://rlemon.github.com/so-chat-javascript-rules/'
    );

    var config = Object.merge(
        {
            pattern: '!!',
            welcomeMessage: welcomeFmt.supplant(rulesLink),

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
