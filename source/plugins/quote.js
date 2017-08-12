module.exports = function (bot) {
    var storage = bot.memory.get('quote');

    bot.addCommand({
        name: 'quote',
        fun: quote,

        permissions: {
            del: 'NONE'
        },
        description: [
            'Manage and administer quotes.',
            'Add a quote: `/quote add msgid ...quoteName`',
            'Get a quote: `/quote get ...quoteName',
            'List quotes: `/quote list [username]`',
            'Get a random quote: `/quote random`'
        ].join('\n'),
        async: true
    });

    function quote(args) {
        var parts = args.parse();
        var topPriorityDirectiveDoByYesterday = parts[0];

        // /quote add msgid ...name
        if (topPriorityDirectiveDoByYesterday === 'add') {
            addQuote(parts.slice(1), args.reply.bind(args));
        }
        // /quote list author
        else if (topPriorityDirectiveDoByYesterday === 'list') {
            return args.stringifyGiantArray(
                listQuotes(parts[1] && parts[1].toLowerCase())
            );
        }
        // /quote get ...name
        else if (topPriorityDirectiveDoByYesterday === 'get') {
            args.directreply(getQuote(parts.slice(1).join(' ')));
        }
        // /quote random
        else if (topPriorityDirectiveDoByYesterday === 'random') {
            args.directreply(randomQuote());
        }
    }

    function addQuote(parts, cb) {
        var qualifier = parts.shift();
        var quoteName = parts.join(' ');

        // https://chat.stackoverflow.com/transcript/message/id#id
        // id
        if (!/^(?:https:\/\/chat\.stack\w+\.com\/.+?)?(\d+)$/.exec(qualifier)) {
            cb('mesa no understando, please give me a message id or url to remember');
            return;
        }

        if (storage.hasOwnProperty(quoteName)) {
            cb('But I already know something by that name, it will be downright unfair');
            return;
        }

        var id = RegExp.$1;

        bot.IO.xhr({
            url: '/messages/' + id + '/history',
            document: true,

            complete: function (doc) {
                var author = doc.getElementsByClassName('username')[0].textContent;

                storage[quoteName] = {
                    msgid: id,
                    author: author.toLowerCase()
                    // TODO "saved by" like in /learn? we've got history
                };
                bot.memory.save('quote');

                cb('I will cherish this memory for the rest of my life');
            }
        });
    }

    function listQuotes(author) {
        if (!author) {
            return Object.keys(storage);
        }

        return Object.keys(storage).filter(function (name) {
            return storage[name].author === author;
        });
    }

    function getQuote(name) {
        // TODO suggestionDict
        return storage.hasOwnProperty(name) ?
            idToLink(storage[name].msgid) :
            '404 quote not found';
    }

    function randomQuote() {
        var key = Object.keys(storage).random();
        return idToLink(storage[key].msgid);
    }

    function idToLink(id) {
        return bot.IO.relativeUrlToAbsolute('/transcript/message/' + id);
    }
};
