bot.config = Object.merge(
    {
        pattern: '!!',
        welcomeMessage: (
            "Welcome to the JavaScript chat! Please review the {0}. Please don't"
                + "ask if you can ask or if anyone's around; just ask your "
                + "question, and if anyone's free and interested they'll help."
        ).supplant(bot.adapter.link(
            "room rules",
            "http://rlemon.github.com/so-chat-javascript-rules/"
        ))
    },
    bot.memory.get('config', {})
);
bot.memory.set('config', bot.config);
bot.memory.save('config');
