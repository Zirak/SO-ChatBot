// solves #86, mostly written by @Shmiddty
module.exports = function (bot) {
    'use strict';

    /*
    memory.afk = {
        "user name": {
            afkSince: time of /afk call
            lastPing: { roomID : time of last ping },
            msg: afk message
        },
        ...
    };
    */
    var demAFKs = bot.memory.get('afk');
    // 5 minute limit between auto-responds.
    var rateLimit = 5 * 60 * 1000,
    // 2 minutes where you can talk without escaping the afk.
        gracePeriod = 2 * 60 * 1000;

    var respondFor = function (user, msg) {
        var afkObj = demAFKs[user],
            roomId = msg.get('room_id'),
            now = Date.now();

        if (shouldReply()) {
            // Send a response and such
            msg.directreply(formulateReponse());
            afkObj.lastPing[roomId] = now;
            bot.memory.save('afk');
        }

        function formulateReponse () {
            var format = '{user} is afk{sep}{rest}';
            var data = {
                user: user,
                sep: '.',
                rest: ''
            };

            if (afkObj.msg) {
                data.sep = ': ';
                data.rest = afkObj.msg;
            }

            return format.supplant(data);
        }

        function shouldReply () {
            var lastPing = afkObj.lastPing[roomId];

            return (now - afkObj.afkSince >= gracePeriod) &&
                (!lastPing || now - lastPing >= rateLimit);
        }
    };

    var goAFK = function (name, msg) {
        var noReturn = false;

        bot.log('/afk goAFK ', name);

        if (msg.indexOf('!') === 0) {
            msg = msg.substring(1);
            noReturn = true;
        }

        demAFKs[name] = {
            afkSince: Date.now(),
            lastPing: {},
            msg: msg.trim()
        };

        if (noReturn) {
            demAFKs[name].noReturn = 1;
        }
    };

    var clearAFK = function (name) {
        bot.log('/afk clearAFK', name);
        delete demAFKs[name];
    };

    var commandHandler = function (msg) {
        // parse the message and stuff.
        var user = msg.get('user_name').replace(/\s/g, ''),
            afkMsg = msg.content;

        bot.log('/afk input', user, afkMsg);

        if (demAFKs.hasOwnProperty(user)) {
            clearAFK(user);
        }
        else {
            goAFK(user, afkMsg);
        }

        bot.memory.save('afk');
    };

    bot.addCommand({
        name: 'afk',
        fun: commandHandler,
        permissions: {
            del: 'NONE'
        },

        description: 'Set an afk message: `/afk <message>`. Invoke `/afk` ' +
            'again to return.',
        unTellable: true
    });

    bot.IO.register('input', function afkInputListener (msgObj) {
        var body = msgObj.content.toUpperCase(),
            msg = bot.prepareMessage(msgObj),

            userName = msgObj.user_name.replace(/\s/g, ''),

            now = Date.now();

        // we don't care about bot messages
        if (msgObj.user_id === bot.adapter.userid) {
            return;
        }

        if (hasReturned()) {
            bot.log('/afk he returned!', msgObj);
            commandHandler(msg);
            // We don't want to return here, as the returning user could be
            // pinging someone.
        }

        // and we don't care if the message doesn't have any pings
        if (body.indexOf('@') < 0) {
            return;
        }

        Object.keys(demAFKs).forEach(function afkCheckAndRespond (name) {
            // /(^|\b)@bob\b/i
            var pinged = new RegExp(
            '(^|\b)' + RegExp.escape('@' + name) + '\\b', 'i');

            if (pinged.test(body)) {
                bot.log('/afk responding for ' + name);
                respondFor(name, msg);
            }
        });

        function hasReturned () {
            // if the user posts, we want to release them from afk's iron grip.
            // however, to prevent activating it twice, we need to check whether
            // they're calling the bot's afk command already.
            var invokeRe = new RegExp(
                '^' + RegExp.escape(bot.config.pattern) + '\\s*\/?\\s*AFK'
            );

            return demAFKs.hasOwnProperty(userName) &&
                !invokeRe.test(body) &&
                (now - demAFKs[userName].afkSince >= gracePeriod);
        }
    });

};
